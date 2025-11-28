from django.contrib import admin
from .models import SyllabusUploadStatus


@admin.register(SyllabusUploadStatus)
class SyllabusUploadStatusAdmin(admin.ModelAdmin):
    list_display = ['professor', 'course_name', 'academic_year', 'semester', 'is_completed', 'has_files', 'marked_at']
    list_filter = ['academic_year', 'semester', 'is_completed', 'has_files']
    search_fields = ['professor__name', 'course_name']
    readonly_fields = ['created_at', 'updated_at', 'has_files']
    date_hierarchy = 'marked_at'
