import os
import django
import sys
import json

# Setup Django Environment
sys.path.append('c:\\programmingNot4u\\ecomarce_web\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from orders.models import Order, FollowUp
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from orders.views import FollowUpViewSet

User = get_user_model()

def run_check():
    print("--- Starting Follow Up Verification ---")
    
    # 1. Setup Data
    user, _ = User.objects.get_or_create(username='admin_check', defaults={'is_staff': True, 'is_superuser': True})
    
    # Create a delivered order
    order = Order.objects.create(
        customer_name="Test Customer",
        phone="01700000000",
        total=1000,
        status='Delivered',
        subtotal=1000,
        shipping_cost=0
    )
    print(f"Created Delivered Order: #{order.id}")

    # 2. Test Pending Endpoint
    factory = APIRequestFactory()
    view = FollowUpViewSet.as_view({'get': 'pending'})
    
    request = factory.get('/api/followups/pending/')
    force_authenticate(request, user=user)
    response = view(request)
    
    print(f"Pending Orders Status: {response.status_code}")
    # Check if our order is in the list
    found = False
    data = response.data.get('results', response.data) if 'results' in response.data else response.data
    for item in data:
        if item['id'] == order.id:
            found = True
            break
            
    if found:
        print("SUCCESS: Order found in pending list.")
    else:
        print("FAILURE: Order NOT found in pending list.")

    # 3. Create FollowUp
    create_view = FollowUpViewSet.as_view({'post': 'create'})
    post_data = {
        'order': order.id,
        'status': 'Called - Successful',
        'rating': 5,
        'notes': 'Test Note',
        'is_interested_in_new_products': True
    }
    request = factory.post('/api/followups/', post_data, format='json')
    force_authenticate(request, user=user)
    response = create_view(request)
    
    print(f"Create FollowUp Status: {response.status_code}")
    if response.status_code == 201:
        print("SUCCESS: FollowUp created.")
    else:
        print(f"FAILURE: Could not create FollowUp. Errors: {response.data}")

    # 4. Test Pending Endpoint Again (Should be gone)
    request = factory.get('/api/followups/pending/')
    force_authenticate(request, user=user)
    response = view(request)
    
    data = response.data.get('results', response.data) if 'results' in response.data else response.data
    found = False
    for item in data:
        if item['id'] == order.id:
            found = True
            break
            
    if not found:
        print("SUCCESS: Order correctly removed from pending list.")
    else:
        print("FAILURE: Order still in pending list.")

    # Cleanup
    order.delete()
    print("--- Verification Complete ---")

if __name__ == '__main__':
    try:
        run_check()
    except Exception as e:
        print(f"Error: {e}")
