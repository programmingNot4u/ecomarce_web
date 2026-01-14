
import os
import django
import requests
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token # Import Token model

def get_admin_token():
    User = get_user_model()
    # Get first superuser
    admin = User.objects.filter(is_superuser=True).first()
    if not admin:
        print("No superuser found!")
        return None
    
    token, _ = Token.objects.get_or_create(user=admin) # Get DRF Token
    return token.key

def test_stats_with_auth():
    token = get_admin_token()
    if not token:
        return

    headers = {'Authorization': f'Token {token}'} # Use 'Token' prefix
    params = {
        'page': 1,
        'page_size': 10,
        'ordering': '-created_at'
    }
    
    print("Testing /orders/stats/ with params:", params)
    try:
        res = requests.get("http://127.0.0.1:8000/api/orders/stats/", headers=headers, params=params)
        print(f"Status: {res.status_code}")
        print(f"Response: {res.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_stats_with_auth()
