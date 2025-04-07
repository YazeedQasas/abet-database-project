from django.db import models

class Assessment(models.Model):
    Assessment_id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    date = models.DateField()
    program_ID = models.BigIntegerField()
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
    assessment_id = models.BigIntegerField()
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
    assessment_id = models.BigIntegerField()
    
    def __str__(self):
        return f"Academic Performance for Assessment {self.assessment_id}"

class AssessmentLearningOutcome(models.Model):
    AssesssmentLearningOutcome_id = models.BigAutoField(primary_key=True)
    description = models.TextField()
    program_id = models.BigIntegerField()
    assessment_id = models.BigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Learning Outcome for Assessment {self.assessment_id}"

class AssessmentLearningOutcome_ABET(models.Model):
    weight = models.IntegerField()
    score = models.IntegerField()
    ABETOutcomes_id = models.BigIntegerField()
    AssessmentLearningoutcome_id = models.BigIntegerField()
    LearningOutcome_id = models.BigIntegerField()
    
    def __str__(self):
        return f"ABET Outcome {self.ABETOutcomes_id} for Assessment {self.AssessmentLearningoutcome_id}"
