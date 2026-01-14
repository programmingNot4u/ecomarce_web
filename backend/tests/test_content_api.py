
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from content.models import Banner, FAQ, StaticPage
User = get_user_model()

class BannerAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser('admin', 'admin@example.com', 'password')
        self.banner_data = {
            'title': 'Test Banner',
            'image': 'http://example.com/image.jpg',
            'link': '/test',
            'position': 'hero',
            'order': 1,
            'active': True
        }
        self.banner = Banner.objects.create(**self.banner_data)
        self.url = '/api/banners/'

    def test_get_banners(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_banner(self):
        self.client.force_authenticate(user=self.user)
        new_banner = {
            'title': 'New Banner',
            'image': 'http://example.com/new.jpg',
            'link': '/new',
            'position': 'hero',
            'order': 2,
            'active': True
        }
        response = self.client.post(self.url, new_banner, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Banner.objects.count(), 2)

class FAQAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser('admin', 'admin@example.com', 'password')
        self.faq_url = '/api/faqs/'
        self.faq_data = {
            'question': 'What is this?',
            'answer': 'It is a test.',
            'category': 'General',
            'order': 1
        }

    def test_create_faq(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.faq_url, self.faq_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FAQ.objects.count(), 1)
