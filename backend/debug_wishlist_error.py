import requests
import json
import os
import django

# Setup Django standalone to access models if needed, but requests are external.
# actually, better to just use requests.

API_URL = "http://127.0.0.1:8000/api/wishlist/"
# Need a user token or session. 
# Since I cannot easily get a valid token without login flow, I will assume the server is running and accessible.
# I will try to use the `requests` approach but I need authentication.

# Alternative: Use Django test client in a script.
import sys
sys.path.append('c:\\programmingNot4u\\ecomarce_web\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from store.models import Product, Wishlist

User = get_user_model()
# Get a user and product
user = User.objects.first()
if not user:
    print("No user found")
    sys.exit(1)

product = Product.objects.first()
if not product:
    print("No product found")
    sys.exit(1)

print(f"User: {user.username}, Product: {product.name} ({product.id})")

client = APIClient()
client.force_authenticate(user=user)

# 1. Clear existing
Wishlist.objects.filter(user=user, product=product).delete()

# 2. Add first time
print("First Add:")
response = client.post(API_URL, {'productId': product.id}, format='json')
print(f"Status: {response.status_code}")
print(f"Body: {response.content.decode()}")

# 3. Add second time (Duplicate)
print("\nSecond Add (Duplicate):")
response = client.post(API_URL, {'productId': product.id}, format='json')
print(f"Status: {response.status_code}")
print(f"Body: {response.content.decode()}")
