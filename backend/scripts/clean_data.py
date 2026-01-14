import os
import sys
import django

# Add the project root to the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from store.models import Product, Category, Brand

print("Deleting all Products...")
Product.objects.all().delete()
print("Deleting all Categories...")
Category.objects.all().delete()
print("Deleting all Brands...")
Brand.objects.all().delete()
print("Clean up complete.")
