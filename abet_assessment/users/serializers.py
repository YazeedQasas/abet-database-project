from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile
from programs.models import Department
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()



class UserSerializer(serializers.ModelSerializer):
    # Use 'profile' instead of 'userprofile'
    user_type = serializers.CharField(source='profile.user_type', read_only=True)
    department_name = serializers.CharField(source='profile.department.name', read_only=True)
    department_id = serializers.IntegerField(source='profile.department_id', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 
                 'user_type', 'department_id', 'department_name', 'date_joined', 
                 'is_active', 'is_staff']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    user_type = serializers.ChoiceField(choices=UserProfile.USER_TYPES)
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all())

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 'user_type', 'department')

    def create(self, validated_data):
        try:
            user_type = validated_data.pop('user_type')
            department = validated_data.pop('department')
            user = User.objects.create_user(**validated_data)
            print("Creating user with role:", user_type)
            UserProfile.objects.create(user=user, user_type=user_type, department=department)
            return user
        except Exception as e:
            print("Error in RegisterSerializer:", e)
            raise e


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['user_type', 'department', 'phone']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']
        read_only_fields = ['id']
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        # Update User fields
        instance = super().update(instance, validated_data)
        
        # Update Profile fields
        if profile_data:
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        
        return instance



