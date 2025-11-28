from rest_framework import serializers
from .models import Department, Faculty, Program, ProgramEducationalObjective, Course, Student, CourseStudent, SemesterCourseAssignment
from assessment.serializers import AssessmentSerializer
from assessment.services import AssessmentService

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class FacultySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Faculty
        fields = '__all__'

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = '__all__'
    def create(self, validated_data):
        print("Creating program with data:", validated_data)
        return super().create(validated_data)

class ProgramEducationalObjectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramEducationalObjective
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    assessments = AssessmentSerializer(many=True, read_only=True)
    average_score = serializers.SerializerMethodField()
    class Meta:
        model = Course
        fields = '__all__'
    def get_average_score(self, obj):
        assessments = obj.assessments.all()
        if not assessments.exists():
            return 0.0
        total_score = 0
        count = 0
        for assessment in assessments:
            try:
                result = AssessmentService.calculate_assessment_score(assessment.id)
                total_score += result.get('total_score', 0)
                count += 1
            except:
                continue
        return round(total_score / count, 2) if count > 0 else 0.0


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class CourseStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseStudent
        fields = '__all__'

class SemesterCourseAssignmentSerializer(serializers.ModelSerializer):
    course_details = CourseSerializer(source='course', read_only=True)
    instructor_details = FacultySerializer(source='instructor', read_only=True)
    program_details = ProgramSerializer(source='program', read_only=True)
    
    class Meta:
        model = SemesterCourseAssignment
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')