
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

email = 'ronyp@maryone.shop'
password = 'admin'

if not User.objects.filter(email=email).exists():
    print(f"Creating superuser {email}...")
    User.objects.create_superuser(username=email, email=email, password=password, first_name='Rony', last_name='Parker')
    print("Superuser created.")
else:
    print(f"Superuser {email} already exists.")
