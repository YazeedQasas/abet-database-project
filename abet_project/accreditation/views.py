from django.shortcuts import render
from rest_framework import viewsets
from .models import *
from .serializers import *

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer

class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class CourseStudentViewSet(viewsets.ModelViewSet):
    queryset = CourseStudent.objects.all()
    serializer_class = CourseStudentSerializer

class LearningOutcomesViewSet(viewsets.ModelViewSet):
    queryset = LearningOutcomes.objects.all()
    serializer_class = LearningOutcomesSerializer

class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer

class Assessment_LearningOutcomesViewSet(viewsets.ModelViewSet):
    queryset = Assessment_LearningOutcomes.objects.all()
    serializer_class = Assessment_LearningOutcomesSerializer

class Assessment_ResultViewSet(viewsets.ModelViewSet):
    queryset = Assessment_Result.objects.all()
    serializer_class = Assessment_ResultSerializer

class DocumentsViewSet(viewsets.ModelViewSet):
    queryset = Documents.objects.all()
    serializer_class = DocumentsSerializer

class UsersViewSet(viewsets.ModelViewSet):
    queryset = Users.objects.all()
    serializer_class = UsersSerializer

class MeetingsViewSet(viewsets.ModelViewSet):
    queryset = Meetings.objects.all()
    serializer_class = MeetingsSerializer

class Department_CourseViewSet(viewsets.ModelViewSet):
    queryset = Department_Course.objects.all()
    serializer_class = Department_CourseSerializer
