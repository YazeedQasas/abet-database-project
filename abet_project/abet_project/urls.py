"""
URL configuration for abet_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken import views
from accreditation.views import *

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'faculty', FacultyViewSet)
router.register(r'programs', ProgramViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'students', StudentViewSet)
router.register(r'course-students', CourseStudentViewSet)
router.register(r'learning-outcomes', LearningOutcomesViewSet)
router.register(r'assessments', AssessmentViewSet)
router.register(r'assessment-learning-outcomes', Assessment_LearningOutcomesViewSet)
router.register(r'assessment-results', Assessment_ResultViewSet)
router.register(r'documents', DocumentsViewSet)
router.register(r'users', UsersViewSet)
router.register(r'meetings', MeetingsViewSet)
router.register(r'department-courses', Department_CourseViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-token-auth/', views.obtain_auth_token),

]

