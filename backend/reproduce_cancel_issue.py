import os
import django
import sys
from decimal import Decimal

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from orders.models import Order
from orders.views import OrderViewSet
from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth import get_user_model

User = get_user_model()

def test_cancel_logic():
    print("Creating test order for cancellation...")
    # Create a dummy user for auth
    user, _ = User.objects.get_or_create(username='test_admin', defaults={'is_staff': True, 'is_superuser': True})
    
    # Create a dummy order
    order = Order.objects.create(
        customer_name="Test Cancel User",
        total=Decimal("1200.00"),
        shipping_cost=Decimal("100.00"),
        subtotal=Decimal("1100.00"),
        status='Pending'
    )
    
    print(f"Order Created: ID={order.id}, Status={order.status}, ReturnStatus={order.return_status}")
    
    # Simulate Cancel Request
    factory = APIRequestFactory()
    view = OrderViewSet.as_view({'post': 'cancel'})
    request = factory.post(f'/orders/{order.id}/cancel/')
    force_authenticate(request, user=user)
    
    print("\n--- Sending Cancel Request ---")
    response = view(request, pk=order.id)
    print(f"Response Status: {response.status_code}")
    print(f"Response Data: {response.data}")
    
    # Reload order
    order.refresh_from_db()
    print(f"Refreshed Order: Status={order.status}, ReturnStatus={order.return_status}, LossAmount={order.loss_amount}")
    
    if order.status == 'Cancelled' and order.return_status != 'Pending' and order.loss_amount == 0:
         print("SUCCESS: Order cancelled without pending return status.")
    elif order.return_status == 'Pending':
         print("FAILURE: Order has return_status 'Pending' (This is the bug).")
    else:
         print(f"FAILURE: Unexpected state. ReturnStatus={order.return_status}")

    # clean up
    order.delete()

if __name__ == '__main__':
    test_cancel_logic()
