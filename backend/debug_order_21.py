import os
import django
import sys
import json

# Setup Django Environment
sys.path.append('c:\\programmingNot4u\\ecomarce_web\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from orders.models import Order, OrderItem
from orders.serializers import OrderSerializer

def debug_order_21():
    try:
        order = Order.objects.get(id=21)
        print(f"Found Order #21")
        print(f"Total: {order.total}")
        
        items = order.items.all()
        print(f"DB Items Count: {items.count()}")
        
        for item in items:
            print(f" - Item: {item.product_name}, Qty: {item.quantity}, Price: {item.price}")
            
        # Check Serializer Output
        serializer = OrderSerializer(order)
        data = serializer.data
        print("\n--- JSON Output ---")
        items_json = data.get('items')
        if items_json is None:
            print("Key 'items' is Missing/None")
        else:
            print(f"JSON Items Count: {len(items_json)}")
            print(json.dumps(items_json, indent=2))
            
    except Order.DoesNotExist:
        print("Order #21 does not exist in backend.")

if __name__ == '__main__':
    debug_order_21()
