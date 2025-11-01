from rest_framework.permissions import BasePermission

class IsAdminUserType(BasePermission):
    """
    Allows access only to users with user_type = 'admin'
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.user_type == 'admin'

class IsFacultyOrAdmin(BasePermission):
    """
    Allows access to reviewers and admins
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.user_type in ['faculty', 'admin']
