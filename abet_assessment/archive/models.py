from django.db import models
from django.contrib.auth.models import User
from programs.models import Faculty


class SyllabusUploadStatus(models.Model):
    """
    Tracks syllabus upload completion status for professors.
    Allows manual marking of completion and automatic file detection.
    """
    SEMESTER_CHOICES = [
        ('First', 'First Semester'),
        ('Second', 'Second Semester'),
        ('Summer', 'Summer Semester'),
    ]
    
    academic_year = models.CharField(max_length=20, help_text="e.g., 2024-2025")
    semester = models.CharField(max_length=10, choices=SEMESTER_CHOICES)
    professor = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='syllabus_statuses')
    course_name = models.CharField(max_length=255)
    
    # Completion tracking
    is_completed = models.BooleanField(default=False, help_text="Manually marked as complete")
    has_files = models.BooleanField(default=False, help_text="Auto-detected: has files in syllabus folder")
    
    # Audit fields
    marked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='marked_syllabi')
    marked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['academic_year', 'semester', 'professor', 'course_name']
        ordering = ['academic_year', 'semester', 'professor__name', 'course_name']
        verbose_name = 'Syllabus Upload Status'
        verbose_name_plural = 'Syllabus Upload Statuses'
    
    def __str__(self):
        return f"{self.professor.name} - {self.course_name} ({self.academic_year} {self.semester})"
