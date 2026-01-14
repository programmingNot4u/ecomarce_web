import os
import django
import sys
from django.test import RequestFactory
from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth import get_user_model

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from orders.models import Order
from orders.views import OrderViewSet

def debug_order_2():
    print("--- Inspecting Order 2 in DB ---")
    try:
        order = Order.objects.get(id=2)
        print(f"Order ID: {order.id}")
        print(f"Status: {order.status}")
        print(f"Return Status: {order.return_status}")
        print(f"Total: {order.total}")
        print(f"Shipping Cost: {order.shipping_cost}")
        print(f"Loss Amount (DB): {order.loss_amount}")
    except Order.DoesNotExist:
        print("Order 2 not found!")
        return

    print("\n--- Testing API resolve_return (Lost) ---")
    factory = APIRequestFactory()
    view = OrderViewSet.as_view({'post': 'resolve_return'})
    
    # Simulate marking as Lost
    request = factory.post(f'/orders/{order.id}/resolve_return/', {'action': 'Lost'}, format='json')
    
    # Authenticate as admin
    User = get_user_model()
    admin = User.objects.filter(is_superuser=True).first()
    if admin:
        force_authenticate(request, user=admin)
        print(f"Authenticated as {admin.username}")
    else:
        print("No admin user found, skipping auth (might fail)")

    response = view(request, pk=order.id)
    print(f"Response Status: {response.status_code}")
    print(f"Response Data: {response.data}")

    print("\n--- Verifying persistence ---")
    order.refresh_from_db()
    print(f"New Loss Amount (DB): {order.loss_amount}")

if __name__ == '__main__':
    debug_order_2()
