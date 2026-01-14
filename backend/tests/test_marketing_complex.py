
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from marketing.models import Campaign, CampaignProduct
from store.models import Product, Category
from django.utils import timezone
import datetime

User = get_user_model()

class ComplexCampaignTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser('admin', 'admin@example.com', 'password')
        self.client.force_authenticate(user=self.user)
        
        # Create Dummy Products
        self.category = Category.objects.create(name='Electronics', slug='electronics')
        self.prod1 = Product.objects.create(name='Phone', price=1000, category=self.category)
        self.prod2 = Product.objects.create(name='Laptop', price=2000, category=self.category)

    def test_create_campaign_with_products(self):
        payload = {
            'name': 'Tech Sale',
            'campaign_type': 'flash_sale',
            'start_date': timezone.now().date(),
            'end_date': timezone.now().date() + datetime.timedelta(days=7),
            'status': 'active',
            'discount_value': 0, # Global default
            'description': 'Tech sale',
            'is_active': True,
            'campaign_products': [
                {
                    'product': self.prod1.id,
                    'discount_type': 'percentage',
                    'discount_value': 10
                },
                {
                    'product': self.prod2.id,
                    'discount_type': 'fixed',
                    'discount_value': 500
                }
            ]
        }
        
        response = self.client.post('/api/campaigns/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify DB
        campaign = Campaign.objects.get(name='Tech Sale')
        self.assertEqual(campaign.campaign_products.count(), 2)
        
        cp1 = campaign.campaign_products.get(product=self.prod1)
        self.assertEqual(cp1.discount_type, 'percentage')
        self.assertEqual(cp1.discount_value, 10)
        
        cp2 = campaign.campaign_products.get(product=self.prod2)
        self.assertEqual(cp2.discount_type, 'fixed')
        self.assertEqual(cp2.discount_value, 500)
