from django.db import models
from django.conf import settings
from store.models import Product

class Order(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    )
    PAYMENT_STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
        ('Failed', 'Failed'),
        ('Refunded', 'Refunded'),
    )
    VERIFICATION_STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Verified', 'Verified'),
        ('Unreachable', 'Unreachable'),
    )

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    
    # Guest info if no user account
    customer_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20)
    
    shipping_address = models.JSONField(default=dict) # {name, street, city...}
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='Pending')
    payment_method = models.CharField(max_length=50, default='COD')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Fulfillment
    courier_name = models.CharField(max_length=50, blank=True, null=True) # Pathao, Steadfast, Manual
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS_CHOICES, default='Pending')
    
    # Return logic
    return_status = models.CharField(max_length=20, default='None') # Pending, Returned, Lost
    loss_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.customer_name}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    # Snapshot of product details at time of purchase
    product_name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=1)
    image = models.URLField(blank=True, null=True)
    variant_info = models.JSONField(blank=True, null=True) # Selected size/color

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"

class VerificationLog(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='verification_logs')
    admin_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50) # Call, SMS
    outcome = models.CharField(max_length=50) # Connected, No Answer
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

class PaymentMethod(models.Model):
    name = models.CharField(max_length=50) # Bkash, Nagad, ROCKET
    type = models.CharField(max_length=20, choices=(('manual', 'Manual'), ('gateway', 'Gateway'), ('cod', 'COD')), default='manual')
    number = models.CharField(max_length=20, blank=True, null=True) # 01XXXXXXXXX
    instructions = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    logo = models.ImageField(upload_to='payment_logos/', blank=True, null=True)

    def __str__(self):
        return self.name

class FollowUp(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Called - No Answer', 'Called - No Answer'),
        ('Called - Successful', 'Called - Successful'),
        ('Not Interested', 'Not Interested'),
        ('Follow Later', 'Follow Later'),
    )

    FOLLOWUP_TYPE_CHOICES = (
        ('Post-Purchase', 'Post-Purchase'),
        ('Recurring', 'Recurring'),
        ('Win-back', 'Win-back'),
        ('Other', 'Other'),
    )

    order = models.ForeignKey('Order', on_delete=models.SET_NULL, related_name='followups', null=True, blank=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='followups', null=True, blank=True)
    moderator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='moderated_followups')
    followup_type = models.CharField(max_length=20, choices=FOLLOWUP_TYPE_CHOICES, default='Post-Purchase')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    rating = models.IntegerField(default=0, help_text="Customer satisfaction rating 1-5")
    notes = models.TextField(blank=True)
    is_interested_in_new_products = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.followup_type} - {self.customer} - {self.status}"

class PaymentSettings(models.Model):
    vat_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=5.00)
    inside_dhaka_shipping = models.DecimalField(max_digits=10, decimal_places=2, default=60.00)
    outside_dhaka_shipping = models.DecimalField(max_digits=10, decimal_places=2, default=120.00)
    
    def save(self, *args, **kwargs):
        # Singleton logic: ensure only one instance exists
        if not self.pk and PaymentSettings.objects.exists():
            # If trying to create a new one but one exists, update the existing one instead
            existing = PaymentSettings.objects.first()
            existing.vat_percentage = self.vat_percentage
            existing.inside_dhaka_shipping = self.inside_dhaka_shipping
            existing.outside_dhaka_shipping = self.outside_dhaka_shipping
            return existing.save()
        return super().save(*args, **kwargs)

    def __str__(self):
        return "Global Payment Settings"
