import os
import django
import sys
from decimal import Decimal

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from orders.models import Order

def fix_loss_data():
    print("Scanning for orders with 0 loss amount...")
    
    # 1. Fix 'Lost' orders (Should be Total)
    lost_orders = Order.objects.filter(return_status='Lost', loss_amount=0)
    print(f"Found {lost_orders.count()} 'Lost' orders with 0 loss.")
    
    for o in lost_orders:
        o.loss_amount = o.total
        o.save()
        print(f"Fixed Order #{o.id} (Lost): Set Loss to {o.total}")

    # 2. Fix 'Returned' orders (Should be Shipping Cost)
    returned_orders = Order.objects.filter(return_status='Returned', loss_amount=0)
    print(f"Found {returned_orders.count()} 'Returned' orders with 0 loss.")
    
    for o in returned_orders:
        o.loss_amount = o.shipping_cost
        o.save()
        print(f"Fixed Order #{o.id} (Returned): Set Loss to {o.shipping_cost}")

    print("Data fix complete.")

if __name__ == '__main__':
    fix_loss_data()
