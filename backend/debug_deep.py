import os
import django
import sys
import json

sys.path.append('c:\\programmingNot4u\\ecomarce_web\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from orders.models import Order, OrderItem
from orders.serializers import OrderSerializer

def inspect_data():
    # Find an order with items
    order = Order.objects.filter(items__isnull=False).first()
    if not order:
        print("No order with items found!")
        # Create one
        order = Order.objects.create(
            customer_name="Test User",
            phone="0123456789",
            total=100.00,
            status='Delivered',
            subtotal=100.00
        )
        OrderItem.objects.create(order=order, product_name="Test Item", price=50, quantity=2)
        print("Created dummy order with items.")
    
    print(f"Inspecting Order #{order.id}")
    print(f"DB Items count: {order.items.count()}")
    
    serializer = OrderSerializer(order)
    data = serializer.data
    
    print("\n--- Serialized Data ---")
    print(f"Customer Name: {data.get('customer_name')}")
    print(f"Items Key Exists: {'items' in data}")
    if 'items' in data:
        print(f"Items Count in JSON: {len(data['items'])}")
        print(f"Items Data: {json.dumps(data['items'], indent=2)}")
    else:
        print("Items key MISSING in JSON")

    # Check Date format
    print(f"Created At (Raw): {order.created_at}")
    print(f"Created At (Serialized): {data.get('created_at')}")
    
    # Check Address
    print(f"Shipping Address (Raw type): {type(order.shipping_address)}")
    print(f"Shipping Address (Serialized): {data.get('shipping_address')}")

if __name__ == '__main__':
    inspect_data()
