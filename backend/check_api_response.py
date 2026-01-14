import os
import django
import sys
import json
from decimal import Decimal

# Add the project directory to the sys.path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from orders.models import Order
from orders.serializers import OrderSerializer

try:
    # Get latest order
    latest_order = Order.objects.latest('id')
    print(f"Checking Order ID: {latest_order.id}")
    
    # Serialize it exactly as the View would
    serializer = OrderSerializer(latest_order)
    data = serializer.data
    
    # Print specific fields we are debugging
    print(f"Shipping Address (Raw): {latest_order.shipping_address} (Type: {type(latest_order.shipping_address)})")
    print(f"Shipping Address (Serialized): {data.get('shipping_address')} (Type: {type(data.get('shipping_address'))})")
    print(f"Payment Method: {data.get('payment_method')}")
    print(f"Shipping Cost: {data.get('shipping_cost')}")
    
    # Print full JSON dumps to check for formatting issues
    # Use a custom encoder for Decimals if needed (DRF handles it but json.dumps needs help)
    class DecimalEncoder(json.JSONEncoder):
        def default(self, o):
            if isinstance(o, (Decimal)):
                return float(o)
            return super(DecimalEncoder, self).default(o)

    print("FULL JSON OUTPUT:")
    print(json.dumps(data, cls=DecimalEncoder, indent=2))
    
except Order.DoesNotExist:
    print("No orders found.")
except Exception as e:
    print(f"Error: {e}")
