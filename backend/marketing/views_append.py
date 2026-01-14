
from .serializers import MarketingSettingsSerializer

class MarketingSettingsViewSet(viewsets.ModelViewSet):
    queryset = MarketingSettings.objects.all()
    serializer_class = MarketingSettingsSerializer
    # permission_classes = [permissions.IsAdminUser] # Uncomment if needed

    def list(self, request, *args, **kwargs):
        settings, created = MarketingSettings.objects.get_or_create(id=1)
        serializer = self.get_serializer(settings)
        return Response(serializer.data)
