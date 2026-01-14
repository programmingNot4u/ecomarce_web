import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIRequestFactory
from orders.reports import ReportViewSet
from django.contrib.auth import get_user_model

User = get_user_model()
factory = APIRequestFactory()

def test_view():
    print("Testing ReportViewSet...")
    
    # Create an admin user if not exists or get first admin
    admin = User.objects.filter(is_staff=True).first()
    if not admin:
        print("No admin user found. Cannot test permission.")
        return

    view = ReportViewSet.as_view({'get': 'sales_ledger'})
    request = factory.get('/api/reports/sales_ledger/')
    request.user = admin
    response = view(request)
    print(f"Sales Ledger: {response.status_code}")
    if response.status_code == 200:
        print(f"Data Sample: {response.data[:1] if response.data else 'No data'}")
    else:
        print(response.data)

    view = ReportViewSet.as_view({'get': 'product_velocity'})
    request = factory.get('/api/reports/product_velocity/')
    request.user = admin
    response = view(request)
    print(f"Product Velocity: {response.status_code}")
    if response.status_code == 200:
        print(f"Data Sample: {response.data[:1] if response.data else 'No data'}")

    view = ReportViewSet.as_view({'get': 'inventory_audit'})
    request = factory.get('/api/reports/inventory_audit/')
    request.user = admin
    response = view(request)
    print(f"Inventory Audit: {response.status_code}")
    if response.status_code == 200:
        print(f"Data Sample: {response.data[:1] if response.data else 'No data'}")

if __name__ == "__main__":
    test_view()
