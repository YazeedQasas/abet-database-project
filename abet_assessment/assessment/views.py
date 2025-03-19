# assessment/views.py
from rest_framework import viewsets
from .models import ABETStudentOutcome, LearningOutcome, Assessment, AssessmentLearningOutcome, AssessmentResult, ContinuousImprovement
from .serializers import ABETStudentOutcomeSerializer, LearningOutcomeSerializer, AssessmentSerializer, AssessmentLearningOutcomeSerializer, AssessmentResultSerializer, ContinuousImprovementSerializer

class ABETStudentOutcomeViewSet(viewsets.ModelViewSet):
    queryset = ABETStudentOutcome.objects.all()
    serializer_class = ABETStudentOutcomeSerializer

class LearningOutcomeViewSet(viewsets.ModelViewSet):
    queryset = LearningOutcome.objects.all()
    serializer_class = LearningOutcomeSerializer

class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer

class AssessmentLearningOutcomeViewSet(viewsets.ModelViewSet):
    queryset = AssessmentLearningOutcome.objects.all()
    serializer_class = AssessmentLearningOutcomeSerializer

class AssessmentResultViewSet(viewsets.ModelViewSet):
    queryset = AssessmentResult.objects.all()
    serializer_class = AssessmentResultSerializer

class ContinuousImprovementViewSet(viewsets.ModelViewSet):
    queryset = ContinuousImprovement.objects.all()
    serializer_class = ContinuousImprovementSerializer
