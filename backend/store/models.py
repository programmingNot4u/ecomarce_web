from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models.signals import post_save

from django.utils.text import slugify

class Category(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    image = models.CharField(max_length=500, blank=True, null=True)  # Changed to CharField to support both file paths and URLs
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    show_in_menu = models.BooleanField(default=True)
    
    class Meta:
        verbose_name_plural = 'Categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        
        # Ensure slug uniqueness
        original_slug = self.slug
        counter = 1
        while Category.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
            self.slug = f"{original_slug}-{counter}"
            counter += 1
            
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Brand(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    logo = models.CharField(max_length=500, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
            
        # Ensure slug uniqueness
        original_slug = self.slug
        counter = 1
        while Brand.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
            self.slug = f"{original_slug}-{counter}"
            counter += 1
            
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Product(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    )

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    in_stock = models.BooleanField(default=True)
    stock_quantity = models.IntegerField(default=0)
    manage_stock = models.BooleanField(default=True)
    low_stock_threshold = models.IntegerField(default=2)
    allow_backorders = models.BooleanField(default=False)
    on_sale = models.BooleanField(default=False)
    
    def save(self, *args, **kwargs):
        # Treat empty string SKU as None to avoid unique constraint on multiple empty SKUs
        if self.sku == "":
            self.sku = None
            
        # Slug Generation & Uniqueness
        if not self.slug:
            self.slug = slugify(self.name)
            
        original_slug = self.slug
        counter = 1
        while Product.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
            self.slug = f"{original_slug}-{counter}"
            counter += 1
            
        super().save(*args, **kwargs)
    
    # Using JSONField for flexible data like images list, specifications, variants (definitions)
    images = models.JSONField(default=list) 
    variants = models.JSONField(default=list, blank=True) # Definitions e.g. [{"name": "Size", "options": ["S", "M"]}]
    
    # Analytics - can be computed but stored for caching
    rating = models.FloatField(default=0.0)
    reviews_count = models.IntegerField(default=0)

    def __str__(self):
        return self.name

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_combinations')
    attributes = models.JSONField() # e.g. {"Size": "S", "Color": "Red"}
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.IntegerField(default=0)
    sku = models.CharField(max_length=100, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.product.name} - {self.attributes}"

class Review(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    user_name = models.CharField(max_length=255) # Snapshot or for guest
    
    rating = models.IntegerField() # 1-5
    comment = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    verified_purchase = models.BooleanField(default=False)
    helpful_count = models.IntegerField(default=0)
    images = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_name} - {self.product.name}"

class InventoryLog(models.Model):
    REASON_CHOICES = (
        ('Restock', 'Restock'),
        ('Order', 'Order'),
        ('Damage', 'Damage'),
        ('Return', 'Return'),
        ('Correction', 'Correction'),
        ('Other', 'Other'),
    )

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inventory_logs')
    # Optional variant link if needed
    variant = models.ForeignKey('ProductVariant', on_delete=models.SET_NULL, null=True, blank=True)
    
    change_amount = models.IntegerField()
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    note = models.TextField(blank=True, null=True)
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.change_amount} ({self.reason})"

class Supplier(models.Model):
    name = models.CharField(max_length=255)
    contact_name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50)
    address = models.TextField(blank=True)

    def __str__(self):
        return self.name

class PurchaseOrder(models.Model):
    STATUS_CHOICES = (
        ('Draft', 'Draft'),
        ('Ordered', 'Ordered'),
        ('Received', 'Received'),
        ('Cancelled', 'Cancelled'),
    )

    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchase_orders')
    order_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    notes = models.TextField(blank=True)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    date = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Check if status changed to 'Received'
        if self.pk:
            old = PurchaseOrder.objects.filter(pk=self.pk).first()
            if old and old.status != 'Received' and self.status == 'Received':
                self.process_receipt()
        super().save(*args, **kwargs)

    def process_receipt(self):
        # Iterate items and update stock
        for item in self.items.all():
            product = item.product
            variant = item.variant
            qty = item.quantity
            
            # Update Product Stock (Global)
            product.stock_quantity += qty
            product.save()

            # Update Variant Stock if exists
            if variant:
                variant.stock_quantity += qty
                variant.save()

            # Log it
            InventoryLog.objects.create(
                product=product,
                variant=variant,
                change_amount=qty,
                reason='Restock',
                note=f"Received PO #{self.order_number}",
                user=None # System update
            )

    def __str__(self):
        return self.order_number

class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.IntegerField()
    cost = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} (x{self.quantity}) in {self.purchase_order.order_number}"

class Question(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('answered', 'Answered'),
    )

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='questions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    user_name = models.CharField(max_length=255) # Snapshot or for guest
    
    question = models.TextField()
    answer = models.TextField(blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    created_at = models.DateTimeField(auto_now_add=True)
    answer_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user_name} - {self.product.name}"

class Wishlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user} - {self.product.name}"
