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
    course = models.ForeignKey(
        'programs.Course', on_delete=models.CASCADE, related_name='assessments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class AssessmentQuestion(models.Model):
    course = models.ForeignKey(
        'programs.Course', on_delete=models.CASCADE, related_name='assessment_questions')
    academic_performance = models.ForeignKey(
        'AcademicPerformance', on_delete=models.CASCADE, related_name='questions')
    question_no = models.PositiveIntegerField()
    question_text = models.TextField()
    mapped_outcomes = models.ManyToManyField('ABETOutcome', blank=True)
    weight = models.FloatField(help_text="Weight as a percentage (0-100)")

    class Meta:
        unique_together = ('academic_performance', 'question_no')

    def save(self, *args, **kwargs):
        if not self.question_no:
            last = AssessmentQuestion.objects.filter(
                academic_performance=self.academic_performance).order_by('-question_no').first()
            self.question_no = (last.question_no if last else 0) + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Q{self.question_no}: {self.question_text[:40]}"


class ContinuousImprovement(AuditedModel):
    action_taken = models.TextField()
    implementation_date = models.DateField()
    effectiveness_measure = models.TextField()
    weight = models.IntegerField()
    score = models.FloatField()
    assessment = models.ForeignKey(
        Assessment, on_delete=models.CASCADE, related_name='continuous_improvements')
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
    assessment_id = models.ForeignKey(
        Assessment, on_delete=models.CASCADE, related_name='academic_performances')

    def __str__(self):
        return f"{self.assessmentType} - {self.assessment_id.name}"


class ABETOutcome(models.Model):
    label = models.CharField(max_length=50)  # e.g., "Outcome A"
    description = models.TextField()

    def __str__(self):
        return self.label


class AssessmentLearningOutcome(AuditedModel):
    AssesssmentLearningOutcome_id = models.BigAutoField(primary_key=True)
    description = models.TextField()
    program_id = models.BigIntegerField()
    assessment = models.ForeignKey(
        Assessment, on_delete=models.CASCADE, related_name='learning_outcomes')
    abet_outcomes = models.ManyToManyField(
        'ABETOutcome', related_name='learning_outcomes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Learning Outcome for Assessment {self.assessment_id}"


class AssessmentLearningOutcome_ABET(models.Model):
    assessment_lo = models.ForeignKey(
        AssessmentLearningOutcome, on_delete=models.CASCADE, related_name="outcome_scores")
    abet_outcome = models.ForeignKey(
        ABETOutcome, on_delete=models.CASCADE, related_name="outcome_scores")

    score = models.IntegerField()
    level_description = models.CharField(max_length=255, blank=True)

    EVIDENCE_CHOICES = [
        ('direct', 'Direct'),
        ('indirect', 'Indirect'),
    ]
    evidence_type = models.CharField(
        max_length=10, choices=EVIDENCE_CHOICES, default='direct')

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
    # ABET score at time of event
    score = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True)
    average_score_at_time = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.event_type} - {self.assessment_name} ({self.timestamp})"


class ABETComplianceMetric(models.Model):
    METRIC_TYPES = [
        ('course_syllabi', 'Course Syllabi Updated'),
        ('assessment_data', 'Assessment Data Collected'),
        ('student_outcomes', 'Student Outcomes Met'),
        ('faculty_training', 'Faculty Training Complete'),
    ]

    metric_type = models.CharField(
        max_length=20, choices=METRIC_TYPES, unique=True)
    current_value = models.FloatField(default=0.0)
    target_value = models.FloatField(default=100.0)
    last_updated = models.DateTimeField(auto_now=True)
    academic_year = models.CharField(max_length=9, default='2024-2025')

    def get_percentage(self):
        if self.target_value > 0:
            return min(100.0, (self.current_value / self.target_value) * 100)
        return 0.0

    def get_status(self):
        percentage = self.get_percentage()
        if percentage >= 95:
            return 'excellent'
        elif percentage >= 80:
            return 'good'
        elif percentage >= 60:
            return 'warning'
        else:
            return 'critical'

    def __str__(self):
        return f"{self.get_metric_type_display()}: {self.get_percentage():.1f}%"


class CourseSyllabus(models.Model):
    course = models.OneToOneField(
        'programs.Course', on_delete=models.CASCADE, related_name='syllabus')
    is_updated = models.BooleanField(default=False)
    last_updated = models.DateTimeField(null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    academic_year = models.CharField(max_length=9, default='2024-2025')

    def __str__(self):
        return f"Syllabus for {self.course.name}"


class FacultyTraining(models.Model):
    faculty = models.ForeignKey(
        'programs.Faculty', on_delete=models.CASCADE, related_name='trainings')
    training_type = models.CharField(max_length=100)
    completion_date = models.DateField(null=True, blank=True, default=None)
    is_completed = models.BooleanField(default=False)
    academic_year = models.CharField(max_length=9, default='2024-2025')

    def __str__(self):
        return f"{self.faculty.name} - {self.training_type}"


class AssessmentMethod(models.Model):
    ASSESSMENT_TYPES = [
        ('direct', 'Direct Assessment'),
        ('indirect', 'Indirect Assessment'),
    ]

    METHOD_TYPES = [
        ('exam_questions', 'Exam Questions'),
        ('project_rubrics', 'Project Rubrics'),
        ('student_surveys', 'Student Surveys'),
        ('alumni_feedback', 'Alumni Feedback'),
        ('lab_reports', 'Lab Reports'),
        ('capstone_projects', 'Capstone Projects'),
    ]

    name = models.CharField(max_length=100, choices=METHOD_TYPES)
    assessment_type = models.CharField(max_length=20, choices=ASSESSMENT_TYPES)
    description = models.TextField()
    target_completion_rate = models.FloatField(
        default=80.0)  # Target percentage
    target_score = models.FloatField(default=3.0)  # Target average score
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


class CourseAssessmentMethod(models.Model):
    course = models.ForeignKey('programs.Course', on_delete=models.CASCADE)
    assessment_method = models.ForeignKey(
        AssessmentMethod, on_delete=models.CASCADE)
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    completion_status = models.BooleanField(default=False)
    score = models.FloatField(null=True, blank=True)
    completion_date = models.DateField(null=True, blank=True)
    semester = models.CharField(max_length=20, default='Fall 2024')

    class Meta:
        unique_together = ['course', 'assessment_method', 'assessment']


class ComplianceMetric(models.Model):
    METRIC_TYPES = [
        ('completion_rate', 'Completion Rate'),
        ('average_score', 'Average Score'),
        ('time_to_completion', 'Time to Completion'),
        ('abet_coverage', 'ABET Outcome Coverage'),
    ]

    name = models.CharField(max_length=100)
    metric_type = models.CharField(max_length=30, choices=METRIC_TYPES)
    target_value = models.FloatField()
    current_value = models.FloatField()
    measurement_date = models.DateField(auto_now_add=True)
    semester = models.CharField(max_length=20, default='Fall 2024')
    is_compliant = models.BooleanField(default=False)
