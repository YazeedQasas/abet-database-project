import threading
from django.contrib.auth.models import AnonymousUser

_thread_local = threading.local()


def get_current_user():
    user = getattr(_thread_local, 'user', None)
    if user is None or isinstance(user, AnonymousUser):
        return None
    return user


class CurrentUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        _thread_local.user = request.user
        response = self.get_response(request)
        return response

# Middleware file
