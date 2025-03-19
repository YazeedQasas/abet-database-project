# assessment/serializers.py
from rest_framework import serializers
from .models import ABETStudentOutcome, LearningOutcome, Assessment, AssessmentLearningOutcome, AssessmentResult, ContinuousImprovement

class ABETStudentOutcomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ABETStudentOutcome
        fields = '__all__'

class LearningOutcomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningOutcome
        fields = '__all__'

class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = '__all__'

class AssessmentLearningOutcomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentLearningOutcome
        fields = '__all__'

class AssessmentResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentResult
        fields = '__all__'

class ContinuousImprovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContinuousImprovement
        fields = '__all__'
