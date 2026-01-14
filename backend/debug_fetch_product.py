import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from store.models import Product
from store.serializers import ProductSerializer

def test_fetch_product():
    print("--- Starting Fetch Product Test ---")
    
    # Get the last product (likely one from our previous test)
    product = Product.objects.last()
    if not product:
        print("No products found in DB.")
        return

    print(f"Fetching Product: {product.name} (ID: {product.id})")
    
    serializer = ProductSerializer(product)
    data = serializer.data
    
    # Check for variants_data
    variants = data.get('variants_data')
    
    print(f"Serialized 'variants_data' Count: {len(variants) if variants else 0}")
    
    if variants:
        print("Variants Data Sample:", json.dumps(variants[0], indent=2))
        print("TEST RESULT: PASSED (Variants returned)")
    else:
        print("TEST RESULT: FAILED (No variants returned)")
        # Check DB directly
        print(f"Direct DB Count: {product.product_combinations.count()}")

if __name__ == "__main__":
    test_fetch_product()
