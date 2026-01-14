
import os
import django
import requests
import json
import time

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

email = "ronyp@maryone.shop"
password = "admin" # Assumed from AdminContext

try:
    user = User.objects.get(email=email)
    print(f"Before Login: {user.last_login}")
except User.DoesNotExist:
    # Create if missing (sanity check)
    user = User.objects.create_superuser("rony", email, password)
    print("Created user")

# API Login
url = "http://localhost:9000/api/users/login/"
payload = {"email": email, "password": password}

try:
    response = requests.post(url, json=payload)
    print(f"Login Response: {response.status_code}")
    if response.status_code == 200:
        print("Login Successful via API")
    else:
        print(f"Login Failed: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")

# Check DB again
user.refresh_from_db()
print(f"After Login: {user.last_login}")
