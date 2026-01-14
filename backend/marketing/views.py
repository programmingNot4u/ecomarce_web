from rest_framework import viewsets, permissions
from .models import Coupon, Campaign, CampaignProduct, MarketingSettings
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from rest_framework import status
from .serializers import MarketingSettingsSerializer

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'

class CampaignProductSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_image = serializers.ReadOnlyField(source='product.images') # You might need a serializer method field for image URL

    class Meta:
        model = CampaignProduct
        fields = ['id', 'product', 'product_name', 'product_image', 'discount_type', 'discount_value']

class CampaignSerializer(serializers.ModelSerializer):
    campaign_products = CampaignProductSerializer(many=True, required=False)
    status = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = ['id', 'name', 'campaign_type', 'start_date', 'end_date', 'status', 'discount_value', 'description', 'campaign_products', 'is_active']

    def get_status(self, obj):
        today = timezone.now().date()
        if obj.start_date > today: return 'scheduled'
        if obj.end_date < today: return 'ended'
        return 'active'

    def create(self, validated_data):
        products_data = validated_data.pop('campaign_products', [])
        campaign = Campaign.objects.create(**validated_data)
        for product_data in products_data:
            CampaignProduct.objects.create(campaign=campaign, **product_data)
        return campaign

    def update(self, instance, validated_data):
        products_data = validated_data.pop('campaign_products', None)
        
        instance.name = validated_data.get('name', instance.name)
        instance.campaign_type = validated_data.get('campaign_type', instance.campaign_type)
        instance.start_date = validated_data.get('start_date', instance.start_date)
        instance.end_date = validated_data.get('end_date', instance.end_date)
        # Status is derived, not stored
        instance.discount_value = validated_data.get('discount_value', instance.discount_value)
        instance.description = validated_data.get('description', instance.description)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.save()

        if products_data is not None:
            instance.campaign_products.all().delete()
            for product_data in products_data:
                CampaignProduct.objects.create(campaign=instance, **product_data)
        
        return instance

class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def validate(self, request):
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            coupon = Coupon.objects.get(code=code.upper(), is_active=True)
            
            # Check if expired
            if coupon.expiry_date < timezone.now().date():
                return Response({'error': 'Coupon expired'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check usage limit
            if coupon.usage_limit > 0 and coupon.used_count >= coupon.usage_limit:
                return Response({'error': 'Coupon usage limit reached'}, status=status.HTTP_400_BAD_REQUEST)
                
            return Response({
                'valid': True,
                'code': coupon.code,
                'type': coupon.discount_type,
                'value': coupon.value,
                'min_purchase': coupon.min_purchase
            })
            
        except Coupon.DoesNotExist:
            return Response({'error': 'Invalid coupon code'}, status=status.HTTP_404_NOT_FOUND)

class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer

class MarketingSettingsViewSet(viewsets.ModelViewSet):
    queryset = MarketingSettings.objects.all()
    serializer_class = MarketingSettingsSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def list(self, request, *args, **kwargs):
        settings, created = MarketingSettings.objects.get_or_create(id=1)
        serializer = self.get_serializer(settings)
        return Response(serializer.data)
