from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from programs.views import (
    DepartmentViewSet, FacultyViewSet, ProgramViewSet, 
    ProgramEducationalObjectiveViewSet, CourseViewSet, 
    StudentViewSet, CourseStudentViewSet
)
from assessment.views import (
    ABETStudentOutcomeViewSet, LearningOutcomeViewSet, AssessmentViewSet, 
    AssessmentLearningOutcomeViewSet, AssessmentResultViewSet, ContinuousImprovementViewSet
)
from core.views import (
    FacilityViewSet, InstitutionalSupportViewSet, ProgramCriteriaViewSet, 
    MeetingViewSet, DocumentViewSet, MastersLevelRequirementViewSet
)

router = DefaultRouter()
# Programs app routes
router.register(r'departments', DepartmentViewSet)
router.register(r'faculty', FacultyViewSet)
router.register(r'programs', ProgramViewSet)
router.register(r'program-objectives', ProgramEducationalObjectiveViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'students', StudentViewSet)
router.register(r'course-students', CourseStudentViewSet)

# Assessment app routes
router.register(r'abet-outcomes', ABETStudentOutcomeViewSet)
router.register(r'learning-outcomes', LearningOutcomeViewSet)
router.register(r'assessments', AssessmentViewSet)
router.register(r'assessment-outcomes', AssessmentLearningOutcomeViewSet)
router.register(r'assessment-results', AssessmentResultViewSet)
router.register(r'improvements', ContinuousImprovementViewSet)

# Core app routes
router.register(r'facilities', FacilityViewSet)
router.register(r'institutional-support', InstitutionalSupportViewSet)
router.register(r'program-criteria', ProgramCriteriaViewSet)
router.register(r'meetings', MeetingViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'masters-requirements', MastersLevelRequirementViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]
