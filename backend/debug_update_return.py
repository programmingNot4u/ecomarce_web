import os
import django
import uuid
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from store.serializers import ProductSerializer
from store.models import Product

def test_update_return():
    print("--- Starting Update Return Test ---")
    
    # 1. Setup Product
    import time
    unique_id = f"{int(time.time())}-{str(uuid.uuid4())[:4]}"
    product = Product.objects.create(
        name=f"UpdateReturnTest-{unique_id}",
        price=100,
        sku=f"RET-{unique_id}",
        slug=f"ret-{unique_id}",
        stock_quantity=0,
        manage_stock=True
    )
    
    # 2. Payload
    payload = {
        "name": f"{product.name} Updated",
        "combinations": [ # Frontend sends this
             {"attributes": {"Size": "L"}, "price": 10, "stock_quantity": 5, "sku": f"RET-{unique_id}-L"}
        ]
    }
    
    # 3. Simulate ViewSet Update Flow
    serializer = ProductSerializer(product, data=payload, partial=True)
    if serializer.is_valid():
        serializer.save()
        print("Save complete.")
        
        # 4. Access .data (Simulating Response)
        data = serializer.data
        
        variants = data.get('variants_data')
        print(f"Returned Variants Count: {len(variants) if variants else 0}")
        if variants:
            print("Variant Sample:", variants[0])
            print("TEST RESULT: PASSED")
        else:
            print("TEST RESULT: FAILED (Empty variants in response)")
            
    else:
        print("Invalid:", serializer.errors)

if __name__ == "__main__":
    test_update_return()
