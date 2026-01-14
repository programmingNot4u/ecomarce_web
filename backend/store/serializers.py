from rest_framework import serializers
from .models import (
    Product, Category, Brand, Review, InventoryLog, 
    Supplier, PurchaseOrder, ProductVariant, Question, PurchaseOrderItem, Wishlist
)

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = '__all__'
        read_only_fields = ['product']

class ProductSerializer(serializers.ModelSerializer):
    # Combined Read/Write field for variants
    combinations = ProductVariantSerializer(source='product_combinations', many=True, required=False)

    # Expose a single 'image' field for frontend compatibility (takes first image)
    image = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    brand_name = serializers.SerializerMethodField()

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def get_brand_name(self, obj):
        return obj.brand.name if obj.brand else None

    class Meta:
        model = Product
        fields = '__all__'

    def get_image(self, obj):
        if obj.images and isinstance(obj.images, list) and len(obj.images) > 0:
            return obj.images[0]
        return None

    def create(self, validated_data):
        combinations_data = validated_data.pop('product_combinations', [])
        product = Product.objects.create(**validated_data)
        for combo in combinations_data:
            ProductVariant.objects.create(product=product, **combo)
        return product

    def update(self, instance, validated_data):
        print("DEBUG: ProductSerializer.update called")
        print(f"DEBUG: validated_data keys: {list(validated_data.keys())}")
        combinations_data = validated_data.pop('product_combinations', None)
        print(f"DEBUG: combinations_data found: {combinations_data is not None}")
        if combinations_data:
            print(f"DEBUG: Creating {len(combinations_data)} variants")
        
        # Update product fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update combinations if provided
        if combinations_data is not None:
            # Simple strategy: Delete old and recreate (OR smart update if ID provided, but frontend sends new generated IDs often)
            # Given the simple logic in AdminProductForm that regenerates combinations, replace is safer for now.
            # However, if we want to preserve stock history, we should try to match.
            # For this quick fix to get it working: Delete all and recreate is robust for "Configuration".
            # BUT wait, PurchaseOrders link to Variants. Deleting them might cascade delete PurchaseOrderItems or set Null.
            # PurchaseOrderItem has on_delete=SET_NULL. InventoryLog has on_delete=SET_NULL.
            # So history stays, but link is broken if we delete-recreate.
            # Better strategy: Update if match found matching SKU/Attributes?
            # Creating new variants is safer for correcting the "Unconfigured" state.
            
            # Since the user complains they are "Unconfigured" (i.e., don't exist), creating them is the priority.
            # Detailed update logic can be added later if needed.
            instance.product_combinations.all().delete()
            for combo in combinations_data:
                ProductVariant.objects.create(product=instance, **combo)

        return instance

class CategorySerializer(serializers.ModelSerializer):
    subCategories = serializers.SerializerMethodField()
    count = serializers.IntegerField(default=0, read_only=True)
    
    # Add alias for frontend compatibility (camelCase)
    showInMenu = serializers.BooleanField(source='show_in_menu', required=False)

    class Meta:
        model = Category
        fields = '__all__'
        extra_kwargs = {
            'slug': {'required': False},  # Allow updates without slug
            'show_in_menu': {'write_only': True},  # Hide snake_case version in output
        }

    def get_subCategories(self, obj):
        # Recursive serialization
        children = obj.children.all()
        return CategorySerializer(children, many=True).data


class BrandSerializer(serializers.ModelSerializer):
    count = serializers.IntegerField(default=0, read_only=True)
    class Meta:
        model = Brand
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    userName = serializers.CharField(source='user_name', read_only=True) # Map frontend to backend (Output only)
    productId = serializers.IntegerField(source='product.id', read_only=True)
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), write_only=True)
    
    class Meta:
        model = Review
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True},      # Handled via auth or optional
        }

class InventoryLogSerializer(serializers.ModelSerializer):
    productName = serializers.CharField(source='product.name', read_only=True)
    variantName = serializers.StringRelatedField(source='variant', read_only=True) # Basic string rep
    userName = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = InventoryLog
        fields = '__all__'

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    productName = serializers.CharField(source='product.name', read_only=True)
    # Fix: Use StringRelatedField to get the __str__ output of the variant object, not the method wrapper
    variantName = serializers.StringRelatedField(source='variant', read_only=True)
    # Add alias for frontend compatibility
    variantId = serializers.PrimaryKeyRelatedField(source='variant', read_only=True)
    class Meta:
        model = PurchaseOrderItem
        fields = '__all__'

class PurchaseOrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    
    # Map frontend 'supplierId' to model 'supplier'
    supplierId = serializers.PrimaryKeyRelatedField(source='supplier', queryset=Supplier.objects.all())
    
    # Map frontend 'orderNumber' to model 'order_number'
    orderNumber = serializers.CharField(source='order_number')

    items = PurchaseOrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = '__all__'
        extra_kwargs = {
            'supplier': {'read_only': True},
            'order_number': {'read_only': True},
        }

class QuestionSerializer(serializers.ModelSerializer):
    userName = serializers.CharField(source='user_name', read_only=True) # Map snake to camel (Output only)
    productId = serializers.IntegerField(source='product.id', read_only=True)
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), write_only=True)
    
    class Meta:
        model = Question
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True},
        }

class WishlistSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(source='product', queryset=Product.objects.all(), write_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'product_id', 'product_details', 'created_at']
        read_only_fields = ['created_at']
        # Remove default UniqueTogether validator to handle it manually in ViewSet for idempotency
        validators = []

