
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from marketing.models import Coupon
from django.utils import timezone
import datetime

class CouponAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.coupon_url = '/api/coupons/'
        self.validate_url = '/api/coupons/validate/'
        
        self.valid_coupon = Coupon.objects.create(
            code='TEST10',
            discount_type='percentage',
            value=10.0,
            expiry_date=timezone.now().date() + datetime.timedelta(days=10),
            is_active=True,
            usage_limit=100
        )
        
        self.expired_coupon = Coupon.objects.create(
            code='EXPIRED',
            discount_type='fixed',
            value=50.0,
            expiry_date=timezone.now().date() - datetime.timedelta(days=1),
            is_active=True
        )

    def test_validate_valid_coupon(self):
        response = self.client.post(self.validate_url, {'code': 'TEST10'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['valid'])
        self.assertEqual(response.data['value'], 10.0)

    def test_validate_expired_coupon(self):
        response = self.client.post(self.validate_url, {'code': 'EXPIRED'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Coupon expired')

    def test_validate_invalid_code(self):
        response = self.client.post(self.validate_url, {'code': 'INVALID'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
