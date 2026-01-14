import os
import django
import requests
import json

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# Create/Get Admin User for auth
admin_user, created = User.objects.get_or_create(username='testadmin', defaults={'email': 'admin@test.com', 'is_staff': True, 'is_superuser': True})
if created:
    admin_user.set_password('password123')
    admin_user.save()

# Get Token (assuming simple JWT or Token auth, but for script we can use requests if we had token. 
# Alternatively, I can test the View logic directly via APIClient)

from rest_framework.test import APIClient
client = APIClient()
client.force_authenticate(user=admin_user)

print("--- Testing Payment Settings API ---")

# 1. Test GET
print("\n[GET] /api/payment-settings/")
response = client.get('/api/payment-settings/')
print(f"Status: {response.status_code}")
print(f"Data: {response.json()}")

# 2. Test POST (Update)
print("\n[POST] /api/payment-settings/ (Update VAT to 10%)")
payload = {
    'vat_percentage': 10.0,
    'inside_dhaka_shipping': 50.0,
    'outside_dhaka_shipping': 100.0
}
response = client.post('/api/payment-settings/', payload, format='json')
print(f"Status: {response.status_code}")
try:
    print(f"Data: {response.json()}")
except:
    print(f"Content: {response.content}")

# 3. Test Partial Update via POST
print("\n[POST] /api/payment-settings/ (Partial Update VAT to 7%)")
payload = {
    'vat_percentage': 7.0
}
response = client.post('/api/payment-settings/', payload, format='json')
print(f"Status: {response.status_code}")
print(f"Data: {response.json()}")
