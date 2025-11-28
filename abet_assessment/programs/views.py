from rest_framework import viewsets, permissions
from .models import Department, Faculty, Program, ProgramEducationalObjective, Course, Student, CourseStudent, SemesterCourseAssignment
from .serializer import DepartmentSerializer, FacultySerializer, ProgramSerializer, ProgramEducationalObjectiveSerializer, CourseSerializer, StudentSerializer, CourseStudentSerializer, SemesterCourseAssignmentSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from users.permissions import IsAdminUserType


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, IsAdminUserType]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only admin can create/update/delete
            return [IsAuthenticated(), IsAdminUserType()]
        return [IsAuthenticated()]  # Anyone logged in can view


class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer


class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='courses')
    def get_courses(self, request, pk=None):
        program = self.get_object()
        courses = Course.objects.filter(program=program)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only admin can create/update/delete
            return [IsAuthenticated(), IsAdminUserType()]
        return [IsAuthenticated()]  # Anyone logged in can view


class ProgramEducationalObjectiveViewSet(viewsets.ModelViewSet):
    queryset = ProgramEducationalObjective.objects.all()
    serializer_class = ProgramEducationalObjectiveSerializer


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    lookup_field = 'code'

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only admin can create/update/delete
            return [IsAuthenticated(), IsAdminUserType()]
        return [IsAuthenticated()]  # Anyone logged in can view


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer


class CourseStudentViewSet(viewsets.ModelViewSet):
    queryset = CourseStudent.objects.all()
    serializer_class = CourseStudentSerializer


class SemesterCourseAssignmentViewSet(viewsets.ModelViewSet):
    queryset = SemesterCourseAssignment.objects.all()
    serializer_class = SemesterCourseAssignmentSerializer

    def get_queryset(self):
        """Allow filtering by academic_year and semester via query parameters"""
        queryset = SemesterCourseAssignment.objects.all()
        academic_year = self.request.query_params.get('academic_year', None)
        semester = self.request.query_params.get('semester', None)
        
        if academic_year:
            queryset = queryset.filter(academic_year=academic_year)
        if semester:
            queryset = queryset.filter(semester=semester)
            
        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only admin/HOD/Dean can create/update/delete
            return [IsAuthenticated(), IsAdminUserType()]
        return [IsAuthenticated()]  # Anyone logged in can view
