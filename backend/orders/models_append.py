from django.db import models
from django.conf import settings

# ... imports ... Assuming these exist in orders/models.py
# I will append the new model to the file.

class FollowUp(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Called - No Answer', 'Called - No Answer'),
        ('Called - Successful', 'Called - Successful'),
        ('Not Interested', 'Not Interested'),
        ('Follow Later', 'Follow Later'),
    )

    order = models.OneToOneField('Order', on_delete=models.CASCADE, related_name='followup')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='followups')
    moderator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='moderated_followups')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    rating = models.IntegerField(default=0, help_text="Customer satisfaction rating 1-5")
    notes = models.TextField(blank=True)
    is_interested_in_new_products = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"FollowUp for Order #{self.order.id} - {self.status}"
