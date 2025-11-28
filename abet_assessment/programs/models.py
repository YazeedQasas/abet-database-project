from django.db import models

class Department(models.Model):
    name = models.CharField(max_length=100)
    faculty_id = models.IntegerField(null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name



class Faculty(models.Model):
    user = models.OneToOneField('auth.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='faculty_profile')
    name = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='faculty_members')
    email = models.EmailField()
    qualifications = models.TextField()
    expertise = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Program(models.Model):
    LEVEL_CHOICES = (
        ('B', 'Baccalaureate'),
        ('M', 'Masters'),
    )
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='programs')
    level = models.CharField(max_length=1, choices=LEVEL_CHOICES, default='B')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ProgramEducationalObjective(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='objectives')
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"PEO for {self.program.name}: {self.description[:50]}..."

class Course(models.Model):
    code = models.CharField(max_length=20, unique=True, null=True, blank=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    credits = models.IntegerField()
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='courses')
    instructor = models.ForeignKey(Faculty, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Student(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    enrollment_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class CourseStudent(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('course', 'student')

    def __str__(self):
        return f"{self.student} enrolled in {self.course}"


class SemesterCourseAssignment(models.Model):
    """
    Tracks which courses are assigned to which instructors for specific semesters.
    Used for academic year planning and course scheduling.
    """
    SEMESTER_CHOICES = (
        ('First', 'First Semester'),
        ('Second', 'Second Semester'),
        ('Summer', 'Summer Semester'),
    )
    
    academic_year = models.CharField(max_length=20, help_text="Format: 2024-2025")
    semester = models.CharField(max_length=10, choices=SEMESTER_CHOICES)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='semester_assignments')
    instructor = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='semester_assignments', null=True, blank=True)
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='semester_assignments', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('academic_year', 'semester', 'course', 'instructor')
        ordering = ['academic_year', 'semester', 'instructor__name']
        db_table = 'programs_semestercourseassignment'  # Match existing table name

    def __str__(self):
        return f"{self.course.code} - {self.instructor.name} ({self.academic_year} - {self.semester})"
