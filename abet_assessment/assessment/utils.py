from .models import AuditLog
from django.contrib.auth.models import User

def log_action(user, action, instance, changes=None):
    # If user is None, use a default system user or skip logging
    if user is None:
        return
    
    AuditLog.objects.create(
        user=user,
        action=action,
        target_model=instance.__class__.__name__,
        target_id=instance.pk,
        changes=changes
    )