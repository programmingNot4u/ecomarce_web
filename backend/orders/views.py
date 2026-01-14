from rest_framework import viewsets, status, filters
from django.db.models import Sum
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from .models import Order, VerificationLog, PaymentMethod, FollowUp, PaymentSettings
from .serializers import (
    OrderSerializer, VerificationLogSerializer, PaymentMethodSerializer,
    FollowUpSerializer, PaymentSettingsSerializer
)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'status': ['exact'],
        'payment_status': ['exact'],
        'created_at': ['gte', 'lte'],
        'customer__id': ['exact'],
    }
    search_fields = ['id', 'customer_name', 'email', 'phone', 'transaction_id']
    ordering_fields = ['created_at', 'total', 'status']
    
    def get_permissions(self):
        if self.action in ['create', 'retrieve', 'proxy_image']: 
            return [AllowAny()] # Allow guests to create, view, and use proxy
        return [IsAuthenticated()] # Admins or Users for list/update

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all().order_by('-created_at')
        if user.is_authenticated:
            return Order.objects.filter(customer=user).order_by('-created_at')
        return Order.objects.none() # Guests can't list orders, they only see one after creation via direct ID if allowed

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def stats(self, request):
        print(f"Stats Request - User: {request.user}, Params: {request.query_params}")
        queryset = self.filter_queryset(Order.objects.all())
        print(f"Stats Queryset Count: {queryset.count()}")
        
        total_revenue = queryset.aggregate(total=Sum('total'))['total'] or 0
        total_loss = queryset.aggregate(total=Sum('loss_amount'))['total'] or 0
        pending_value = queryset.filter(status='Pending').aggregate(total=Sum('total'))['total'] or 0
        count = queryset.count()
        
        print(f"Calculated Stats - Rev: {total_revenue}, Pending: {pending_value}, Loss: {total_loss}")
        
        return Response({
            'total_revenue': total_revenue,
            'pending_value': pending_value,
            'total_loss': total_loss,
            'count': count
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def add_log(self, request, pk=None):
        order = self.get_object()
        serializer = VerificationLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(order=order, admin_user=request.user)
            
            # Auto-update status based on outcome
            outcome = serializer.validated_data.get('outcome')
            if outcome == 'Confirmed':
                order.verification_status = 'Verified'
                order.save()
            elif outcome in ['Wrong Number', 'No Answer']:
                order.verification_status = 'Unreachable'
                order.save()

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def ship(self, request, pk=None):
        order = self.get_object()
        courier_name = request.data.get('courier_name', 'Manual')
        
        from .services import CourierService
        shipment = CourierService.create_shipment(order, courier_name)
        
        order.status = 'Shipped'
        order.courier_name = courier_name
        order.tracking_number = shipment['tracking_number']
        order.save()
        
        return Response({
            'status': 'Shipped',
            'tracking_number': order.tracking_number,
            'label_url': shipment['label_url']
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancel(self, request, pk=None):
        order = self.get_object()
        
        if order.status in ['Shipped', 'Delivered', 'Cancelled']:
            return Response({'error': 'Cannot cancel order in current status'}, status=400)
            
        order.status = 'Cancelled'
        order.return_status = 'None' # Fix: Do not trigger return logic for pre-shipping cancellation
        order.loss_amount = 0 # Ensure no loss is calculated
        order.save()
        
        # Restore Stock
        from store.models import InventoryLog
        for item in order.items.all():
            if item.product and item.product.manage_stock:
                item.product.stock_quantity += item.quantity
                item.product.save()
                
                InventoryLog.objects.create(
                    product=item.product,
                    change_amount=item.quantity,
                    reason='Correction', # Or 'Order Cancelled'
                    note=f'Order #{order.id} Cancelled',
                    user=request.user if not request.user.is_anonymous else None
                )
        
        return Response({'status': 'Cancelled'})

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def resolve_return(self, request, pk=None):
        order = self.get_object()
        action = request.data.get('action') # 'Returned' or 'Lost'
        
        if not action or action not in ['Returned', 'Lost']:
            return Response({'error': 'Invalid action. Must be Returned or Lost.'}, status=400)
            
        order.return_status = action
        
        if action == 'Returned':
            # Loss is usually just the shipping cost (sunk cost) + fees
            order.loss_amount = order.shipping_cost # + fee?
            print(f"Resolving Return: Shipping Cost = {order.shipping_cost}")
        elif action == 'Lost':
            # We lost the goods and the shipping
            order.loss_amount = order.total
            print(f"Resolving Lost: Total Order Value = {order.total}")

        order.save()
        print(f"Saved Loss Amount: {order.loss_amount}")
        response_data = {
            'status': f'Return marked as {action}', 
            'return_status': action,
            'loss_amount': float(order.loss_amount)
        }
        print(f"DEBUG: resolve_return response: {response_data}")
        return Response(response_data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def track(self, request):
        order_id = request.query_params.get('id')
        phone = request.query_params.get('phone')
        
        if not order_id or not phone:
            return Response(
                {'error': 'Both Order ID and Phone Number are required.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Normalize ID (remove potential #)
        search_id = order_id.strip().replace('#', '')
        
        try:
            # Try to match ID (int or string) and Phone
            # We filter by `id` or `id` string representation if necessary, but `id` is usually AutoField (int).
            # If `id` is UUID, it's string. Let's assume int for ID but handle potential ValueError if user sends garbage.
            
            # Using filter instead of get to handle potential duplicates or safety
            orders = Order.objects.filter(id=search_id, phone=phone)
            
            if not orders.exists():
                return Response({'error': 'Order not found with provided details.'}, status=status.HTTP_404_NOT_FOUND)
                
            order = orders.first()
            serializer = self.get_serializer(order)
            return Response(serializer.data)
            

        except ValueError:
             return Response({'error': 'Invalid Order ID format.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def proxy_image(self, request):
        url = request.query_params.get('url')
        if not url:
            return Response({'error': 'URL required'}, status=400)
        
        import requests
        try:
            # Basic validation
            if not url.startswith('http'):
                return Response({'error': 'Invalid URL'}, status=400)
                
            resp = requests.get(url, stream=True, timeout=10)
            
            # Convert to Base64
            import base64
            encoded = base64.b64encode(resp.content).decode('utf-8')
            content_type = resp.headers.get('content-type', 'image/jpeg')
            
            data_uri = f"data:{content_type};base64,{encoded}"
            
            return Response({'image': data_uri})
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class PaymentMethodViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()] # Customers need to see payment methods
        return [IsAdminUser()] # Only admin can manage methods

    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

class PaymentSettingsViewSet(viewsets.ModelViewSet):
    queryset = PaymentSettings.objects.all()
    serializer_class = PaymentSettingsSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    def list(self, request, *args, **kwargs):
        # Always return the single global instance, creating it if needed
        setting, created = PaymentSettings.objects.get_or_create(id=1)
        serializer = self.get_serializer(setting)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
         # If trying to create, actually update the singleton
         setting, created = PaymentSettings.objects.get_or_create(id=1)
         serializer = self.get_serializer(setting, data=request.data, partial=True)
         serializer.is_valid(raise_exception=True)
         serializer.save()
         return Response(serializer.data)




class FollowUpViewSet(viewsets.ModelViewSet):
    queryset = FollowUp.objects.all().order_by('-created_at')
    serializer_class = FollowUpSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['order__id', 'customer__email', 'customer__first_name', 'order__phone']
    filterset_fields = {
        'status': ['exact'],
        'is_interested_in_new_products': ['exact'],
        'customer': ['exact'],
        'order': ['exact'],
        'followup_type': ['exact'],
        'created_at': ['gte', 'lte']
    }
    pagination_class = StandardResultsSetPagination

    def perform_create(self, serializer):
        serializer.save(moderator=self.request.user)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """
        Returns list of orders eligible for POST-PURCHASE follow-up:
        1. Delivered
        2. No 'Post-Purchase' follow-up exists
        """
        from django.db.models import Subquery, OuterRef
        
        # Get orders that are Delivered
        delivered = Order.objects.filter(status='Delivered')
        
        # Exclude if they have a 'Post-Purchase' or successful follow-up attached
        # Logic: We want orders where NOT EXISTS(FollowUp where order=order and type='Post-Purchase')
        # OR where existing follow-up is 'Follow Later'
        
        # Simplest: Just exclude ones with existing non-later followups of type Post-Purchase
        completed_followups = FollowUp.objects.filter(
            order=OuterRef('pk'), 
            followup_type='Post-Purchase'
        ).exclude(status='Follow Later')
        
        pending_orders = delivered.annotate(
            has_followup=Subquery(completed_followups.values('id')[:1])
        ).filter(has_followup__isnull=True).order_by('-created_at')
        
        page = self.paginate_queryset(pending_orders)
        if page is not None:
            serializer = OrderSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = OrderSerializer(pending_orders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recurring(self, request):
        """
        Returns list of CUSTOMERS eligible for RECURRING follow-up:
        1. Have at least one Delivered order
        2. Have not been contacted in X days (default 30)
        """
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Max, Count, Sum, Q
        
        days_threshold = int(request.query_params.get('days', 30))
        cutoff_date = timezone.now() - timedelta(days=days_threshold)
        
        User = Order.customer.field.related_model
        
        # Get users with delivered orders
        active_customers = User.objects.filter(orders__status='Delivered').distinct()
        
        # Annotate with last follow-up date
        customers = active_customers.annotate(
            last_followup=Max('followups__created_at'),
            last_order_date=Max('orders__created_at'),
            total_spent=Sum('orders__total', filter=Q(orders__status='Delivered')),
            order_count=Count('orders', filter=Q(orders__status='Delivered'))
        )
        
        # Filter: Last follow-up is None OR older than threshold
        eligible_customers = customers.filter(
            Q(last_followup__isnull=True) | Q(last_followup__lt=cutoff_date)
        ).order_by('-last_order_date') 
        
        # Manually pagination since we are returning custom data, not Model instances exactly
        page = self.paginate_queryset(eligible_customers)
        if page is not None:
            data = []
            for c in page:
                data.append({
                    'id': c.id,
                    'customerName': c.get_full_name() or c.username,
                    'phone': c.phone_number,
                    'email': c.email,
                    'last_order_date': c.last_order_date,
                    'last_followup_date': c.last_followup,
                    'total_spent': c.total_spent,
                    'order_count': c.order_count
                })
            return self.get_paginated_response(data)
            
        return Response([])

    @action(detail=False, methods=['get'])
    def stats(self, request):
        from django.db.models import Avg, Count, Q, Subquery, OuterRef
        from django.utils import timezone
        
        # 1. Pending Post-Purchase Count (Must match 'pending' action logic)
        delivered = Order.objects.filter(status='Delivered')
        completed_followups = FollowUp.objects.filter(
            order=OuterRef('pk'), 
            followup_type='Post-Purchase'
        ).exclude(status='Follow Later')
        
        pending_count = delivered.annotate(
            has_followup=Subquery(completed_followups.values('id')[:1])
        ).filter(has_followup__isnull=True).count()
        
        # 2. Recurring Count (Must match 'recurring' action logic)
        days_threshold = 30
        cutoff_date = timezone.now() - timezone.timedelta(days=days_threshold)
        User = Order.customer.field.related_model
        
        active_customers = User.objects.filter(orders__status='Delivered').distinct()
        
        # We need to count customers where last_followup is null or < cutoff
        # Efficient approach: Exclude customers who HAVE a recent followup
        recurring_count = active_customers.exclude(
            followups__created_at__gte=cutoff_date
        ).count()
        
        # 3. Calls Today
        today = timezone.now().date()
        calls_today = FollowUp.objects.filter(created_at__date=today).count()
        
        # 4. Avg Rating
        avg_rating = FollowUp.objects.aggregate(Avg('rating'))['rating__avg'] or 0
        
        return Response({
            'pending_count': pending_count, 
            'recurring_count': recurring_count,
            'calls_today': calls_today,
            'avg_rating': round(avg_rating, 1)
        })
