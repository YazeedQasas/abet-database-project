from rest_framework import serializers
from .models import (
    Assessment, ContinuousImprovement, AcademicPerformance,
    AssessmentLearningOutcome, AssessmentLearningOutcome_ABET, AuditLog,
    AssessmentEvent, FacultyTraining, AssessmentQuestion
)
from .services import AssessmentService
from datetime import date
from django.db.models import Sum
from .models import ABETOutcome


class ABETOutcomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ABETOutcome
        fields = ['id', 'label', 'description']


class AssessmentLearningOutcomeABETSerializer(serializers.ModelSerializer):
    abetoutcome = ABETOutcomeSerializer(source='abet_outcome', read_only=True)

    class Meta:
        model = AssessmentLearningOutcome_ABET
        fields = ['abetoutcome', 'score', 'evidence_type', 'level_description']


class FacultyTrainingSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)
    faculty_email = serializers.CharField(
        source='faculty.email', read_only=True)
    completion_date = serializers.DateField(
        required=False, allow_null=True)  # Allow null dates

    def validate(self, data):
        # If training is marked as completed, require a completion date
        if data.get('is_completed') and not data.get('completion_date'):
            # Auto-set to today if not provided
            data['completion_date'] = date.today()

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
            result = AssessmentService.calculate_assessment_score(
                obj.id)  # ✅ Fixed method name
            return round(result.get('total_score', 0), 2)  # ✅ Use correct key
        except Exception as e:
            print(f"Error calculating score for assessment {obj.id}: {e}")
            return 0.0


# 1. A simple, nested serializer to provide outcome details for reading
class ABETOutcomeNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = ABETOutcome
        fields = ['id', 'label']  # Provide just the ID and label for the badge


class AssessmentQuestionSerializer(serializers.ModelSerializer):
    # 2. This read-only field gets the name from the related AcademicPerformance object
    academic_performance_name = serializers.CharField(
        source='academic_performance.assessmentType', read_only=True)

    # 3. This uses the nested serializer to provide a list of outcome objects for reading
    mapped_outcomes = ABETOutcomeNestedSerializer(many=True, read_only=True)

    # 4. This field is used ONLY when writing data (POST/PUT)
    # It accepts a simple list of outcome IDs from your frontend form
    mapped_outcomes_ids = serializers.PrimaryKeyRelatedField(
        queryset=ABETOutcome.objects.all(),
        source='mapped_outcomes',
        many=True,
        write_only=True
    )

    class Meta:
        model = AssessmentQuestion
        # 5. The complete list of fields for your API
        fields = [
            'id',
            'question_no',
            'question_text',
            'weight',
            'academic_performance',  # The ID for writing
            'academic_performance_name',  # The name for reading
            'mapped_outcomes',  # The list of outcome objects for reading
            'mapped_outcomes_ids',  # The list of IDs for writing
            'course',
        ]
        extra_kwargs = {
            'course': {'write_only': True}
        }

    def validate(self, data):
        """
        Check for uniqueness of question_no for the given academic_performance.
        This provides a user-friendly error message for duplicates.
        """
        if not self.instance:
            academic_performance = data.get('academic_performance')
            question_no = data.get('question_no')

            if AssessmentQuestion.objects.filter(
                academic_performance=academic_performance,
                question_no=question_no
            ).exists():
                raise serializers.ValidationError(
                    f"A question with number {question_no} already exists for this exam."
                )
        return data


class ContinuousImprovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContinuousImprovement
        fields = '__all__'

    def validate_assessment_id(self, value):
        """Ensure the assessment exists and return the ID"""
        # If value is already an integer, return it
        if isinstance(value, int):
            if not Assessment.objects.filter(id=value).exists():
                raise serializers.ValidationError("Assessment does not exist")
            return value

        # If value is an Assessment instance, return its ID
        if hasattr(value, 'id'):
            return value.id

        raise serializers.ValidationError("Invalid assessment reference")

    def create(self, validated_data):
        print("🔍 Creating CI with data:", validated_data)
        return super().create(validated_data)


class AcademicPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicPerformance
        fields = '__all__'


class AssessmentLearningOutcomeSerializer(serializers.ModelSerializer):
    abet_outcomes_scores = serializers.ListField(
        write_only=True, required=False)
    abetoutcomesscores = AssessmentLearningOutcomeABETSerializer(
        source='outcome_scores',
        many=True,
        read_only=True
    )

    class Meta:
        model = AssessmentLearningOutcome
        fields = [
            'AssesssmentLearningOutcome_id',
            'description',
            'program_id',
            'assessment',
            'abet_outcomes_scores',  # For writing
            'abetoutcomesscores',    # For reading (matches your frontend)
        ]

    def create(self, validated_data):
        abet_outcomes_scores = validated_data.pop('abet_outcomes_scores', [])
        outcome = AssessmentLearningOutcome.objects.create(**validated_data)

        for score_data in abet_outcomes_scores:
            AssessmentLearningOutcome_ABET.objects.create(
                assessment_lo=outcome,  # Fixed field name
                abet_outcome_id=score_data['abet_outcome'],
                score=score_data['score'],
                evidence_type=score_data.get('evidence_type', 'direct'),
                level_description=score_data.get('level_description', '')
            )

        return outcome

    def update(self, instance, validated_data):
        abet_outcomes_scores = validated_data.pop('abet_outcomes_scores', None)

        # Update the main instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update ABET outcomes if provided
        if abet_outcomes_scores is not None:
            # Delete existing ABET outcomes
            AssessmentLearningOutcome_ABET.objects.filter(
                assessmentlo=instance).delete()

            # Create new ones
            for score_data in abet_outcomes_scores:
                AssessmentLearningOutcome_ABET.objects.create(
                    assessmentlo=instance,
                    abetoutcome_id=score_data['abet_outcome'],
                    score=score_data['score'],
                    evidence_type=score_data.get('evidence_type', 'direct'),
                    level_description=score_data.get('level_description', '')
                )

        return instance


class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    target_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ['id', 'username', 'action', 'target_model',
                  'target_id', 'target_name', 'changes', 'timestamp']

    def get_target_name(self, obj):
        """Get the name of the target object based on model and ID"""
        try:
            if obj.target_model == 'Assessment':
                from .models import Assessment
                assessment = Assessment.objects.get(id=obj.target_id)
                return assessment.name
            elif obj.target_model == 'ContinuousImprovement':
                return f"Continuous Improvement #{obj.target_id}"
            elif obj.target_model == 'AcademicPerformance':
                return f"Academic Performance #{obj.target_id}"
            elif obj.target_model == 'AssessmentLearningOutcome':
                return f"Learning Outcome #{obj.target_id}"
            else:
                return f"{obj.target_model} #{obj.target_id}"
        except Exception:
            # Fallback if object doesn't exist or any error occurs
            return f"{obj.target_model} #{obj.target_id}"


class AssessmentEventSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = AssessmentEvent
        fields = ['id', 'assessment_id', 'assessment_name', 'event_type',
                  'score', 'timestamp', 'username', 'average_score_at_time']
