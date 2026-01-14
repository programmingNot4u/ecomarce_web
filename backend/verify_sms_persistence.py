
import os
import django
import sys
import requests
import json

# Setup Django Environment
sys.path.append('c:\\programmingNot4u\\ecomarce_web\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from content.models import SMSSettings
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

def test_sms_settings_persistence():
    print("--- Testing SMS Settings Persistence ---")
    
    # 1. Clear existing settings
    SMSSettings.objects.all().delete()
    print("Cleared existing settings.")

    # 2. Create settings via Model directly to ensure Model logic is technically correct first
    settings = SMSSettings.objects.create(
        api_url="http://test.com",
        api_key="old_key",
        sender_id="123",
        message_template="Old: {otp}"
    )
    print(f"Created Initial Settings: {settings.api_key}")

    # 3. Use API Client to Update (simulate Frontend)
    client = APIClient()
    # Need admin user
    admin_user, _ = User.objects.get_or_create(email='admin@test.com', defaults={'username': 'admin_test', 'is_staff': True, 'is_superuser': True})
    client.force_authenticate(user=admin_user)

    payload = {
        "api_url": "http://bulksmsbd.net/api/smsapi",
        "api_key": "SpedG27TwABIag6IiK65",
        "sender_id": "8809648905633",
        "message_template": "Your MARYONÉ login OTP is {OTP}.",
        "is_active": True
    }

    response = client.post('/api/sms-settings/config/', payload, format='json')
    if response.status_code == 200:
        print("API Update Success")
        print(f"Response Data: {response.data}")
    else:
        print(f"API Update Failed: {response.status_code} - {response.data}")
        return

    # 4. Verify Persistence in DB
    settings.refresh_from_db()
    print(f"DB State after Update: API Key={settings.api_key}, Template={settings.message_template}")

    if settings.api_key == "SpedG27TwABIag6IiK65" and settings.message_template == "Your MARYONÉ login OTP is {OTP}.":
        print("✅ SUCCESS: Settings Persisted Correctly")
    else:
        print("❌ FAILURE: Settings did not persist correctly")

if __name__ == "__main__":
    test_sms_settings_persistence()
