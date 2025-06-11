from rest_framework import serializers
from .models import (
    Assessment, ContinuousImprovement, AcademicPerformance, 
    AssessmentLearningOutcome, AssessmentLearningOutcome_ABET, AuditLog,
    AssessmentEvent, FacultyTraining
)
from .services import AssessmentService
from datetime import date

class FacultyTrainingSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)
    faculty_email = serializers.CharField(source='faculty.email', read_only=True)
    completion_date = serializers.DateField(required=False, allow_null=True)  # Allow null dates
    
    def validate(self, data):
        # If training is marked as completed, require a completion date
        if data.get('is_completed') and not data.get('completion_date'):
            data['completion_date'] = date.today()  # Auto-set to today if not provided
        
        # If training is not completed, clear the completion date
        if not data.get('is_completed'):
            data['completion_date'] = None
            
        return data

    class Meta:
        model = FacultyTraining
        fields = '__all__'

class AssessmentSerializer(serializers.ModelSerializer):
    score = serializers.SerializerMethodField()
    
    class Meta:
        model = Assessment
        fields = '__all__'
        
    def get_score(self, obj):
        try:
            result = AssessmentService.calculate_assessment_score(obj.id)
            return round(result.get('total_score', 0), 2)
        except Exception as e:
            print(f"Error calculating score for assessment {obj.id}: {e}")
            return 0.0
    
class ContinuousImprovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContinuousImprovement
        fields = '__all__'

class AcademicPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicPerformance
        fields = '__all__'

class AssessmentLearningOutcomeSerializer(serializers.ModelSerializer):
        abet_outcomes_scores = serializers.ListField(write_only=True)

        class Meta:
            model = AssessmentLearningOutcome
            fields = [
                'AssesssmentLearningOutcome_id',
                'description',
                'program_id',
                'assessment',
                'abet_outcomes_scores',
            ]
        def create(self, validated_data):
            abet_outcomes_scores = validated_data.pop('abet_outcomes_scores', [])
            outcome = AssessmentLearningOutcome.objects.create(**validated_data)

            for score_data in abet_outcomes_scores:
                AssessmentLearningOutcome_ABET.objects.create(
                    assessment_lo=outcome,
                    abet_outcome_id=score_data['abet_outcome'],
                    score=score_data['score'],
                    evidence_type=score_data.get('evidence_type', 'direct')
                )

            return outcome

class AssessmentLearningOutcomeABETSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentLearningOutcome_ABET
        fields = '__all__'


class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = AuditLog
        fields = ['id', 'username', 'action', 'target_model', 'target_id', 'changes', 'timestamp']

from .models import ABETOutcome

class ABETOutcomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ABETOutcome
        fields = ['id', 'label', 'description']

class AssessmentEventSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = AssessmentEvent
        fields = ['id', 'assessment_id', 'assessment_name', 'event_type', 
                  'score', 'timestamp', 'username', 'average_score_at_time']

