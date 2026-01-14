from rest_framework import serializers
from .models import Banner, FAQ, StaticPage, SMSSettings
from django.utils.text import slugify

class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = '__all__'

class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = '__all__'

class StaticPageSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False)

    class Meta:
        model = StaticPage
        fields = '__all__'

    def validate(self, data):
        if not data.get('slug') and data.get('title'):
            data['slug'] = slugify(data['title'])
        return data

class SMSSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMSSettings
        fields = '__all__'
