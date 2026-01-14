
import os
import django
from django.conf import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
users = User.objects.all()

print(f"{'Username':<20} | {'Email':<30} | {'Last Login':<30}")
print("-" * 80)
for u in users:
    print(f"{u.username:<20} | {u.email:<30} | {str(u.last_login):<30}")
