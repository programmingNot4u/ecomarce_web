
import os
import django
import random
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from orders.serializers import OrderSerializer
from users.models import User
from orders.models import Order
from store.models import Product

def verify_guest_conversion():
    # 1. Generate random phone number
    phone = f"017{''.join([str(random.randint(0, 9)) for _ in range(8)])}"
    print(f"Testing with Phone: {phone}")
    
    # Ensure user doesn't exist
    if User.objects.filter(phone_number=phone).exists():
        print("User already exists, deleting for test...")
        User.objects.filter(phone_number=phone).delete()

    # 2. Create Order Payload
    # Make sure we have at least one product
    product = Product.objects.first()
    if not product:
        print("No products in DB to test with.")
        return

    data = {
        'customer_name': 'Test Guest',
        'phone': phone,
        'email': f'test_{phone}@example.com',
        'shipping_address': {'name': 'Test Guest', 'address': '123 Test St', 'city': 'Dhaka'},
        'payment_method': 'COD',
        'subtotal': 100,
        'total': 120,
        'cart_items': [
            {'id': product.id, 'quantity': 1, 'price': 100, 'name': product.name}
        ]
    }

    # 3. Simulate Serializer Creation
    print("Creating Order...")
    serializer = OrderSerializer(data=data)
    if serializer.is_valid():
        order = serializer.save()
        print(f"Order Created: #{order.id}")
        
        # 4. Verify User Creation
        try:
            user = User.objects.get(phone_number=phone)
            print(f"SUCCESS: User created for {phone}")
            print(f"User ID: {user.id}, Username: {user.username}")
            
            # 5. Verify Link
            if order.customer == user:
                print("SUCCESS: Order is linked to the new User.")
            else:
                print(f"FAILURE: Order customer {order.customer} != User {user}")

        except User.DoesNotExist:
            print("FAILURE: User was NOT created.")
            
    else:
        print("Serializer Validaton Failed:")
        print(serializer.errors)

if __name__ == '__main__':
    verify_guest_conversion()
