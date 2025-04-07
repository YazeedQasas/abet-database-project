from rest_framework import serializers
from .models import (
    Assessment, ContinuousImprovement, AcademicPerformance, 
    AssessmentLearningOutcome, AssessmentLearningOutcome_ABET
)

class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = '__all__'

class ContinuousImprovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContinuousImprovement
        fields = '__all__'

class AcademicPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicPerformance
        fields = '__all__'

class AssessmentLearningOutcomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentLearningOutcome
        fields = '__all__'

class AssessmentLearningOutcomeABETSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentLearningOutcome_ABET
        fields = '__all__'
