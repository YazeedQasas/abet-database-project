from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import AssessmentEvent, ContinuousImprovement, AcademicPerformance, AssessmentLearningOutcome, Assessment
from .services import AssessmentService

def calculate_overall_abet_score():
    assessment_ids = Assessment.objects.values_list('id', flat=True)
    all_scores = []
    for assessment_id in assessment_ids:
        try:
            assessment_result = AssessmentService.calculate_assessment_score(assessment_id)
            all_scores.append(assessment_result.get('total_score', 0))
        except Exception:
            pass
    return round(sum(all_scores) / len(all_scores), 2) if all_scores else 0.0

@receiver(post_save, sender=ContinuousImprovement)
def ci_event(sender, instance, created, **kwargs):
    user = getattr(instance, '_current_user', None)
    if user and user.is_authenticated:
        overall_score = AssessmentService.get_average_score()
        AssessmentEvent.objects.create(
            assessment_id=instance.assessment_id.id,
            assessment_name=f"{instance.assessment_id.name} - Continuous Improvement",
            event_type='UPDATE',
            score=overall_score,
            average_score_at_time=overall_score,
            user=user
        )



#         )
