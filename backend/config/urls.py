from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from store.views import ProductViewSet, CategoryViewSet, BrandViewSet, ReviewViewSet, InventoryLogViewSet, SupplierViewSet, PurchaseOrderViewSet, QuestionViewSet, WishlistViewSet
from orders.views import OrderViewSet, PaymentMethodViewSet, FollowUpViewSet, PaymentSettingsViewSet
from orders.reports import ReportViewSet
from marketing.views import CouponViewSet, CampaignViewSet, MarketingSettingsViewSet
from content.views import BannerViewSet, FAQViewSet, StaticPageViewSet, ThemeViewSet, SMSConfigViewSet
from support.views import SupportTicketViewSet, TicketReplyViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'brands', BrandViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'inventory-logs', InventoryLogViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'payment-methods', PaymentMethodViewSet)
router.register(r'payment-settings', PaymentSettingsViewSet)
router.register(r'reports', ReportViewSet, basename='reports')
router.register(r'followups', FollowUpViewSet)
router.register(r'coupons', CouponViewSet)
router.register(r'campaigns', CampaignViewSet)
router.register(r'marketing-settings', MarketingSettingsViewSet)
router.register(r'banners', BannerViewSet)
router.register(r'faqs', FAQViewSet)
router.register(r'pages', StaticPageViewSet)
router.register(r'theme', ThemeViewSet, basename='theme')
router.register(r'sms-settings', SMSConfigViewSet)
router.register(r'tickets', SupportTicketViewSet)
router.register(r'ticket-replies', TicketReplyViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'purchase-orders', PurchaseOrderViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'wishlist', WishlistViewSet, basename='wishlist')

from support.upload_view import FileUploadView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/upload/', FileUploadView.as_view()),
    path('api/', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
