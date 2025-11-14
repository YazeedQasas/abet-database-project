from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from programs.views import (
    DepartmentViewSet, FacultyViewSet, ProgramViewSet,
    ProgramEducationalObjectiveViewSet, CourseViewSet,
    StudentViewSet, CourseStudentViewSet, FacultyViewSet
)
from core.views import (
    InstitutionalSupportViewSet, ProgramCriteriaViewSet,
    MeetingViewSet, DocumentViewSet, MastersLevelRequirementViewSet
)

from assessment.views import (
    AssessmentViewSet, ContinuousImprovementViewSet, AcademicPerformanceViewSet,
    AssessmentLearningOutcomeViewSet, AssessmentLearningOutcomeABETViewSet, DashboardStatsView, AuditLogListAPIView,
    ABETOutcomeViewSet, AssessmentEventViewSet, program_averages, abet_accreditation_status, debug_abet_outcomes, assessment_methods_summary,
    compliance_dashboard, FacultyTrainingViewSet, faculty_training_stats, RecentActivitiesAPIView, AssessmentQuestionViewSet, get_course_academic_performances
)

from reports.views import (
    ReportViewSet, CommentViewSet, get_csrf_token, add_comment, current_user
)

from users.views import (
    LogoutView, UserViewSet
)

router = DefaultRouter()

# Programs app routes
router.register(r'departments', DepartmentViewSet)
router.register(r'programs', ProgramViewSet, basename='program')
router.register(r'program-objectives', ProgramEducationalObjectiveViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'students', StudentViewSet)
router.register(r'course-students', CourseStudentViewSet)
router.register(r'faculty', FacultyViewSet)

# Assessment app routes
router.register(r'assessments', AssessmentViewSet, basename='assessment')
router.register(r'continuous-improvements',
                ContinuousImprovementViewSet, basename='continuousimprovement')
router.register(r'academic-performances',
                AcademicPerformanceViewSet, basename='academicperformance')
router.register(r'learning-outcomes',
                AssessmentLearningOutcomeViewSet, basename='learningoutcome')
router.register(r'abet-outcomes', AssessmentLearningOutcomeABETViewSet)
router.register(r'abetoutcome', ABETOutcomeViewSet)
router.register(r'assessment-events', AssessmentEventViewSet)
router.register(r'faculty-training', FacultyTrainingViewSet,
                basename='faculty-training')
router.register(r'users', UserViewSet, basename='users')
router.register(r'assessment-questions',
                AssessmentQuestionViewSet, basename='assessment-question')

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
    path('api/recent-activities/', RecentActivitiesAPIView.as_view(),
         name='recent-activities'),
    path('api/program-averages/', program_averages, name='program-averages'),
    path('api/abet-accreditation-status/', abet_accreditation_status,
         name='abet-accreditation-status'),
    path('api/debug-abet/', debug_abet_outcomes, name='debug-abet'),
    path('api/faculty-training-stats/', faculty_training_stats,
         name='faculty-training-stats'),
    path('api/assessment-methods-summary/', assessment_methods_summary,
         name='assessment-methods-summary'),
    path('api/compliance-dashboard/', compliance_dashboard,
         name='compliance-dashboard'),
    path('api/get-csrf-token/', get_csrf_token, name='get_csrf_token'),
    path('api/courses/<int:course_id>/academic-performances/',
         get_course_academic_performances, name='course-academic-performances'),
    path('api/reports/<int:report_id>/comments/', add_comment),
    path('api/current-user/', current_user),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path("api/", include("archive.urls"))
]
