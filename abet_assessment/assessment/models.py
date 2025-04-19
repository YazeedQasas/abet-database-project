from django.db import models


class Assessment(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    date = models.DateField()
    course = models.ForeignKey('programs.Course', on_delete=models.CASCADE, related_name='Assessment')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class ContinuousImprovement(models.Model):
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


class AcademicPerformance(models.Model):
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


class AssessmentLearningOutcome(models.Model):
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
