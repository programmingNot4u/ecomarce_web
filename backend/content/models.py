from django.db import models
from .theme_models import ThemeConfig

class Banner(models.Model):
    POSITION_CHOICES = (
        ('hero', 'Hero Slider'),
        ('grid-1', 'Grid Slot 1'),
        ('grid-2', 'Grid Slot 2'),
        ('grid-3', 'Grid Slot 3'),
        ('grid-4', 'Grid Slot 4'),
    )

    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True)
    image = models.TextField(help_text="Image URL") # Changed from ImageField to TextField/CharField for URL storage
    # For simplicity with frontend base64 uploads, we might use TextField or deal with decoding in serializer
    # I'll stick to ImageField but serializer will handle base64 decoding if needed, 
    # Or for now use TextField to store the dataURI directly (easiest for full compatibility with current frontend)
    # image_data field removed as we are using URL directly
    
    link = models.CharField(max_length=255, default='/shop')
    cta_text = models.CharField(max_length=50, default='Shop Now')
    position = models.CharField(max_length=20, choices=POSITION_CHOICES, default='hero')
    order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    
    # Styles
    background_color = models.CharField(max_length=20, default='#ffffff')
    text_color = models.CharField(max_length=20, default='#000000')
    button_color = models.CharField(max_length=20, default='#000000')
    button_text_color = models.CharField(max_length=20, default='#ffffff')

    def __str__(self):
        return self.title

class FAQ(models.Model):
    CATEGORY_CHOICES = (
        ('General', 'General'),
        ('Shipping', 'Shipping'),
        ('Payment', 'Payment'),
        ('Returns', 'Returns'),
    )
    question = models.CharField(max_length=255)
    answer = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='General')
    order = models.IntegerField(default=0)

    def __str__(self):
        return self.question

class StaticPage(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    content = models.TextField(help_text="HTML Content")
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class SMSSettings(models.Model):
    api_url = models.CharField(max_length=255, default='http://bulksmsbd.net/api/smsapi')
    api_key = models.CharField(max_length=255, default='')
    sender_id = models.CharField(max_length=50, blank=True, null=True)
    message_template = models.TextField(default='Your OTP is {otp}')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return "SMS Configuration"

    def save(self, *args, **kwargs):
        # Ensure only one exists
        if not self.pk and SMSSettings.objects.exists():
            self.pk = SMSSettings.objects.first().pk
        return super(SMSSettings, self).save(*args, **kwargs)
