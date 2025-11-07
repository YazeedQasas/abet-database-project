# users/models.py
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction

class UserProfile(models.Model):
    USER_TYPES = (
        ('admin', 'Administrator'),
        ('faculty', 'Faculty'),
        ('evaluator', 'Program Evaluator'),
        ('professor', 'Professor'),
        ('HoD', 'HoD'),
        ('dean', 'Dean'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='faculty')
    department = models.ForeignKey('programs.Department', on_delete=models.SET_NULL, null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username}'s profile ({self.get_user_type_display()})"

@transaction.atomic
def create_user_with_profile(data):
    # Extract data from dictionary
    username = data.get('username')
    password = data.get('password')
    user_type = data.get('user_type')
    department_id = data.get('department_id')
    phone = data.get('phone')
    
    # Create the User first
    user = User.objects.create_user(
        username=username,
        password=password
    )
    
    # Create the profile with specific values
    profile = UserProfile.objects.create(
        user=user,
        user_type=user_type,
        department_id=department_id,
        phone=phone
    )
    
    return user, profile
