
import os
import django
from django.db.models import Sum

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from orders.models import Order

def check_orders():
    print(f"Total Orders: {Order.objects.count()}")
    
    total_revenue = Order.objects.aggregate(total=Sum('total'))['total'] or 0
    print(f"Total Revenue (All Time): {total_revenue}")
    
    pending = Order.objects.filter(status='Pending').aggregate(total=Sum('total'))['total'] or 0
    print(f"Pending Value: {pending}")

    # Check staff status of a user (hardcoded for now, or just generic check)
    from django.contrib.auth import get_user_model
    User = get_user_model()
    admin_exists = User.objects.filter(is_staff=True).exists()
    print(f"Admin User Exists: {admin_exists}")
    
    # List first 5 orders
    for o in Order.objects.all()[:5]:
        print(f"Order {o.id}: Status={o.status}, Payment={o.payment_status}, Total={o.total}, Created={o.created_at}")

if __name__ == "__main__":
    check_orders()
