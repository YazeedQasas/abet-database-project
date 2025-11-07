from django.core.management.base import BaseCommand
from assessment.models import *
from programs.models import *
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Populate comprehensive ABET data for dashboard'

    def handle(self, *args, **options):
        self.stdout.write('🚀 Populating comprehensive ABET data...')
        
        # 1. Create ABET Outcomes (if not exist)
        abet_outcomes_data = [
            ('SO1', 'Engineering problem solving using math, science, and engineering principles'),
            ('SO2', 'Engineering design to meet specified needs with public health, safety, and welfare considerations'),
            ('SO3', 'Effective communication with diverse audiences'),
            ('SO4', 'Ethical and professional responsibilities in engineering situations'),
            ('SO5', 'Effective teamwork with diverse team members'),
            ('SO6', 'Experimentation, data analysis, and engineering judgment'),
            ('SO7', 'Lifelong learning and knowledge acquisition'),
        ]
        
        for label, description in abet_outcomes_data:
            outcome, created = ABETOutcome.objects.get_or_create(
                label=label,
                defaults={'description': description}
            )
            if created:
                self.stdout.write(f'✅ Created ABET Outcome: {label}')
        
        # 2. Ensure we have departments and programs
        cs_dept, _ = Department.objects.get_or_create(
            name='Computer Science Department',
            defaults={'email': 'cs@university.edu'}
        )
        
        ee_dept, _ = Department.objects.get_or_create(
            name='Electrical Engineering Department', 
            defaults={'email': 'ee@university.edu'}
        )
        
        # Create faculty for training tracking
        faculty_data = [
            ('Dr. John Smith', cs_dept, 'john.smith@university.edu'),
            ('Dr. Sarah Johnson', cs_dept, 'sarah.johnson@university.edu'),
            ('Dr. Michael Brown', ee_dept, 'michael.brown@university.edu'),
            ('Dr. Lisa Davis', ee_dept, 'lisa.davis@university.edu'),
        ]
        
        for name, dept, email in faculty_data:
            faculty, created = Faculty.objects.get_or_create(
                name=name,
                defaults={
                    'department': dept,
                    'email': email,
                    'qualifications': 'PhD in Engineering',
                    'expertise': 'ABET Assessment and Curriculum Development'
                }
            )
            if created:
                self.stdout.write(f'✅ Created Faculty: {name}')
        
        # 3. Create programs
        cs_program, _ = Program.objects.get_or_create(
            name='Computer Science',
            defaults={
                'description': 'Bachelor of Science in Computer Science',
                'department': cs_dept,
                'level': 'B'
            }
        )
        
        ee_program, _ = Program.objects.get_or_create(
            name='Electrical Engineering',
            defaults={
                'description': 'Bachelor of Science in Electrical Engineering', 
                'department': ee_dept,
                'level': 'B'
            }
        )
        
        # 4. Create courses with realistic data
        courses_data = [
            ('Software Engineering', cs_program, 3),
            ('Database Systems', cs_program, 3),
            ('Web Development', cs_program, 3),
            ('Data Structures', cs_program, 4),
            ('Circuit Analysis', ee_program, 4),
            ('Digital Systems', ee_program, 3),
            ('Signal Processing', ee_program, 3),
            ('Power Systems', ee_program, 4),
        ]
        
        created_courses = []
        for course_name, program, credits in courses_data:
            course, created = Course.objects.get_or_create(
                name=course_name,
                defaults={
                    'description': f'Advanced course in {course_name}',
                    'credits': credits,
                    'program': program
                }
            )
            created_courses.append(course)
            if created:
                self.stdout.write(f'✅ Created Course: {course_name}')
        
        # 5. Create course syllabi tracking
        for course in created_courses:
            syllabus, created = CourseSyllabus.objects.get_or_create(
                course=course,
                defaults={
                    'is_updated': random.choice([True, True, True, False]),  # 75% updated
                    'last_updated': timezone.now(),
                    'academic_year': '2024-2025'
                }
            )
        
        # 6. Create faculty training records
        training_types = [
            'ABET Assessment Training',
            'Curriculum Development Workshop', 
            'Student Outcome Evaluation',
            'Continuous Improvement Methods'
        ]
        
        for faculty in Faculty.objects.all():
            for training_type in training_types:
                training, created = FacultyTraining.objects.get_or_create(
                    faculty=faculty,
                    training_type=training_type,
                    defaults={
                        'is_completed': random.choice([True, True, False]),  # 67% completion
                        'completion_date': timezone.now().date() if random.choice([True, False]) else None,
                        'academic_year': '2024-2025'
                    }
                )
        
        # 7. Create assessments with comprehensive data
        for course in created_courses:
            # Create 1-2 assessments per course
            for i in range(random.randint(1, 2)):
                assessment, created = Assessment.objects.get_or_create(
                    name=f'{course.name} Assessment {i+1}',
                    defaults={
                        'date': timezone.now().date(),
                        'course': course
                    }
                )
                
                if created:
                    # Add Continuous Improvement data
                    ContinuousImprovement.objects.get_or_create(
                        assessment_id=assessment,
                        defaults={
                            'action_taken': f'Enhanced {course.name} curriculum based on student feedback',
                            'implementation_date': timezone.now().date(),
                            'effectiveness_measure': 'Improved student performance and satisfaction',
                            'weight': 30,
                            'score': random.uniform(75, 95)  # Good scores
                        }
                    )
                    
                    # Add Academic Performance data
                    AcademicPerformance.objects.get_or_create(
                        assessment_id=assessment,
                        defaults={
                            'assessmentType': random.choice(['Final Exam', 'Project', 'Lab Assessment']),
                            'high': random.uniform(90, 100),
                            'mean': random.uniform(75, 85),
                            'low': random.uniform(60, 70),
                            'grade': random.randint(75, 90),
                            'weight': 40,
                            'course_id': course.id,
                            'instructor_id': 1,
                            'description': f'{course.name} comprehensive assessment'
                        }
                    )
                    
                    # Add Learning Outcomes
                    learning_outcome, _ = AssessmentLearningOutcome.objects.get_or_create(
                        description=f'Students demonstrate mastery of {course.name} concepts',
                        defaults={
                            'program_id': course.program.id,
                            'assessment': assessment
                        }
                    )
                    
                    # Add ABET Outcome Scores (realistic distribution)
                    for outcome in ABETOutcome.objects.all():
                        # Create realistic scores (mostly 3-4, some 2s)
                        score_distribution = [2, 3, 3, 3, 4, 4]
                        score = random.choice(score_distribution)
                        
                        AssessmentLearningOutcome_ABET.objects.get_or_create(
                            assessment_lo=learning_outcome,
                            abet_outcome=outcome,
                            defaults={
                                'score': score,
                                'evidence_type': random.choice(['direct', 'indirect'])
                            }
                        )
        
        # 8. Display results
        self.stdout.write('\n📊 Data Population Summary:')
        self.stdout.write(f'Programs: {Program.objects.count()}')
        self.stdout.write(f'Courses: {Course.objects.count()}')
        self.stdout.write(f'Assessments: {Assessment.objects.count()}')
        self.stdout.write(f'ABET Outcomes: {ABETOutcome.objects.count()}')
        self.stdout.write(f'Faculty: {Faculty.objects.count()}')
        self.stdout.write(f'Course Syllabi: {CourseSyllabus.objects.count()}')
        self.stdout.write(f'Faculty Training Records: {FacultyTraining.objects.count()}')
        self.stdout.write(f'ABET Scores: {AssessmentLearningOutcome_ABET.objects.count()}')
        
        self.stdout.write(self.style.SUCCESS('\n🎉 ABET data population completed successfully!'))
