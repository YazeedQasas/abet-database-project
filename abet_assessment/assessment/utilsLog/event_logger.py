from assessment.models import Assessment, AssessmentEvent
from assessment.services import AssessmentService

def log_assessment_event(instance, user, event_type):
    """
    Log an assessment event with the average system-wide score at the time.
    :param instance: Assessment model instance
    :param user: User who triggered the event
    :param event_type: One of 'CREATE' or 'UPDATE'
    """
    try:
        # Calculate current average ABET score across all assessments
        average_score = AssessmentService.get_average_score()

        # Calculate individual assessment score
        score_data = AssessmentService.calculate_assessment_score(instance.id)

        # Log the event
        AssessmentEvent.objects.create(
            assessment_id=instance.id,
            assessment_name=instance.name,
            event_type=event_type,
            score=score_data['total_score'],
            average_score_at_time=average_score,
            user=user
        )

    except Exception as e:
        print(f"Error logging assessment event: {e}")

