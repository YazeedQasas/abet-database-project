from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import (
    Assessment, ContinuousImprovement, AcademicPerformance, 
    AssessmentLearningOutcome, AssessmentLearningOutcome_ABET
)
from .serializers import (
    AssessmentSerializer, ContinuousImprovementSerializer, AcademicPerformanceSerializer,
    AssessmentLearningOutcomeSerializer, AssessmentLearningOutcomeABETSerializer
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from programs.models import Program
from programs.models import Course
from programs.models import Department

from .services import AssessmentService

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
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer
    permission_classes = [permissions.AllowAny]
    
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




class ContinuousImprovementViewSet(viewsets.ModelViewSet):
    queryset = ContinuousImprovement.objects.all()
    serializer_class = ContinuousImprovementSerializer
    
    def get_queryset(self):
        queryset = ContinuousImprovement.objects.all()
        assessment_id = self.request.query_params.get('assessment_id', None)
        if assessment_id is not None:
            queryset = queryset.filter(assessment_id=assessment_id)
        return queryset

class AcademicPerformanceViewSet(viewsets.ModelViewSet):
    queryset = AcademicPerformance.objects.all()
    serializer_class = AcademicPerformanceSerializer
    
    def get_queryset(self):
        queryset = AcademicPerformance.objects.all()
        assessment_id = self.request.query_params.get('assessment_id', None)
        if assessment_id is not None:
            queryset = queryset.filter(assessment_id=assessment_id)
        return queryset

class AssessmentLearningOutcomeViewSet(viewsets.ModelViewSet):
    queryset = AssessmentLearningOutcome.objects.all()
    serializer_class = AssessmentLearningOutcomeSerializer
    
    def get_queryset(self):
        queryset = AssessmentLearningOutcome.objects.all()
        assessment_id = self.request.query_params.get('assessment_id', None)
        if assessment_id is not None:
            queryset = queryset.filter(assessment_id=assessment_id)
        return queryset

class AssessmentLearningOutcomeABETViewSet(viewsets.ModelViewSet):
    queryset = AssessmentLearningOutcome_ABET.objects.all()
    serializer_class = AssessmentLearningOutcomeABETSerializer
