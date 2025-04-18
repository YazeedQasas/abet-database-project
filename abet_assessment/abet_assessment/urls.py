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
    AssessmentLearningOutcomeViewSet, AssessmentLearningOutcomeABETViewSet, DashboardStatsView
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
router.register(r'continuous-improvements', ContinuousImprovementViewSet)
router.register(r'academic-performances', AcademicPerformanceViewSet)
router.register(r'learning-outcomes', AssessmentLearningOutcomeViewSet)
router.register(r'abet-outcomes', AssessmentLearningOutcomeABETViewSet)


# Core app routes
router.register(r'institutional-support', InstitutionalSupportViewSet)
router.register(r'program-criteria', ProgramCriteriaViewSet)
router.register(r'meetings', MeetingViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'masters-requirements', MastersLevelRequirementViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('users.urls')),
    path('api-auth/', include('rest_framework.urls')),
    path('api/dashboard-stats/', DashboardStatsView.as_view()),
]
