import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'abet_assessment.settings')
django.setup()

from django.contrib.auth.models import User
from programs.models import Faculty

def link_users():
    print("Checking Users and Faculty...")
    
    users = User.objects.all()
    print(f"Found {users.count()} users.")
    for u in users:
        print(f"User: {u.username} (ID: {u.id}, Email: {u.email})")

    faculties = Faculty.objects.all()
    print(f"\nFound {faculties.count()} faculty members.")
    for f in faculties:
        print(f"Faculty: {f.name} (ID: {f.id}, User ID: {f.user_id})")

    # specific check for Dr. Yacoub
    yacoub_user = User.objects.filter(username__icontains='yacoub').first()
    if not yacoub_user:
        # Try finding by email or just pick the likely one
        yacoub_user = User.objects.filter(email__icontains='yacoub').first()
    
    if yacoub_user:
        print(f"\nFound Target User: {yacoub_user.username}")
        
        # Find corresponding faculty
        # Try exact match or partial
        yacoub_faculty = Faculty.objects.filter(name__icontains='yacoub').first()
        if yacoub_faculty:
            print(f"Found Target Faculty: {yacoub_faculty.name}")
            
            if yacoub_faculty.user != yacoub_user:
                print(f"Linking {yacoub_faculty.name} to User {yacoub_user.username}...")
                yacoub_faculty.user = yacoub_user
                yacoub_faculty.save()
                print("Link saved!")
            else:
                print("Already linked!")
        else:
            print("Could not find Faculty 'Yacoub'")
    else:
        print("Could not find User 'Yacoub'")

if __name__ == '__main__':
    link_users()
