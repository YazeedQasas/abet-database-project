from rest_framework.permissions import BasePermission

class IsFaculty(BasePermission):
    def has_permission(self, request, view):
        print("🔐 [IsFaculty] Checking permission for:", request.user.username)
        return (
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            request.user.profile.user_type == 'faculty'
        )
