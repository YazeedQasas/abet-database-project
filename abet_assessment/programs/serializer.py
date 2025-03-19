from rest_framework import serializers
from .models import Department, Faculty, Program, ProgramEducationalObjective, Course, Student, CourseStudent

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class FacultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = '__all__'

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = '__all__'

class ProgramEducationalObjectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramEducationalObjective
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class CourseStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseStudent
        fields = '__all__'