# core/models.py
from django.db import models
from programs.models import Program, Department


class InstitutionalSupport(models.Model):
    program = models.ForeignKey('programs.Program', on_delete=models.CASCADE, related_name='institutional_support')
    budget_allocation = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    leadership_description = models.TextField()
    resources_description = models.TextField()
    fiscal_year = models.CharField(max_length=9)  # e.g., "2025-2026"
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Support for {self.program.name} - {self.fiscal_year}"

class ProgramCriteria(models.Model):
    program = models.ForeignKey('programs.Program', on_delete=models.CASCADE, related_name='program_criteria')
    discipline = models.CharField(max_length=100)  # e.g., "Civil Engineering"
    lead_society = models.CharField(max_length=100)  # e.g., "American Society of Civil Engineers"
    curriculum_requirements = models.TextField()
    faculty_requirements = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Criteria for {self.program.name} - {self.discipline}"

class Meeting(models.Model):
    name = models.CharField(max_length=100)
    date = models.DateField()
    department = models.ForeignKey('programs.Department', on_delete=models.CASCADE, related_name='meetings')
    report = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Document(models.Model):
    name = models.CharField(max_length=100)
    document_type = models.CharField(max_length=50)
    submission_date = models.DateField()
    file = models.FileField(upload_to='documents/')
    program = models.ForeignKey('programs.Program', on_delete=models.CASCADE, related_name='documents')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class MastersLevelRequirement(models.Model):
    program = models.OneToOneField('programs.Program', on_delete=models.CASCADE, related_name='masters_requirements')
    individual_study_plan = models.BooleanField(default=False)
    advanced_topics = models.TextField()
    minimum_credits = models.IntegerField(default=30)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Masters Requirements for {self.program.name}"
