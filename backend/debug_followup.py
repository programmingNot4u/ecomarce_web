import os
import django
import sys
import json

# Setup Django Environment
sys.path.append('c:\\programmingNot4u\\ecomarce_web\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from orders.models import Order
from rest_framework.test import APIRequestFactory, force_authenticate
from orders.views import FollowUpViewSet
from django.contrib.auth import get_user_model

User = get_user_model()

def debug_response():
    # Get an admin user
    user = User.objects.filter(is_staff=True).first()
    if not user:
        print("No admin user found.")
        return

    # Check for any delivered order without followup
    pending_orders = Order.objects.filter(status='Delivered', followup__isnull=True)
    if not pending_orders.exists():
        print("No pending orders found. Creating a dummy one.")
        order = Order.objects.create(
            customer_name="Debug Customer",
            phone="0123456789",
            total=500.00,
            status='Delivered',
            subtotal=500.00,
            shipping_address={'city': 'Debug City', 'street': '123 Debug St'},
            created_at='2025-01-01 10:00:00'
        )
    else:
        print(f"Found {pending_orders.count()} pending orders.")

    factory = APIRequestFactory()
    view = FollowUpViewSet.as_view({'get': 'pending'})
    
    request = factory.get('/api/followups/pending/')
    force_authenticate(request, user=user)
    response = view(request)
    
    print(f"Response Status: {response.status_code}")
    
    data = response.data
    results = data.get('results') if isinstance(data, dict) and 'results' in data else data
    
    if results:
        first_item = results[0]
        print("--- First Item Keys ---")
        print(json.dumps(list(first_item.keys()), indent=2))
        print("--- First Item Sample Data ---")
        print(f"ID: {first_item.get('id')}")
        print(f"Customer Name: {first_item.get('customer_name')}")
        print(f"Phone: {first_item.get('phone')}")
        print(f"Created At: {first_item.get('created_at')}")
        print(f"Shipping Address Type: {type(first_item.get('shipping_address'))}")
        print(f"Shipping Address: {first_item.get('shipping_address')}")
    else:
        print("No results returned.")

if __name__ == '__main__':
    debug_response()
