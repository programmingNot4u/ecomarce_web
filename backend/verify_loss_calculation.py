import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from orders.models import Order
from decimal import Decimal

def test_resolve_return_logic():
    print("Creating test order...")
    # Create a dummy order with total value
    order = Order.objects.create(
        customer_name="Test Loss User",
        total=Decimal("1200.00"),
        shipping_cost=Decimal("100.00"),
        subtotal=Decimal("1100.00"),
        status='Cancelled',
        return_status='Pending'
    )
    
    print(f"Order Created: ID={order.id}, Total={order.total}")
    
    # Simulate Logic from View
    print("\n--- Simulating 'Lost' Action ---")
    action = 'Lost'
    if action == 'Lost':
        order.loss_amount = order.total
        print(f"Set loss_amount to order.total: {order.total}")
        
    order.save()
    
    # Reload and check
    order.refresh_from_db()
    print(f"Refreshed Order: ReturnStatus={order.return_status}, LossAmount={order.loss_amount}")
    
    if order.loss_amount == Decimal("1200.00"):
        print("SUCCESS: Loss amount matches total.")
    else:
        print(f"FAILURE: Loss amount {order.loss_amount} does not match total {Decimal('1200.00')}")

    # clean up
    order.delete()

if __name__ == '__main__':
    test_resolve_return_logic()
