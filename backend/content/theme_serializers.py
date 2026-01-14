from rest_framework import serializers
from .models import ThemeConfig

class ThemeConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = ThemeConfig
        fields = ['id', 'name', 'is_active', 'config', 'updated_at']
