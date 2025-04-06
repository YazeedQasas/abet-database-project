from rest_framework import viewsets, permissions
from .models import Department, Faculty, Program, ProgramEducationalObjective, Course, Student, CourseStudent
from .serializer import DepartmentSerializer, FacultySerializer, ProgramSerializer, ProgramEducationalObjectiveSerializer, CourseSerializer, StudentSerializer, CourseStudentSerializer
from users.permissions import IsAdmin, IsFaculty, IsEvaluator, IsReviewer, IsFacultyForProgram
from rest_framework.permissions import IsAuthenticated, AllowAny


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    
    def get_permissions(self):
        # Allow anyone to list departments (needed for registration)
        if self.action == 'list':
            return [AllowAny()]
        # Require authentication for other actions
        return [IsAuthenticated()]

class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer

class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    
    def create(self, request, *args, **kwargs):
        print("Received data:", request.data)
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

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

class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)