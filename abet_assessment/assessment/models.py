# assessment/models.py
from django.db import models
from programs.models import Program, Course, Student

class ABETStudentOutcome(models.Model):
    """ABET's 7 student outcomes (1-7) for engineering programs"""
    number = models.IntegerField(choices=[(i, i) for i in range(1, 8)])
    description = models.TextField()
    
    def __str__(self):
        return f"ABET Outcome {self.number}: {self.description[:50]}..."

class LearningOutcome(models.Model):
    description = models.TextField()
    program = models.ForeignKey('programs.Program', on_delete=models.CASCADE, related_name='learning_outcomes')
    abet_outcomes = models.ManyToManyField(ABETStudentOutcome, related_name='program_outcomes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Outcome for {self.program.name}: {self.description[:50]}..."

class Assessment(models.Model):
    name = models.CharField(max_length=100)
    date = models.DateField()
    program = models.ForeignKey('programs.Program', on_delete=models.CASCADE, related_name='assessments')
    learning_outcomes = models.ManyToManyField(LearningOutcome, through='AssessmentLearningOutcome')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class AssessmentLearningOutcome(models.Model):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    outcome = models.ForeignKey(LearningOutcome, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('assessment', 'outcome')

class AssessmentResult(models.Model):
    student = models.ForeignKey('programs.Student', on_delete=models.CASCADE)
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    grade = models.CharField(max_length=10)
    date = models.DateField()
    comments = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student} - {self.assessment} - {self.grade}"

class ContinuousImprovement(models.Model):
    program = models.ForeignKey('programs.Program', on_delete=models.CASCADE, related_name='improvements')
    assessment_result = models.ForeignKey(AssessmentResult, on_delete=models.CASCADE, related_name='improvements')
    action_taken = models.TextField()
    implementation_date = models.DateField()
    effectiveness_measure = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Improvement for {self.program.name} based on {self.assessment_result}"
