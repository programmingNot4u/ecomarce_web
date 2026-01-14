
import os
import django
import sys
import json

# Setup
sys.path.append(r'c:\programmingNot4u\ecomarce_web\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from orders.models import Order, OrderItem

def patch_order():
    try:
        # Get Order #2
        order = Order.objects.get(id=2)
        print(f"Found Order #2. Shipping Address Type: {type(order.shipping_address)}")
        
        # Patch Shipping Address (Ensure it's a dict, not a string)
        if isinstance(order.shipping_address, str):
            try:
                # Replace single quotes with double quotes for valid JSON
                fixed_json = order.shipping_address.replace("'", '"')
                order.shipping_address = json.loads(fixed_json)
                print("Converted string address to dict.")
            except:
                print("Failed to parse string address. Setting to default manual dict.")
                order.shipping_address = {
                    "name": "Md Hossan Imam Rony",
                    "street": "Uttara",
                    "city": "Dhaka",
                    "phone": "01747742519",
                    "email": "hossainimamrony71@gmail.com"
                }
        
        order.save()
        print(f"Order #2 Address Patched: {order.shipping_address}")

        # Patch Items
        items = order.items.all()
        for item in items:
            if not item.variant_info:
                print(f"Patching item {item.product_name}...")
                item.variant_info = {'Size': 'L/XL', 'Color': 'Default'}
                item.save()
                
        print("Order #2 Items Patched.")
        
    except Order.DoesNotExist:
        print("Order #2 not found.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    patch_order()
