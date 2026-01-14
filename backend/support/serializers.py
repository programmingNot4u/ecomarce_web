from rest_framework import serializers
from .models import SupportTicket, TicketReply

class TicketReplySerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    class Meta:
        model = TicketReply
        fields = '__all__'

class SupportTicketSerializer(serializers.ModelSerializer):
    replies = TicketReplySerializer(many=True, read_only=True)
    class Meta:
        model = SupportTicket
        fields = '__all__'
