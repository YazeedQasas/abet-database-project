# Create assessment/management/commands/debug_abet_data.py
from django.core.management.base import BaseCommand
from assessment.models import *
from programs.models import *

class Command(BaseCommand):
    def handle(self, *args, **options):
        print("🔍 ABET Data Debug:")
        print(f"Total Assessments: {Assessment.objects.count()}")
        print(f"Total ABET Outcomes: {ABETOutcome.objects.count()}")
        print(f"Total Learning Outcomes: {AssessmentLearningOutcome.objects.count()}")
        print(f"Total ABET Scores: {AssessmentLearningOutcome_ABET.objects.count()}")
        print(f"Total Course Syllabi: {CourseSyllabus.objects.count()}")
        print(f"Total Faculty Training: {FacultyTraining.objects.count()}")
        
        print("\n📊 Sample ABET Scores:")
        for score in AssessmentLearningOutcome_ABET.objects.all()[:10]:
            print(f"  {score.abet_outcome.label}: {score.score} ({score.evidence_type})")
        
        print("\n🎯 ABET Outcome Calculations:")
        for outcome in ABETOutcome.objects.all():
            scores = AssessmentLearningOutcome_ABET.objects.filter(abet_outcome=outcome)
            if scores.exists():
                avg_score = sum(s.score for s in scores) / len(scores)
                percentage = (avg_score / 4.0) * 100
                print(f"  {outcome.label}: {len(scores)} scores, avg={avg_score:.2f}, percentage={percentage:.1f}%")
            else:
                print(f"  {outcome.label}: No scores found")
        
        print("\n📚 Course Syllabi Status:")
        updated = CourseSyllabus.objects.filter(is_updated=True).count()
        total = CourseSyllabus.objects.count()
        print(f"  Updated: {updated}/{total} = {(updated/max(total,1)*100):.1f}%")
        
        print("\n👨‍🏫 Faculty Training Status:")
        completed = FacultyTraining.objects.filter(is_completed=True).values('faculty').distinct().count()
        total_faculty = Faculty.objects.count()
        print(f"  Completed: {completed}/{total_faculty} = {(completed/max(total_faculty,1)*100):.1f}%")
