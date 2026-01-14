import os
import django
import sys
import json
from decimal import Decimal

# Setup Django Environment
sys.path.append('c:\\programmingNot4u\\ecomarce_web\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from orders.models import Order
from orders.serializers import OrderSerializer

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return super(DecimalEncoder, self).default(obj)

def debug_specific_orders():
    ids = [21, 11, 10, 8, 1]
    orders = Order.objects.filter(id__in=ids)
    
    print(f"Found {orders.count()} orders matching IDs {ids}")
    
    serializer = OrderSerializer(orders, many=True)
    data = serializer.data
    
    for item in data:
        print(f"\n--- Order #{item.get('id')} ---")
        print(f"Customer Name (Raw): '{item.get('customer_name')}'")
        print(f"Created At: '{item.get('created_at')}'")
        print(f"Date Field: '{item.get('date')}'")
        
        # Check Shipping Address
        sa = item.get('shipping_address')
        print(f"Shipping Address (Type: {type(sa)}): {sa}")
        
        # Check fallback logic manually
        if not item.get('customer_name'):
            print("(!) Customer Name is missing from serialized data.")
            if isinstance(sa, dict):
                 print(f"   - Attempting extraction from SA: Name={sa.get('name')}, First={sa.get('firstName')}")
            else:
                 print("   - Shipping Address is NOT a dict.")

if __name__ == '__main__':
    debug_specific_orders()
