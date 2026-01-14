import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from content.models import SMSSettings
s = SMSSettings.objects.first()
if not s:
    s = SMSSettings.objects.create()
    print("Created new SMSSettings object")

print(f"Old status: {s.is_active}")
s.is_active = False
s.save()
print(f"New status: {s.is_active}")
print("Successfully disabled SMS Gateway in DB")
