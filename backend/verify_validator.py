import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from store.serializers import ProductSerializer
from store.models import Product

def verify_validator():
    print("--- Starting Validator Verification ---")
    
    # Mock product (not saved to DB)
    product = Product(name="Validator Test", id=99999)

    payload = {
        "combinations": [
            {
                "attributes": {"Size": "L", "Color": "Test"},
                "price": 100.00,
                "stock_quantity": 10,
                "sku": "TEST-SKU-999"
            }
        ]
    }
    
    serializer = ProductSerializer(instance=product, data=payload, partial=True)
    
    if serializer.is_valid():
        print("VALIDATION SUCCESS: serializer.is_valid() returned True")
    else:
        print(f"VALIDATION FAILED: {serializer.errors}")

if __name__ == "__main__":
    verify_validator()
