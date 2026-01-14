from rest_framework import serializers
from .models import Coupon, Campaign, MarketingSettings

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'

class CampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = '__all__'

class MarketingSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketingSettings
        fields = '__all__'

    def validate_meta_pixel_id(self, value):
        if not value: return value
        
        # Check if numeric
        if not value.isdigit():
            raise serializers.ValidationError("Pixel ID must contain only numbers.")
            
        # Check length (Pixel IDs are usually 15-16 digits, but let's be safe with range 10-25)
        if len(value) < 10 or len(value) > 25:
            raise serializers.ValidationError("Pixel ID length seems invalid (expected 10-25 digits).")
            
        return value
