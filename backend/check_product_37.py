import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from store.models import Product, ProductVariant
from store.serializers import ProductSerializer

def check_product_37():
    print("--- Checking Product 37 ---")
    try:
        product = Product.objects.get(id=37)
        print(f"Product Found: {product.name}")
        
        variants = product.product_combinations.all()
        print(f"DB Variant Count: {variants.count()}")
        
        for v in variants:
            print(f" - Variant ID: {v.id} | Attrs: {v.attributes} | Stock: {v.stock_quantity}")
            
        print("\n--- Serializer Output ---")
        serializer = ProductSerializer(product)
        data = serializer.data
        
        variants_data = data.get('variants_data')
        print(f"Serialized 'variants_data': {len(variants_data) if variants_data else 'None'}")
        
        if variants_data:
            print(json.dumps(variants_data, indent=2))
            
    except Product.DoesNotExist:
        print("Product 37 does not exist.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_product_37()
