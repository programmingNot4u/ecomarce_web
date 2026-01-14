from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, RegisterView, UserViewSet, GenerateOTPView, VerifyOTPView

router = DefaultRouter()
router.register('', UserViewSet)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('generate-otp/', GenerateOTPView.as_view(), name='generate-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
] + router.urls
