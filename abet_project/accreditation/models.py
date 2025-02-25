# models.py
from django.db import models

class Department(models.Model):
    department_id = models.AutoField(primary_key=True)
    department_name = models.CharField(max_length=100)
    faculty_id = models.IntegerField()
    email = models.EmailField()

class Faculty(models.Model):
    faculty_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    email = models.EmailField()

class Program(models.Model):
    program_id = models.AutoField(primary_key=True)
    program_name = models.CharField(max_length=100)
    program_description = models.TextField()
    department_id = models.ForeignKey(Department, on_delete=models.CASCADE)

class Course(models.Model):
    course_id = models.AutoField(primary_key=True)
    course_name = models.CharField(max_length=100)
    course_description = models.TextField()
    credits = models.IntegerField()
    program_id = models.ForeignKey(Program, on_delete=models.CASCADE)

class Student(models.Model):
    student_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField()
    enrollment_date = models.DateField()

class CourseStudent(models.Model):
    course_id = models.ForeignKey(Course, on_delete=models.CASCADE)
    student_id = models.ForeignKey(Student, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('course_id', 'student_id')

class LearningOutcomes(models.Model):
    outcome_id = models.AutoField(primary_key=True)
    outcome_description = models.TextField()
    program_id = models.ForeignKey(Program, on_delete=models.CASCADE)

class Assessment(models.Model):
    assessment_id = models.AutoField(primary_key=True)
    assessment_name = models.CharField(max_length=100)
    assessment_date = models.DateField()
    program_id = models.ForeignKey(Program, on_delete=models.CASCADE)

class Assessment_LearningOutcomes(models.Model):
    assessment_id = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    outcome_id = models.ForeignKey(LearningOutcomes, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('assessment_id', 'outcome_id')

class Assessment_Result(models.Model):
    result_id = models.AutoField(primary_key=True)
    student_id = models.ForeignKey(Student, on_delete=models.CASCADE)
    assessment_id = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    grade = models.CharField(max_length=5)
    date = models.DateField()
    comments = models.TextField()

class Documents(models.Model):
    document_id = models.AutoField(primary_key=True)
    document_name = models.CharField(max_length=100)
    file_type = models.CharField(max_length=20)
    submission_date = models.DateField()
    version = models.IntegerField()
    program_id = models.ForeignKey(Program, on_delete=models.CASCADE)
    program_links = models.URLField()

class Users(models.Model):
    users_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField()
    job = models.CharField(max_length=50)  # Admin, Faculty, Staff as noted in your diagram

class Meetings(models.Model):
    meeting_id = models.AutoField(primary_key=True)
    meeting_name = models.CharField(max_length=100)
    meeting_date = models.DateField()
    department_name = models.CharField(max_length=100)
    department_id = models.ForeignKey(Department, on_delete=models.CASCADE)
    meeting_report = models.URLField()

class Department_Course(models.Model):
    department_id = models.ForeignKey(Department, on_delete=models.CASCADE)
    course_id = models.ForeignKey(Course, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('department_id', 'course_id')