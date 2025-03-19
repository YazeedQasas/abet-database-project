from rest_framework import viewsets
from .models import Department, Faculty, Program, ProgramEducationalObjective, Course, Student, CourseStudent
from .serializer import DepartmentSerializer, FacultySerializer, ProgramSerializer, ProgramEducationalObjectiveSerializer, CourseSerializer, StudentSerializer, CourseStudentSerializer

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer

class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer

class ProgramEducationalObjectiveViewSet(viewsets.ModelViewSet):
    queryset = ProgramEducationalObjective.objects.all()
    serializer_class = ProgramEducationalObjectiveSerializer

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class CourseStudentViewSet(viewsets.ModelViewSet):
    queryset = CourseStudent.objects.all()
    serializer_class = CourseStudentSerializer