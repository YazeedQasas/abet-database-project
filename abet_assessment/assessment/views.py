from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Assessment, ContinuousImprovement, AcademicPerformance,
    AssessmentLearningOutcome, AssessmentLearningOutcome_ABET, AuditLog, ABETOutcome,
    AssessmentEvent, FacultyTraining, AssessmentQuestion
)

from .serializers import (
    AssessmentSerializer, ContinuousImprovementSerializer, AcademicPerformanceSerializer,
    AssessmentLearningOutcomeSerializer, AssessmentLearningOutcomeABETSerializer, AuditLogSerializer,
    ABETOutcomeSerializer, AssessmentEventSerializer, FacultyTrainingSerializer, AssessmentQuestionSerializer
)

from .filters import AcademicPerformanceFilter

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from programs.models import Program
from programs.models import Course
from programs.models import Department

from .services import AssessmentService
from users.permissions import IsAdminUserType, IsFacultyOrAdmin
from rest_framework.permissions import IsAuthenticated
from assessment.utilsLog.event_logger import log_assessment_event

import traceback
import sys

import logging
logger = logging.getLogger(__name__)


class FacultyTrainingViewSet(viewsets.ModelViewSet):
    queryset = FacultyTraining.objects.all()
    serializer_class = FacultyTrainingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        logger.info(f"=== BACKEND DEBUG ===")
        logger.info(f"Received data: {request.data}")
        logger.info(
            f"Data types: {[(k, type(v)) for k, v in request.data.items()]}")

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AuditLogListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserType]

    def get(self, request):
        logs = AuditLog.objects.all().order_by('-timestamp')[:50]  # Latest 50
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)


class DashboardStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            print("🔍 DashboardStatsView started...")

            # Get basic stats
            basic_stats = AssessmentService.get_dashboard_statistics()
            print(f"📊 Basic stats: {basic_stats}")

            # Get ABET outcomes with real calculations
            abet_outcomes = AssessmentService.get_abet_outcomes_dashboard_data()
            print(f"🎯 ABET outcomes: {len(abet_outcomes)}")

            # Get courses data
            courses_data = AssessmentService.get_courses_assessment_summary()
            print(f"📚 Courses data: {len(courses_data)}")

            # Get dynamic compliance metrics
            try:
                compliance_metrics = AssessmentService.calculatedynamiccompliancemetrics()
                print(f"📈 Compliance metrics calculated successfully")

                # Format progress metrics for your dashboard
                progress_metrics = [
                    {
                        'title': compliance_metrics['course_syllabi']['name'],
                        'percentage': compliance_metrics['course_syllabi']['percentage'],
                        'target': f"{compliance_metrics['course_syllabi']['target']}",
                        'status': compliance_metrics['course_syllabi']['status'],
                        'current': compliance_metrics['course_syllabi']['current'],
                        'total': compliance_metrics['course_syllabi']['total']
                    },
                    {
                        'title': compliance_metrics['assessment_data']['name'],
                        'percentage': compliance_metrics['assessment_data']['percentage'],
                        'target': f"{compliance_metrics['assessment_data']['target']}",
                        'status': compliance_metrics['assessment_data']['status'],
                        'current': compliance_metrics['assessment_data']['current'],
                        'total': compliance_metrics['assessment_data']['total']
                    },
                    {
                        'title': compliance_metrics['student_outcomes']['name'],
                        'percentage': compliance_metrics['student_outcomes']['percentage'],
                        'target': f"{compliance_metrics['student_outcomes']['target']}",
                        'status': compliance_metrics['student_outcomes']['status'],
                        'current': compliance_metrics['student_outcomes']['current'],
                        'total': compliance_metrics['student_outcomes']['total']
                    },
                    {
                        'title': compliance_metrics['faculty_training']['name'],
                        'percentage': compliance_metrics['faculty_training']['percentage'],
                        'target': f"{compliance_metrics['faculty_training']['target']}",
                        'status': compliance_metrics['faculty_training']['status'],
                        'current': compliance_metrics['faculty_training']['current'],
                        'total': compliance_metrics['faculty_training']['total']
                    }
                ]

                print(
                    f"✅ Progress metrics: {[m['percentage'] for m in progress_metrics]}")

            except Exception as e:
                print(f"❌ Compliance metrics failed: {e}")
                import traceback
                traceback.print_exc()

                # Fallback metrics
                progress_metrics = [
                    {'title': 'Course Syllabi Updated', 'percentage': 0,
                        'target': 'Target: 100%', 'status': 'critical'},
                    {'title': 'Assessment Data Collected', 'percentage': 0,
                        'target': 'Target: 90%', 'status': 'critical'},
                    {'title': 'Student Outcomes Met', 'percentage': 0,
                        'target': 'Target: 80%', 'status': 'critical'},
                    {'title': 'Faculty Training Complete', 'percentage': 0,
                        'target': 'Target: 95%', 'status': 'critical'}
                ]

            return Response({
                **basic_stats,
                'abet_outcomes': abet_outcomes,
                'courses_data': courses_data,
                'progress_metrics': progress_metrics,
                'status': 'success'
            })

        except Exception as e:
            print(f"❌ DashboardStatsView Error: {e}")
            import traceback
            traceback.print_exc()

            return Response({
                'error': str(e),
                'programs': 0,
                'courses': 0,
                'assessments': 0,
                'departments': 0,
                'abet_outcomes': [],
                'progress_metrics': [],
                'status': 'error'
            }, status=500)


class AssessmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssessmentSerializer
    queryset = Assessment.objects.all()

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'DELETE']:
            return [IsAuthenticated(), IsFacultyOrAdmin()]
        return [AllowAny()]

    def perform_create(self, serializer):
        instance = serializer.save()
        instance._current_user = self.request.user
        instance.save()
        log_assessment_event(instance, self.request.user, 'CREATE')

    def perform_update(self, serializer):
        instance = serializer.save()
        instance._current_user = self.request.user
        instance.save()
        log_assessment_event(instance, self.request.user,  'UPDATE')

    @action(detail=True, methods=['get'], url_path='calculate-score')
    def calculate_score(self, request, pk=None):
        """Calculate the assessment score based on all components"""
        assessment = self.get_object()
        result = AssessmentService.calculate_assessment_score(
            assessment.id)  # ✅ Fixed method name
        return Response(result)

    @action(detail=False, methods=['get'], url_path='average-score')
    def average_score(self, request):
        all_assessments = Assessment.objects.all()
        if not all_assessments.exists():
            return Response({'average_score': 0})

        total = 0
        count = 0

        for assessment in all_assessments:
            result = AssessmentService.calculate_assessment_score(
                assessment.id)
            total += result['total_score']
            count += 1

        avg = total / count if count > 0 else 0
        return Response({'average_score': avg})

    @action(detail=False, methods=['get'], url_path='program/(?P<program_id>[^/.]+)/average')
    def program_average(self, request, program_id=None):
        from programs.models import Program

        try:
            program = Program.objects.get(id=program_id)
        except Program.DoesNotExist:
            return Response({'error': 'Program not found'}, status=404)

        courses = program.courses.all()
        assessments = Assessment.objects.filter(course__in=courses)

        total_score = 0
        count = 0

        for assessment in assessments:
            score_data = AssessmentService.calculate_assessment_score(
                assessment.id)
            total_score += score_data['total_score']
            count += 1

        average_score = total_score / count if count > 0 else 0

        return Response({
            'program_id': program.id,
            'program_name': program.name,
            'average_score': round(average_score, 2),
            'is_abet_accredited': average_score >= 90
        })

    @action(detail=False, methods=['get'], url_path='program-averages')
    def program_averages(self, request):
        from programs.models import Program
        result = []
        programs = Program.objects.all()

        for program in programs:
            courses = program.courses.all()
            assessments = Assessment.objects.filter(course__in=courses)

            total_score = 0
            count = 0

            for assessment in assessments:
                score_data = AssessmentService.calculate_assessment_score(
                    assessment.id)
                total_score += score_data['total_score']
                count += 1

            average_score = total_score / count if count > 0 else 0

            result.append({
                'program_id': program.id,
                'program_name': program.name,
                'average_score': round(average_score, 2),
                'is_abet_accredited': average_score >= 90
            })

        return Response(result)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if request.user.is_authenticated:
            AuditLog.objects.create(
                user=request.user,
                action='DELETE',
                target_model='Assessment',
                target_id=instance.id,  # ✅ Now it's still available
                changes=f"Deleted {instance.name}"
            )

            self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AssessmentQuestionViewSet(viewsets.ModelViewSet):
    serializer_class = AssessmentQuestionSerializer
    # The base queryset for listing/retrieving questions
    queryset = AssessmentQuestion.objects.all()

    def get_serializer_context(self):
        """
        Pass the request object to the serializer's context to allow
        dynamic filtering of fields.
        """
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


