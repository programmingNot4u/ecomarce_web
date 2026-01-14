from django.db import models
from store.models import Product

class Coupon(models.Model):
    TYPE_CHOICES = (
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    )

    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    
    min_purchase = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    usage_limit = models.IntegerField(default=0) # 0 = unlimited
    used_count = models.IntegerField(default=0)
    
    expiry_date = models.DateField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.code

class Campaign(models.Model):
    TYPE_CHOICES = (
        ('flash_sale', 'Flash Sale'),
        ('bundle', 'Bundle'),
        ('loyalty', 'Loyalty'),
    )
    
    name = models.CharField(max_length=255)
    campaign_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    
    start_date = models.DateField()
    end_date = models.DateField()
    
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    
    # affected_products is replaced by CampaignProduct model
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class CampaignProduct(models.Model):
    campaign = models.ForeignKey(Campaign, related_name='campaign_products', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    
    # Override global discount if needed, otherwise use campaign default?
    # Actually user wants individual specific discount, so let's make it required or optional
    discount_type = models.CharField(max_length=20, choices=Coupon.TYPE_CHOICES, default='percentage')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.campaign.name} - {self.product.name}"

class MarketingSettings(models.Model):
    meta_pixel_id = models.CharField(max_length=50, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.pk and MarketingSettings.objects.exists():
            return MarketingSettings.objects.first().save()
        return super().save(*args, **kwargs)

    def __str__(self):
        return "Marketing Settings"
