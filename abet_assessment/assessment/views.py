from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import (
    Assessment, ContinuousImprovement, AcademicPerformance, 
    AssessmentLearningOutcome, AssessmentLearningOutcome_ABET, AuditLog, ABETOutcome,
    AssessmentEvent
)
from .serializers import (
    AssessmentSerializer, ContinuousImprovementSerializer, AcademicPerformanceSerializer,
    AssessmentLearningOutcomeSerializer, AssessmentLearningOutcomeABETSerializer, AuditLogSerializer,
    ABETOutcomeSerializer, AssessmentEventSerializer
)
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




class AuditLogListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserType]

    def get(self, request):
        logs = AuditLog.objects.all().order_by('-timestamp')[:50]  # Latest 50
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)

class DashboardStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            "programs": Program.objects.count(),
            "departments": Department.objects.count(),
            "courses": Course.objects.count(),
            "assessments": Assessment.objects.count(),
        })

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
        log_assessment_event(instance, self.request.user ,'CREATE')
        
    def perform_update(self, serializer):
        instance = serializer.save()
        instance._current_user = self.request.user
        instance.save()
        log_assessment_event(instance, self.request.user,  'UPDATE')
        
    
    @action(detail=True, methods=['get'], url_path='calculate-score')
    def calculate_score(self, request, pk=None):
        """Calculate the assessment score based on all components"""
        assessment = self.get_object()
        result = AssessmentService.calculate_assessment_score(assessment.id)
        return Response(result)
    @action(detail=False, methods=['get'], url_path='average-score')
    def average_score(self, request):
        all_assessments = Assessment.objects.all()
        if not all_assessments.exists():
            return Response({'average_score': 0})

        total = 0
        count = 0

        for assessment in all_assessments:
            result = AssessmentService.calculate_assessment_score(assessment.id)
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
            score_data = AssessmentService.calculate_assessment_score(assessment.id)
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
                score_data = AssessmentService.calculate_assessment_score(assessment.id)
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
            assessment_id=instance.assessment_id.id,
            assessment_name=f"{instance.assessment_id.name} - Continuous Improvement",
            event_type='UPDATE',
            score=pre_score,
            average_score_at_time=pre_score,
            user=user
        )
    

class AcademicPerformanceViewSet(viewsets.ModelViewSet):
    queryset = AcademicPerformance.objects.all()  
    serializer_class = AcademicPerformanceSerializer
    
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
            assessment_id=instance.assessment_id.id,
            assessment_name=f"{instance.assessment_id.name} - Continuous Improvement",
            event_type='UPDATE',
            score=pre_score,
            average_score_at_time=pre_score,
            user=user
        )

class AssessmentLearningOutcomeViewSet(viewsets.ModelViewSet):
    queryset = AssessmentLearningOutcome.objects.all()  # Keep this for URL generation
    serializer_class = AssessmentLearningOutcomeSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        assessment_id = self.request.query_params.get('assessment_id', None)
        if assessment_id is not None:
            queryset = queryset.filter(assessment=assessment_id)
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
            assessment_id=instance.assessment_id.id,
            assessment_name=f"{instance.assessment_id.name} - Continuous Improvement",
            event_type='UPDATE',
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