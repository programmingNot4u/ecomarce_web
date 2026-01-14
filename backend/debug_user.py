from django.contrib.auth import get_user_model
import json

User = get_user_model()

try:
    user = User.objects.get(id=6)
    print(f"User ID: {user.id}")
    print(f"Username: {user.username}")
    print(f"First Name: '{user.first_name}'")
    print(f"Last Name: '{user.last_name}'")
    print(f"Shipping Address Type: {type(user.shipping_address)}")
    print(f"Shipping Address: {user.shipping_address}")
    
    # Check emptiness logic
    is_empty = not user.shipping_address or not any(user.shipping_address.values())
    print(f"Is Empty Logic Result: {is_empty}")
    
except User.DoesNotExist:
    print("User 6 does not exist")
