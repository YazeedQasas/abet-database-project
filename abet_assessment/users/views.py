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
from programs.models import Department


User = get_user_model()

class RegisterView(APIView):
    @transaction.atomic
    def post(self, request):
        try:
            # Extract data from request
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')
            first_name = request.data.get('first_name')
            last_name = request.data.get('last_name')
            user_type = request.data.get('user_type', 'faculty')
            department_id = request.data.get('department')
            
            # Check if user already exists
            if User.objects.filter(username=username).exists():
                return Response({
                    'username': ['A user with that username already exists.']
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=email).exists():
                return Response({
                    'email': ['A user with that email already exists.']
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create the user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            
            # Create the user profile
            UserProfile.objects.create(
                user=user,
                user_type=user_type,
                department_id=department_id if department_id else None
            )
            
            return Response({
                'message': 'User created successfully',
                'user_id': user.id
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

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



class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    
    def list(self, request):
        users = User.objects.all()
        user_data = []
        
        for user in users:
            try:
                # Try to get the profile using the correct relationship
                profile = UserProfile.objects.get(user_id=user.id)
                department_name = 'N/A'
                
                if profile.department_id:
                    try:
                        department = Department.objects.get(id=profile.department_id)
                        department_name = department.name
                    except Department.DoesNotExist:
                        department_name = 'N/A'
                
                user_info = {
                    'id': user.id,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                    'user_type': profile.user_type,
                    'department_id': profile.department_id,
                    'department_name': department_name,
                    'date_joined': user.date_joined.isoformat(),
                    'is_active': user.is_active,
                    'is_staff': user.is_staff
                }
            except UserProfile.DoesNotExist:
                # Handle users without profiles
                user_info = {
                    'id': user.id,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                    'user_type': 'N/A',
                    'department_id': None,
                    'department_name': 'N/A',
                    'date_joined': user.date_joined.isoformat(),
                    'is_active': user.is_active,
                    'is_staff': user.is_staff
                }
            
            user_data.append(user_info)
        
        return Response(user_data)