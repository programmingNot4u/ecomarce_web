from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Sum, Count, F, ExpressionWrapper, DecimalField
from django.utils import timezone
from datetime import timedelta
from .models import Order
from store.models import Product

class ReportViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['get'])
    def sales_ledger(self, request):
        """
        Returns filtered list of orders with calculated totals.
        Query Params: start_date, end_date, status
        """
        queryset = Order.objects.all().order_by('-created_at')
        
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        status_param = request.query_params.get('status')

        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
        if status_param and status_param != 'all':
            queryset = queryset.filter(status=status_param)

        data = []
        for order in queryset:
            data.append({
                'id': order.id,
                'date': order.created_at.date(),
                'customer': order.customer_name,
                'items': sum(item.quantity for item in order.items.all()),
                'total': order.total,
                'status': order.status
            })
            
        return Response(data)

    @action(detail=False, methods=['get'])
    def product_velocity(self, request):
        """
        Returns product sales performance.
        Query Params: start_date, end_date
        """
        # sales logic based on OrderItems
        from orders.models import OrderItem
        
        items = OrderItem.objects.filter(order__status__in=['Shipped', 'Delivered', 'Processing', 'Pending']) # Exclude cancelled?
        
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            items = items.filter(order__created_at__date__gte=start_date)
        if end_date:
            items = items.filter(order__created_at__date__lte=end_date)
            
        # Aggregate
        stats = {}
        for item in items:
            pid = item.product.id if item.product else f"del_{item.id}"
            if pid not in stats:
                stats[pid] = {
                    'name': item.product_name,
                    'sold': 0,
                    'revenue': 0,
                    'stock': item.product.stock_quantity if item.product else 0
                }
            stats[pid]['sold'] += item.quantity
            stats[pid]['revenue'] += float(item.price) * item.quantity
            
        return Response(list(stats.values()))

    @action(detail=False, methods=['get'])
    def inventory_audit(self, request):
        """
        Returns inventory status.
        Query Params: status (Low Stock, Out of Stock, In Stock), page, page_size
        """
        queryset = Product.objects.all().order_by('name')
        status_param = request.query_params.get('status')
        
        # Filter at DB level for better performance
        if status_param == 'Low Stock':
            queryset = queryset.filter(stock_quantity__lt=5, stock_quantity__gt=0)
        elif status_param == 'Out of Stock':
            queryset = queryset.filter(stock_quantity=0)
        elif status_param == 'In Stock':
            queryset = queryset.filter(stock_quantity__gte=5)

        # Pagination
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = 20
        result_page = paginator.paginate_queryset(queryset, request)
        
        data = []
        for p in result_page:
            stock = p.stock_quantity
            status = 'In Stock'
            if stock == 0:
                status = 'Out of Stock'
            elif stock < 5:
                status = 'Low Stock'

            data.append({
                'id': p.id,
                'name': p.name,
                'sku': p.sku or f"SKU-{p.id}",
                'category': p.category.name if p.category else 'Uncategorized',
                'stock': stock,
                'value': float(p.price) * stock,
                'status': status
            })
            
        return paginator.get_paginated_response(data)
