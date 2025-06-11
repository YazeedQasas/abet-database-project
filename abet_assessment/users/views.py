from django.contrib.auth.models import User
from .models import UserProfile
from .serializers import UserSerializer
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer
from django.contrib.auth import logout
from rest_framework.decorators import api_view
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db import transaction


User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
    
    def perform_create(self, serializer):
        from .models import create_user_with_profile
        
        # Extract data from validated serializer
        user_data = serializer.validated_data
        
        # Create user with profile using  atomic function
        user = create_user_with_profile({
            'username': user_data.get('username'),
            'password': user_data.get('password'),
            'email': user_data.get('email', ''),
            'user_type': user_data.get('user_type', 'faculty'),
            'department_id': user_data.get('department_id'),
            'phone': user_data.get('phone')
        })
        
        # Return the created user
        return user

class LoginView(ObtainAuthToken):
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)

        # Get or create profile if it doesn't exist
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={'user_type': 'faculty'}
        )
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'user_type': profile.user_type
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if hasattr(request.user, 'auth_token'):
            request.user.auth_token.delete()
        logout(request) 
        return Response({"message": "Logged out successfully."})



class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.all()