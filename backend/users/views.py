from rest_framework import views, status, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import update_last_login
from rest_framework.authtoken.models import Token
from .serializers import UserSerializer, LoginSerializer, RegisterSerializer

User = get_user_model()

class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            # Find user by email first
            try:
                user_obj = User.objects.get(email=email)
                username = user_obj.username
            except User.DoesNotExist:
                # Still try to authenticate to avoid timing attacks (though simple here)
                username = email 

            user = authenticate(
                username=username, 
                password=password
            )
            
            if user:
                update_last_login(None, user) # Update last_login
                token, _ = Token.objects.get_or_create(user=user)
                return Response({
                    'token': token.key,
                    'user': UserSerializer(user).data
                })
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance == request.user:
            return Response({'error': 'You cannot delete yourself.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        user = request.user
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        elif request.method == 'PATCH':
            serializer = self.get_serializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

import random
import requests
import urllib.parse
from .models import OTP
from content.models import SMSSettings

class GenerateOTPView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone_number = request.data.get('phone_number')
        if not phone_number:
            return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Determine if user exists to possibly customize message or logic (optional)
        # user_exists = User.objects.filter(phone_number=phone_number).exists()

        # Check SMS Settings
        sms_settings = SMSSettings.objects.first()
        is_sms_active = sms_settings and sms_settings.is_active

        # If SMS is Inactive -> DIRECT LOGIN
        if not is_sms_active:
            # Create or Get User
            user, created = User.objects.get_or_create(phone_number=phone_number)
            if created:
                user.username = phone_number
                user.set_unusable_password()
                user.is_verified = True # Auto verify since we are bypassing OTP
                user.save()
            
            token, _ = Token.objects.get_or_create(user=user)
            update_last_login(None, user)

            return Response({
                'success': True, 
                'direct_login': True,
                'token': token.key,
                'user': UserSerializer(user).data,
                'message': 'Direct login successful'
            })

        # Generate 6-digit OTP
        otp_code = str(random.randint(100000, 999999))
        
        # Save to DB (Clear old first)
        OTP.objects.filter(phone_number=phone_number).delete()
        OTP.objects.create(phone_number=phone_number, otp_code=otp_code)
        
        # Send SMS via Gateway if active
        try:
            # Replace placeholder in template (Case Insensitive for user convenience)
            message = sms_settings.message_template
            message = message.replace('{otp}', otp_code).replace('{OTP}', otp_code)
            
            # Construct Payload
            params = {
                'api_key': sms_settings.api_key,
                'type': 'text',
                'number': phone_number,
                'senderid': sms_settings.sender_id if sms_settings.sender_id else '',
                'message': message
            }
            
            # Use request.post or get based on doc? User said GET & POST. Let's use GET as query params are typical for this provider
            response = requests.get(sms_settings.api_url, params=params)
            print(f"SMS Response for {phone_number}: {response.text}")
                
        except Exception as e:
            print(f"Failed to send SMS: {e}")
        
        # In a real app, send via SMS Gateway here.
        print(f"DEBUG OTP for {phone_number}: {otp_code}")
        
        return Response({'success': True, 'message': 'OTP sent successfully', 'debug_otp': otp_code})

class VerifyOTPView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone_number = request.data.get('phone_number')
        otp_code = request.data.get('otp')
        
        if not phone_number or not otp_code:
            return Response({'error': 'Phone number and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            otp_record = OTP.objects.get(phone_number=phone_number, otp_code=otp_code)
            
            # Check expiration here if needed (e.g. created_at > 5 mins ago)
            
            otp_record.delete() # Consume OTP
            
            # Get or Create User
            user, created = User.objects.get_or_create(phone_number=phone_number)
            
            if created:
                user.username = phone_number # Use phone as username for simplicity
                user.set_unusable_password()
                user.is_verified = True
                user.save()
            
            token, _ = Token.objects.get_or_create(user=user)
            update_last_login(None, user)
            
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            })
            
        except OTP.DoesNotExist:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
