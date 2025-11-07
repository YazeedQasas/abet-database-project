# assessment/management/commands/populate_assessment_methods.py
from django.core.management.base import BaseCommand
from assessment.models import AssessmentMethod, CourseAssessmentMethod, Assessment
from programs.models import Course
import random

class Command(BaseCommand):
    def handle(self, *args, **options):
        # Create assessment methods
        methods_data = [
            ('exam_questions', 'direct', 'Exam Questions', 85.0, 3.2),
            ('project_rubrics', 'direct', 'Project Rubrics', 90.0, 3.4),
            ('student_surveys', 'indirect', 'Student Surveys', 75.0, 3.1),
            ('alumni_feedback', 'indirect', 'Alumni Feedback', 70.0, 3.3),
        ]
        
        for method_type, assessment_type, description, target_completion, target_score in methods_data:
            method, created = AssessmentMethod.objects.get_or_create(
                name=method_type,
                defaults={
                    'assessment_type': assessment_type,
                    'description': description,
                    'target_completion_rate': target_completion,
                    'target_score': target_score
                }
            )
            
            # Create course assessment method records
            courses = Course.objects.all()
            assessments = Assessment.objects.all()
            
            for course in courses:
                for assessment in assessments.filter(course=course):
                    # Simulate realistic completion rates
                    completion_rates = {
                        'exam_questions': 0.85,
                        'project_rubrics': 0.92,
                        'student_surveys': 0.78,
                        'alumni_feedback': 0.65
                    }
                    
                    is_completed = random.random() < completion_rates.get(method_type, 0.8)
                    score = random.uniform(2.8, 3.6) if is_completed else None
                    
                    CourseAssessmentMethod.objects.get_or_create(
                        course=course,
                        assessment_method=method,
                        assessment=assessment,
                        defaults={
                            'completion_status': is_completed,
                            'score': score,
                            'semester': 'Fall 2024'
                        }
                    )
        
        self.stdout.write(self.style.SUCCESS('Assessment methods populated successfully!'))
