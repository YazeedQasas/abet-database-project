from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from programs.views import (
    DepartmentViewSet, FacultyViewSet, ProgramViewSet, 
    ProgramEducationalObjectiveViewSet, CourseViewSet, 
    StudentViewSet, CourseStudentViewSet
)
from core.views import (
    InstitutionalSupportViewSet, ProgramCriteriaViewSet, 
    MeetingViewSet, DocumentViewSet, MastersLevelRequirementViewSet
)

from assessment.views import (
    AssessmentViewSet, ContinuousImprovementViewSet, AcademicPerformanceViewSet,
    AssessmentLearningOutcomeViewSet, AssessmentLearningOutcomeABETViewSet, DashboardStatsView,AuditLogListAPIView,
    ABETOutcomeViewSet, AssessmentEventViewSet
)

from reports.views import (
    ReportViewSet, CommentViewSet, get_csrf_token, add_comment, current_user
)

from users.views import (
    LogoutView
)



router = DefaultRouter()
# Programs app routes
router.register(r'departments', DepartmentViewSet)
router.register(r'programs', ProgramViewSet, basename= 'program')
router.register(r'program-objectives', ProgramEducationalObjectiveViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'students', StudentViewSet)
router.register(r'course-students', CourseStudentViewSet)

# Assessment app routes
router.register(r'assessments', AssessmentViewSet, basename='assessment')
router.register(r'continuous-improvements', ContinuousImprovementViewSet, basename='continuousimprovement')
router.register(r'academic-performances', AcademicPerformanceViewSet, basename='academicperformance')
router.register(r'learning-outcomes', AssessmentLearningOutcomeViewSet, basename='learningoutcome')
router.register(r'abet-outcomes', AssessmentLearningOutcomeABETViewSet)
router.register(r'abetoutcome', ABETOutcomeViewSet)
router.register(r'assessment-events', AssessmentEventViewSet)

# Core app routes
router.register(r'institutional-support', InstitutionalSupportViewSet)
router.register(r'program-criteria', ProgramCriteriaViewSet)
router.register(r'meetings', MeetingViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'masters-requirements', MastersLevelRequirementViewSet)

# Reports app routes
router.register(r'reports', ReportViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('users.urls')),
    path('api-auth/', include('rest_framework.urls')),
    path('api/dashboard-stats/', DashboardStatsView.as_view()),
    path('api/audit-logs/', AuditLogListAPIView.as_view(), name='audit-log-list'),
    path('api/get-csrf-token/', get_csrf_token, name='get_csrf_token'),
    path('api/reports/<int:report_id>/comments/', add_comment),
    path('api/current-user/', current_user),
    path('api/logout/', LogoutView.as_view(), name='logout'),

]
