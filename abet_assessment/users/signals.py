from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import UserProfile
from programs.models import Faculty, Department

@receiver(post_save, sender=UserProfile)
def sync_user_to_faculty(sender, instance, created, **kwargs):
    """
    Signal to automatically create or update a Faculty entry when a UserProfile
    with an academic role (professor, HoD, dean, faculty) is created or updated.
    """
    academic_roles = ['professor', 'HoD', 'dean', 'faculty']
    
    if instance.user_type in academic_roles:
        user = instance.user
        department = instance.department
        
        # We need a department to create a Faculty member
        if not department:
            # If no department is assigned yet, we can't create a Faculty entry linked to a department.
            # You might want to log this or handle it, but for now we skip.
            return

        # Check if Faculty exists by email (assuming email is unique identifier for sync)
        faculty, created_faculty = Faculty.objects.get_or_create(
            email=user.email,
            defaults={
                'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'department': department,
                'qualifications': 'PhD', # Default
                'expertise': 'General', # Default
            }
        )

        if not created_faculty:
            # Update existing faculty if needed
            updated = False
            if faculty.department != department:
                faculty.department = department
                updated = True
            
            # Update name if it changed in User
            current_name = f"{user.first_name} {user.last_name}".strip()
            if current_name and faculty.name != current_name:
                faculty.name = current_name
                updated = True
                
            if updated:
                faculty.save()
