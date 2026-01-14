import os
import django
import uuid
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from store.serializers import ProductSerializer, ProductVariantSerializer
from store.models import Product, ProductVariant

def test_full_update_flow():
    print("--- Starting Product Update Flow Test ---")
    
    import time
    unique_id = f"{int(time.time())}-{str(uuid.uuid4())[:4]}"
    unique_name = f"KeyTest-{unique_id}"
    
    print(f"Step 1: Creating Product {unique_name}")
    try:
        product = Product.objects.create(
            name=unique_name,
            price=100,
            sku=f"PAYLOAD-{unique_id}",
            slug=f"payload-test-{unique_id}",
            stock_quantity=0,
            manage_stock=True
        )
        print(f"Step 1 Complete: Created ID {product.id}")
    except Exception as e:
        print(f"Step 1 Failed: {e}")
        # Try to recover by getting last product
        product = Product.objects.last()
        if product:
            print(f"Recovered: Using existing product ID {product.id}")
        else:
             return
    
    # 2. Simulate Payload from ProductContext.updateProduct
    # This matches the structure AFTER the frontend transformation
    # context: payload.combinations = ... (snake_case inside)
    payload = {
        "name": f"{unique_name} Updated",
        "stock_quantity": 50, # Transformed from stockQuantity
        "manage_stock": True,
        "combinations": [
            {
                "attributes": {"Size": "L", "Color": "Integration"},
                "price": 120.00,
                "stock_quantity": 15, # Transformed from stockQuantity
                "sku": f"INT-{unique_id}-L"
            },
             {
                "attributes": {"Size": "M", "Color": "Integration"},
                "price": 120.00,
                "stock_quantity": 20,
                "sku": f"INT-{unique_id}-M"
            }
        ]
    }
    
    print("Simulated Payload:", json.dumps(payload, indent=2))
    
    # 3. Initialize Serializer (Partial Update)
    serializer = ProductSerializer(instance=product, data=payload, partial=True)
    
    # 4. Validate
    if serializer.is_valid():
        print("Serializer VALID.")
        print("Validated Data Keys:", list(serializer.validated_data.keys()))
        
        # 5. Save (Update)
        try:
            updated_product = serializer.save()
            print("Save Successful.")
            
            # 6. Verify Variants in DB
            variants = ProductVariant.objects.filter(product=updated_product)
            print(f"DB Variant Count: {variants.count()}")
            for v in variants:
                print(f" - Found Variant: {v.attributes} | Stock: {v.stock_quantity}")
                
            if variants.count() == 2:
                print("TEST RESULT: PASSED")
            else:
                print("TEST RESULT: FAILED (Count mismatch)")
                
        except Exception as e:
            print(f"Save Failed: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("Serializer INVALID.")
        print("Errors:", json.dumps(serializer.errors, indent=2))

if __name__ == "__main__":
    test_full_update_flow()
