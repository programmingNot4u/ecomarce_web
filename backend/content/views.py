from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Banner, FAQ, StaticPage, ThemeConfig
from .serializers import BannerSerializer, FAQSerializer, StaticPageSerializer
from .theme_serializers import ThemeConfigSerializer

class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.order_by('order')
    serializer_class = BannerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class FAQViewSet(viewsets.ModelViewSet):
    queryset = FAQ.objects.order_by('order')
    serializer_class = FAQSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class StaticPageViewSet(viewsets.ModelViewSet):
    queryset = StaticPage.objects.all()
    serializer_class = StaticPageSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser

class ThemeViewSet(viewsets.ModelViewSet):
    queryset = ThemeConfig.objects.all()
    serializer_class = ThemeConfigSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    renderer_classes = [JSONRenderer]
    parser_classes = [JSONParser]

    @action(detail=False, methods=['get'])
    def active(self, request):
        active_theme = ThemeConfig.objects.filter(is_active=True).first()
        if not active_theme:
            return Response({}) 
        serializer = self.get_serializer(active_theme)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def update_active(self, request):
        active_theme, created = ThemeConfig.objects.get_or_create(is_active=True, defaults={'name': 'Default Theme'})
        new_config = request.data.get('config', request.data)
        active_theme.config = new_config
        active_theme.save()
        return Response(ThemeConfigSerializer(active_theme).data)

from .models import SMSSettings
from .serializers import SMSSettingsSerializer

class SMSConfigViewSet(viewsets.ModelViewSet):
    queryset = SMSSettings.objects.all()
    serializer_class = SMSSettingsSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get', 'post'])
    def config(self, request):
        # Robust Singleton retrieval
        settings = SMSSettings.objects.first()
        if not settings:
            settings = SMSSettings.objects.create()
            
        if request.method == 'GET':
            serializer = self.get_serializer(settings)
            return Response(serializer.data)
        elif request.method == 'POST':
            serializer = self.get_serializer(settings, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)

    @action(detail=False, methods=['post'])
    def test_sms(self, request):
        phone_number = request.data.get('phone_number')
        if not phone_number:
            return Response({'error': 'Phone number required'}, status=400)
            
        settings = SMSSettings.objects.first()
        if not settings or not settings.is_active:
             return Response({'error': 'SMS Settings not active or configured'}, status=400)
             
        import requests
        try:
            params = {
                'api_key': settings.api_key,
                'type': 'text',
                'number': phone_number,
                'senderid': settings.sender_id if settings.sender_id else '',
                'message': 'Test SMS from Admin Panel'
            }
            response = requests.get(settings.api_url, params=params)
            return Response({
                'status_code': response.status_code,
                'response_text': response.text
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)
