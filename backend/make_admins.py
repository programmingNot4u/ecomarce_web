
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# Update all users with phone numbers to be admins
updated = User.objects.filter(phone_number__isnull=False).update(is_staff=True, is_superuser=True)
print(f"Updated {updated} users to admins.")

# Verify
for u in User.objects.filter(phone_number__isnull=False):
    print(f"User {u.phone_number}: Staff={u.is_staff}, Super={u.is_superuser}")
