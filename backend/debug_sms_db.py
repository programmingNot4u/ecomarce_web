
import os
import django
import sys

# Setup Django Environment
sys.path.append('c:\\programmingNot4u\\ecomarce_web\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from content.models import SMSSettings

def debug_sms_settings():
    print("--- Debugging SMS Settings in DB ---")
    aws = SMSSettings.objects.all()
    print(f"Total Count: {aws.count()}")
    
    for i, s in enumerate(aws):
        print(f"[{i}] ID={s.id}, API_KEY='{s.api_key}', URL='{s.api_url}', Active={s.is_active}")

if __name__ == "__main__":
    debug_sms_settings()
