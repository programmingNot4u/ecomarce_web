import os
import django
import sys

# Add the project directory to the sys.path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from orders.models import Order

try:
    # Get latest by ID to ensure it is the very last one created
    latest_order = Order.objects.latest('id')
    print(f"ID: {latest_order.id}")
    print(f"Customer: {latest_order.customer_name}")
    print(f"Email: {latest_order.email}")
    print(f"Shipping Address Type: {type(latest_order.shipping_address)}")
    print(f"Shipping Address: {latest_order.shipping_address}")
    
    # Check if it was saved as a string (common mistake)
    if isinstance(latest_order.shipping_address, str):
        print("WARNING: Shipping address is stored as a STRING, not JSON.")
        
except Order.DoesNotExist:
    print("No orders found.")