class ContinuousImprovementViewSet(viewsets.ModelViewSet):
    queryset = ContinuousImprovement.objects.all()
    serializer_class = ContinuousImprovementSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        assessment_id = self.request.query_params.get('assessment_id', None)
        if assessment_id is not None:
            queryset = queryset.filter(assessment_id=assessment_id)
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        instance = serializer.save()
        instance._current_user = user
        instance.save()

        # 👇 Move this here: AFTER saving, so data exists now
        try:
            pre_score = AssessmentService.get_average_score()
        except Exception:
            pre_score = 0.0

        AssessmentEvent.objects.create(
            assessment_id=instance.assessment.id,
            assessment_name=f"{instance.assessment.name} - Continuous Improvement",
            event_type='UPDATE',
            score=pre_score,
            average_score_at_time=pre_score,
            user=user
        )


class AcademicPerformanceViewSet(viewsets.ModelViewSet):
    queryset = AcademicPerformance.objects.all()
    serializer_class = AcademicPerformanceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = AcademicPerformanceFilter


class AssessmentLearningOutcomeViewSet(viewsets.ModelViewSet):
    queryset = AssessmentLearningOutcome.objects.all()
    serializer_class = AssessmentLearningOutcomeSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        assessment_id = self.request.query_params.get('assessment_id', None)
        if assessment_id is not None:
            queryset = queryset.filter(assessment=assessment_id)
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        instance = serializer.save()  # This already saves to database
        instance._current_user = user
        # REMOVE THIS LINE: instance.save()  # Don't save again!

        # Create assessment event
        try:
            pre_score = AssessmentService.get_average_score()
        except Exception:
            pre_score = 0.0

        AssessmentEvent.objects.create(
            assessment_id=instance.assessment.id,  # Use .assessment.id not .assessment_id
            assessment_name=f"{instance.assessment.name} - Learning Outcome",
            event_type='CREATE',  # Changed from UPDATE to CREATE
            score=pre_score,
            average_score_at_time=pre_score,
            user=user
        )


class AssessmentLearningOutcomeABETViewSet(viewsets.ModelViewSet):
    queryset = AssessmentLearningOutcome_ABET.objects.all()
    serializer_class = AssessmentLearningOutcomeABETSerializer


class ABETOutcomeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ABETOutcome.objects.all()
    serializer_class = ABETOutcomeSerializer


class AssessmentEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AssessmentEventSerializer
    queryset = AssessmentEvent.objects.all().order_by('-timestamp')

    def get_permissions(self):
        if self.action == 'list':
            return [AllowAny()]
        return [IsAuthenticated()]


@api_view(['GET'])
def program_averages(request):
    """Get program averages - placeholder implementation"""
    # You can implement this based on your existing logic
    return Response([
        {
            "program_name": "Computer Science",
            "average_score": 85.5
        },
        {
            "program_name": "Software Engineering",
            "average_score": 78.2
        }
    ])


@api_view(['GET'])
def abet_accreditation_status(request):
    """Get ABET accreditation status - placeholder implementation"""
    return Response([
        {
            "program_name": "Computer Science",
            "average_score": 85.5,
            "accredited": True
        }
    ])


