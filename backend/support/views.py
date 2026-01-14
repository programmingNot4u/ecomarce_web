from rest_framework import viewsets, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from orders.views import StandardResultsSetPagination
from .models import SupportTicket, TicketReply
from .serializers import SupportTicketSerializer, TicketReplySerializer

class SupportTicketViewSet(viewsets.ModelViewSet):
    queryset = SupportTicket.objects.all().order_by('-created_at')
    serializer_class = SupportTicketSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'status': ['exact'],
        'priority': ['exact'],
    }
    search_fields = ['subject', 'message', 'name', 'email']
    ordering_fields = ['created_at', 'priority', 'status']
    ordering = ['-created_at']

class TicketReplyViewSet(viewsets.ModelViewSet):
    queryset = TicketReply.objects.all()
    serializer_class = TicketReplySerializer

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(sender=self.request.user)
        else:
            serializer.save()
