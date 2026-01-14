import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from orders.models import Order

def check_shipping_costs():
    print("Checking recent orders for shipping costs...")
    orders = Order.objects.all().order_by('-id')[:5]
    for o in orders:
        print(f"Order #{o.id}: Status={o.status}, ShippingCost={o.shipping_cost}, Total={o.total}, Loss={o.loss_amount}, Return={o.return_status}")

if __name__ == '__main__':
    check_shipping_costs()
