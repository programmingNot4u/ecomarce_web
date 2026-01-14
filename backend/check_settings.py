import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
try:
    django.setup()
    print("Django configured successfully.")
except Exception as e:
    print(f"Configuration failed: {e}")
