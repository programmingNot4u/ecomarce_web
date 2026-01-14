
from rest_framework import viewsets, filters, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from orders.views import StandardResultsSetPagination
from .models import (
    Product, Category, Brand, Review, InventoryLog, 
    Supplier, PurchaseOrder, ProductVariant, Question, Wishlist
)
from .serializers import (
    ProductSerializer, CategorySerializer, BrandSerializer, 
    ReviewSerializer, InventoryLogSerializer, SupplierSerializer, 
    PurchaseOrderSerializer, QuestionSerializer, WishlistSerializer
)

import json

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    # lookup_field = 'slug' # Removed to allow ID based updates easier for Admin

    def list(self, request, *args, **kwargs):
        # Only list root categories, serializer handles recursion
        queryset = self.get_queryset().filter(parent__isnull=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def perform_update(self, serializer):
        # Handle file upload for image field (which is now a CharField)
        image_file = self.request.FILES.get('image')
        if image_file:
            # Save the file and store the path
            from django.core.files.storage import default_storage
            import os
            
            # Create a unique filename
            filename = f"categories/{image_file.name}"
            file_path = default_storage.save(filename, image_file)
            
            # Get the URL (or path) to store in the CharField
            if hasattr(default_storage, 'url'):
                image_url = default_storage.url(file_path)
            else:
                image_url = file_path
            
            # Update the instance with the file path/URL
            serializer.save(image=image_url)
        else:
            # If no file, just save normally (handles URL strings and other updates)
            serializer.save()



class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    # lookup_field = 'slug'

    permission_classes = [IsAuthenticatedOrReadOnly]

from rest_framework.decorators import action
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from orders.views import StandardResultsSetPagination 
from .models import InventoryLog, ProductVariant
from .serializers import InventoryLogSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-id')
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'brand': ['exact'],
        'status': ['exact'],
        'on_sale': ['exact'],
        'in_stock': ['exact'],
    }
    search_fields = ['name', 'description', 'sku', 'category__name', 'brand__name']
    ordering_fields = ['price', 'rating', 'id', 'stock_quantity']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Custom Recursive Category Filter
        category_id = self.request.query_params.get('category')
        if category_id:
            try:
                # Helper to get all subcategories
                def get_all_subcategories(category):
                    subcats = list(category.children.all())
                    for sub in subcats:
                        subcats.extend(get_all_subcategories(sub))
                    return subcats

                category = Category.objects.get(id=category_id)
                all_categories = [category] + get_all_subcategories(category)
                queryset = queryset.filter(category__in=all_categories)
            except (Category.DoesNotExist, ValueError):
                pass # Ignore invalid category Ids
                
        return queryset

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticatedOrReadOnly])
    def adjust_stock(self, request, pk=None):
        product = self.get_object()
        # CamelCaseJSONParser converts 'changeAmount' -> 'change_amount'
        change_amount = int(request.data.get('change_amount', request.data.get('changeAmount', 0)))
        reason = request.data.get('reason', 'Correction')
        note = request.data.get('note', '')
        variant_id = request.data.get('variant_id', request.data.get('variantId')) # Optional

        with transaction.atomic():
            if variant_id:
                try:
                    variant = ProductVariant.objects.get(id=variant_id, product=product)
                    variant.stock_quantity += change_amount
                    variant.save()
                    # Also update main product count if it manages aggregated stock? 
                    # For now, let's just update variant.
                    
                    # Create Log
                    InventoryLog.objects.create(
                        product=product,
                        variant=variant,
                        change_amount=change_amount,
                        reason=reason,
                        note=note,
                        user=request.user if request.user.is_authenticated else None
                    )
                    return Response({'status': 'success', 'new_stock': variant.stock_quantity})
                except ProductVariant.DoesNotExist:
                     return Response({'error': 'Variant not found'}, status=404)
            else:
                product.stock_quantity += change_amount
                product.save()
                
                InventoryLog.objects.create(
                    product=product,
                    change_amount=change_amount,
                    reason=reason,
                    note=note,
                    user=request.user if request.user.is_authenticated else None
                )
                return Response({'status': 'success', 'new_stock': product.stock_quantity})

                return Response({'status': 'success', 'new_stock': product.stock_quantity})

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'status': ['exact'],
        'product': ['exact'],
        'rating': ['gte', 'lte', 'exact'],
        'verified_purchase': ['exact']
    }
    search_fields = ['user_name', 'comment', 'product__name']
    ordering_fields = ['created_at', 'rating', 'status']
    ordering = ['-created_at']

class InventoryLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = InventoryLog.objects.all().order_by('-created_at')
    serializer_class = InventoryLogSerializer
    permission_classes = [permissions.IsAuthenticated]

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated]

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all().order_by('-created_at')
    serializer_class = PurchaseOrderSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'status': ['exact'],
        'supplier': ['exact'],
        'created_at': ['gte', 'lte'],
    }
    search_fields = ['id', 'supplier__name', 'items__product__name']
    ordering_fields = ['created_at', 'total_cost', 'status']

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all().order_by('-created_at')
    serializer_class = QuestionSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'status': ['exact'],
        'product': ['exact'],
    }
    search_fields = ['user_name', 'question', 'product__name']
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def answer(self, request, pk=None):
        question = self.get_object()
        answer_text = request.data.get('answer')
        
        if not answer_text:
             return Response({'error': 'Answer is required'}, status=400)
             
        question.answer = answer_text
        question.status = 'answered'
        question.answer_date = timezone.now()
        question.save()
        
        return Response(self.get_serializer(question).data)

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        # Custom idempotent create
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        product = serializer.validated_data['product']
        wishlist_item, created = Wishlist.objects.get_or_create(
            user=request.user,
            product=product
        )
        
        # Serialize the instance (whether new or existing)
        # Re-use the existing serializer instance or create new one with instance
        headers = self.get_success_headers(serializer.data)
        return Response(WishlistSerializer(wishlist_item).data, status=201 if created else 200, headers=headers)

    def perform_create(self, serializer):
        # Not used because we overrode create, but kept for safety if needed
        serializer.save(user=self.request.user)
