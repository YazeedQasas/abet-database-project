import sys
import os
import django
from django.conf import settings

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'abet_assessment.settings')
django.setup()

from assessment.models import FacultyTraining, Assessment, CourseSyllabus
from assessment.services import AssessmentService
from assessment.serializers import FacultyTrainingSerializer
from programs.models import Faculty

print("=== DEBUGGING DATA INTEGRITY ===")

print("\n1. Checking FacultyTraining objects...")
trainings = FacultyTraining.objects.all()
print(f"Found {trainings.count()} training records.")
for t in trainings:
    try:
        print(f"  Training ID: {t.id}, Faculty: {t.faculty.name} (ID: {t.faculty.id})")
        # Try serializing
        serializer = FacultyTrainingSerializer(t)
        data = serializer.data
    except Exception as e:
        print(f"  ERROR accessing/serializing Training ID {t.id}: {e}")

print("\n2. Checking AssessmentService.calculatedynamiccompliancemetrics()...")
try:
    metrics = AssessmentService.calculatedynamiccompliancemetrics()
    print("  Success! Metrics calculated.")
except Exception as e:
    print(f"  ERROR in calculatedynamiccompliancemetrics: {e}")
    import traceback
    traceback.print_exc()

print("\n3. Checking DashboardStatsView logic...")
try:
    stats = AssessmentService.get_dashboard_statistics()
    print("  Basic stats:", stats)
    outcomes = AssessmentService.get_abet_outcomes_dashboard_data()
    print(f"  ABET outcomes: {len(outcomes)}")
    courses = AssessmentService.get_courses_assessment_summary()
    print(f"  Courses summary: {len(courses)}")
except Exception as e:
    print(f"  ERROR in DashboardStatsView logic: {e}")
    import traceback
    traceback.print_exc()

print("\n=== DEBUGGING COMPLETE ===")
