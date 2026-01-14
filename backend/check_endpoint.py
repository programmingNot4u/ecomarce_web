import requests
import json
import os
import django

# We don't need django setup for requests, just standard lib
# But we need basic auth if we were authenticated. 
# The view allows AllowAny for retrieve/create but IsAuthenticated for list?
# Let's check views.py again. get_permissions.
# if self.action in ['create', 'retrieve']: AllowAny
# else: IsAuthenticated (list)
# So we need a token or session. 
# Wait, user is admin. 
# We can try to login first or use a known token.
# Or we can temporarily open the permissions in views.py if needed.
# But let's try to simulate what we can.

# Actually, the quickest way to check raw response including Renderers WITHOUT auth hassle
# is to use Django RequestFactory or Client inside the django environment, 
# because Client runs through the middleware chain.

import sys
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from users.models import User

# Get an admin user
admin = User.objects.filter(is_staff=True).first()
if not admin:
    print("No admin user found")
else:
    c = Client()
    c.force_login(admin)
    response = c.get('/api/orders/')
    
    print("Status Code:", response.status_code)
    try:
        data = response.json()
        print("Response Keys (Top Level):", data.keys() if isinstance(data, dict) else "List")
        
        if isinstance(data, list) and len(data) > 0:
            print("First Item Keys:", data[0].keys())
            print("First Item Sample:", json.dumps(data[0], indent=2))
        elif isinstance(data, dict) and 'results' in data:
            print("Pagination Detected. First Item Keys:", data['results'][0].keys())
            print("First Item Sample:", json.dumps(data['results'][0], indent=2))
            
    except Exception as e:
        print("Raw Content (Not JSON):", response.content)