@api_view(['GET'])
def debug_abet_outcomes(request):
    """Debug endpoint to check ABET outcomes calculation"""
    try:
        from assessment.models import ABETOutcome, AssessmentLearningOutcome_ABET

        debug_data = []

        for outcome in ABETOutcome.objects.all():
            scores = AssessmentLearningOutcome_ABET.objects.filter(
                abet_outcome=outcome)

            if scores.exists():
                score_values = [s.score for s in scores]
                avg_score = sum(score_values) / len(score_values)
                percentage = (avg_score / 4.0) * 100
            else:
                score_values = []
                avg_score = 0
                percentage = 0

            debug_data.append({
                'outcome_label': outcome.label,
                'outcome_description': outcome.description,
                'raw_scores': score_values,
                'average_score': avg_score,
                'percentage': percentage,
                'scores_count': len(score_values)
            })

        return Response({
            'debug_data': debug_data,
            'total_outcomes': ABETOutcome.objects.count(),
            'total_scores': AssessmentLearningOutcome_ABET.objects.count()
        })

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def assessment_methods_summary(request):
    """Get assessment methods compliance summary"""
    try:
        methods_summary = AssessmentService.get_assessment_methods_summary()
        compliance_metrics = AssessmentService.get_compliance_dashboard_metrics()

        return Response({
            'methods_summary': methods_summary,
            'compliance_metrics': compliance_metrics,
            'status': 'success'
        })
    except Exception as e:
        return Response({
            'error': str(e),
            'status': 'error'
        }, status=500)


@api_view(['GET'])
def compliance_dashboard(request):
    """Get comprehensive compliance dashboard data"""
    try:
        compliance_data = AssessmentService.get_compliance_dashboard_metrics()

        return Response({
            'compliance_overview': {
                'overall_rate': compliance_data['overall_compliance_rate'],
                'direct_assessment': compliance_data['direct_assessment_compliance'],
                'indirect_assessment': compliance_data['indirect_assessment_compliance'],
                'status': 'compliant' if compliance_data['overall_compliance_rate'] >= 80 else 'non_compliant'
            },
            'methods_breakdown': compliance_data['methods_summary'],
            'trends': compliance_data['compliance_trends'],
            'summary_stats': {
                'total_methods': compliance_data['total_methods'],
                'compliant_methods': compliance_data['compliant_methods'],
                'non_compliant_methods': compliance_data['total_methods'] - compliance_data['compliant_methods']
            }
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def faculty_training_stats(request):
    total_trainings = FacultyTraining.objects.count()
    completed_trainings = FacultyTraining.objects.filter(
        is_completed=True).count()
    pending_trainings = total_trainings - completed_trainings
    completion_rate = round(
        (completed_trainings / total_trainings) * 100) if total_trainings > 0 else 0

    return Response({
        'total': total_trainings,
        'completed': completed_trainings,
        'pending': pending_trainings,
        'completion_rate': completion_rate,
        'target': 95  # Set your target completion rate
    })


class RecentActivitiesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get only the 4 most recent audit logs for dashboard
        logs = AuditLog.objects.all().order_by('-timestamp')[:4]
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)


@api_view(['GET'])
def get_course_academic_performances(request, course_id):
    """Get academic performances for a specific course"""
    try:
        # Get the course
        course = Course.objects.get(id=course_id)

        # Get all assessments for this specific course
        course_assessments = course.assessments.all()

        # Get academic performances ONLY for assessments belonging to this course
        academic_performances = AcademicPerformance.objects.filter(
            assessmentid__in=course_assessments
        ).select_related('assessmentid')

        # Serialize the data with the format you want
        result = []
        for ap in academic_performances:
            result.append({
                'id': ap.id,
                'assessmentType': ap.assessmentType,
                'assessmentName': ap.assessmentid.name,
                'display_name': f"{ap.assessmentType} - {ap.assessmentid.name}",
                'description': ap.description,
                'course_id': course_id,
                'course_name': course.name
            })

        return Response(result)

    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
