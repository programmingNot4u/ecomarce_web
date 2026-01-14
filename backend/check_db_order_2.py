import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from orders.models import Order

def check_db_order_2():
    try:
        order = Order.objects.get(id=2)
        print(f"Order ID: {order.id}")
        print(f"Loss Amount: {order.loss_amount}")
        print(f"Return Status: {order.return_status}")
    except Order.DoesNotExist:
        print("Order 2 not found")

if __name__ == '__main__':
    check_db_order_2()
