# users/models.py
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    USER_TYPES = (
        ('admin', 'Administrator'),
        ('faculty', 'Faculty'),
        ('evaluator', 'Program Evaluator'),
        ('reviewer', 'Reviewer'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='faculty')
    department = models.ForeignKey('programs.Department', on_delete=models.SET_NULL, null=True, blank=True, related_name='user_profiles')
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username}'s profile ({self.get_user_type_display()})"

# Signal to create/update UserProfile when User is created/updated
@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        instance.profile.save()
