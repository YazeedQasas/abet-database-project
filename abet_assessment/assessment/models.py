from django.db import models
from django.contrib.auth.models import User
from .middleware import get_current_user

class AuditedModel(models.Model):
    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self._current_user = get_current_user()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        self._current_user = get_current_user()
        super().delete(*args, **kwargs)

class Assessment(AuditedModel):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    date = models.DateField()
    course = models.ForeignKey('programs.Course', on_delete=models.CASCADE, related_name='assessments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class ContinuousImprovement(AuditedModel):
    action_taken = models.TextField()
    implementation_date = models.DateField()
    effectiveness_measure = models.TextField()
    weight = models.IntegerField()
    score = models.FloatField()
    assessment_id = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='continuous_improvements')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Continuous Improvement for Assessment {self.assessment_id}"


class AcademicPerformance(AuditedModel):
    assessmentType = models.CharField(max_length=50)
    high = models.FloatField()
    mean = models.FloatField()
    low = models.FloatField()
    grade = models.IntegerField()
    weight = models.IntegerField()
    course_id = models.BigIntegerField()
    instructor_id = models.BigIntegerField()
    description = models.TextField()
    assessment_id = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='academic_performances')

    def __str__(self):
        return f"Academic Performance for Assessment {self.assessment_id}"


class ABETOutcome(models.Model):
    label = models.CharField(max_length=50)  # e.g., "Outcome A"
    description = models.TextField()

    def __str__(self):
        return self.label


class AssessmentLearningOutcome(AuditedModel):
    AssesssmentLearningOutcome_id = models.BigAutoField(primary_key=True)
    description = models.TextField()
    program_id = models.BigIntegerField()
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='learning_outcomes')
    abet_outcomes = models.ManyToManyField('ABETOutcome', related_name='learning_outcomes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Learning Outcome for Assessment {self.assessment_id}"


class AssessmentLearningOutcome_ABET(models.Model):
    assessment_lo = models.ForeignKey(AssessmentLearningOutcome, on_delete=models.CASCADE, related_name="outcome_scores")
    abet_outcome = models.ForeignKey(ABETOutcome, on_delete=models.CASCADE, related_name="outcome_scores")

    score = models.IntegerField()
    level_description = models.CharField(max_length=255, blank=True)

    EVIDENCE_CHOICES = [
        ('direct', 'Direct'),
        ('indirect', 'Indirect'),
    ]
    evidence_type = models.CharField(max_length=10, choices=EVIDENCE_CHOICES, default='direct')

    def save(self, *args, **kwargs):
        LEVEL_MAP = {
            4: "Exceeds Expectations",
            3: "Meets Expectations",
            2: "Approaching Expectations",
            1: "Does Not Meet Expectations",
        }
        if self.score in LEVEL_MAP:
            self.level_description = LEVEL_MAP[self.score]
        else:
            self.level_description = "Unspecified"
        super().save(*args, **kwargs)



class AuditLog(models.Model):
    ACTION_CHOICES = (
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
    )

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    target_model = models.CharField(max_length=100)
    target_id = models.BigIntegerField()
    changes = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} {self.action} on {self.target_model} #{self.target_id}"
    

class AssessmentEvent(models.Model):
    EVENT_TYPES = (
        ('CREATE', 'Created'),
        ('UPDATE', 'Updated'),
        ('DELETE', 'Deleted'),
    )
    
    assessment_id = models.BigIntegerField()
    assessment_name = models.CharField(max_length=100)
    event_type = models.CharField(max_length=10, choices=EVENT_TYPES)
    score = models.FloatField(null=True, blank=True)  # ABET score at time of event
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True)
    average_score_at_time = models.FloatField(default=0.0)
    
    def __str__(self):
        return f"{self.event_type} - {self.assessment_name} ({self.timestamp})"
