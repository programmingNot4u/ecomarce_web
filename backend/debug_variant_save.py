import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from store.serializers import ProductSerializer, ProductVariantSerializer
from store.models import Product, ProductVariant

def test_variant_persistence():
    print("--- Starting Variant Persistence Test ---")
    
    import uuid
    unique_id = str(uuid.uuid4())[:8]
    unique_name = f"Debug Product {unique_id}"
    # 1. Get or Create a Test Product
    product, created = Product.objects.get_or_create(
        name=unique_name,
        defaults={
            "price": 100,
            "sku": f"DEBUG-{unique_id}"
        }
    )
    print(f"Product: {product.name} (ID: {product.id})")

    # 2. Construct Payload (mimicking Frontend -> Backend Snake Case)
    # Frontend sends 'combinations' which serializer maps to 'product_combinations'
    # Nested data mimics what we send: attributes, price, stock_quantity, sku.
    # CRITICAL: We do NOT send 'product' ID in the nested item.
    
    payload = {
        "combinations": [
            {
                "attributes": {"Size": "L", "Color": "DebugBlue"},
                "price": 105.00,
                "stock_quantity": 50,
                "sku": "DEBUG-001-L-BLUE"
            }
        ]
    }
    
    print(f"Payload: {payload}")

    # 3. Instantiate Serializer with partial update
    serializer = ProductSerializer(instance=product, data=payload, partial=True)

    # 4. Validate
    if serializer.is_valid():
        print("Serializer is VALID.")
        # 5. Save
        try:
            updated_product = serializer.save()
            print("Save Successful.")
            
            # 6. Verify DB
            variants = ProductVariant.objects.filter(product=updated_product)
            print(f"Found {variants.count()} variants in DB.")
            for v in variants:
                print(f" - Variant: {v} | Stock: {v.stock_quantity}")
                
        except Exception as e:
            print(f"Save Failed with Exception: {e}")
    else:
        print("Serializer is INVALID.")
        print(f"Errors: {serializer.errors}")

if __name__ == "__main__":
    test_variant_persistence()
