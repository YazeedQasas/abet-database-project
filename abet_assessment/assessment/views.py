from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import (
    Assessment, ContinuousImprovement, AcademicPerformance, 
    AssessmentLearningOutcome, AssessmentLearningOutcome_ABET
)
from .serializers import (
    AssessmentSerializer, ContinuousImprovementSerializer, AcademicPerformanceSerializer,
    AssessmentLearningOutcomeSerializer, AssessmentLearningOutcomeABETSerializer
)

class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer
    
    @action(detail=True, methods=['get'])
    def calculate_total_score(self, request, pk=None):
        assessment = self.get_object()
        
        # Get related components
        continuous_improvements = ContinuousImprovement.objects.filter(assessment_id=assessment.Assessment_id)
        academic_performances = AcademicPerformance.objects.filter(assessment_id=assessment.Assessment_id)
        learning_outcomes = AssessmentLearningOutcome.objects.filter(assessment_id=assessment.Assessment_id)
        
        # Calculate weighted scores
        ci_score = 0
        ci_weight_sum = 0
        for ci in continuous_improvements:
            ci_score += ci.score * ci.weight
            ci_weight_sum += ci.weight
        
        ap_score = 0
        ap_weight_sum = 0
        for ap in academic_performances:
            ap_score += ap.grade * ap.weight
            ap_weight_sum += ap.weight
        
        lo_score = 0
        lo_weight_sum = 0
        for lo in learning_outcomes:
            abet_outcomes = AssessmentLearningOutcome_ABET.objects.filter(
                AssessmentLearningoutcome_id=lo.AssesssmentLearningOutcome_id
            )
            for abet in abet_outcomes:
                lo_score += abet.score * abet.weight
                lo_weight_sum += abet.weight
        
        # Normalize weights if needed
        total_weight = ci_weight_sum + ap_weight_sum + lo_weight_sum
        
        if total_weight > 0:
            ci_normalized = ci_score / ci_weight_sum if ci_weight_sum > 0 else 0
            ap_normalized = ap_score / ap_weight_sum if ap_weight_sum > 0 else 0
            lo_normalized = lo_score / lo_weight_sum if lo_weight_sum > 0 else 0
            
            # Calculate final score (assuming equal importance for each category)
            final_score = (ci_normalized + ap_normalized + lo_normalized) / 3
            
            # Determine ABET accreditation
            is_abet_accredited = final_score >= 90
            
            # Determine accreditation level
            if final_score >= 90:
                accreditation_level = "Excellent"
            elif final_score >= 80:
                accreditation_level = "Good"
            elif final_score >= 70:
                accreditation_level = "Satisfactory"
            else:
                accreditation_level = "Needs Improvement"
                
            return Response({
                'assessment_id': assessment.Assessment_id,
                'assessment_name': assessment.name,
                'continuous_improvement_score': ci_normalized,
                'academic_performance_score': ap_normalized,
                'learning_outcome_score': lo_normalized,
                'final_score': final_score,
                'is_abet_accredited': is_abet_accredited,
                'accreditation_level': accreditation_level
            })
        else:
            return Response({
                'error': 'No assessment components found with weights'
            }, status=status.HTTP_404_NOT_FOUND)

class ContinuousImprovementViewSet(viewsets.ModelViewSet):
    queryset = ContinuousImprovement.objects.all()
    serializer_class = ContinuousImprovementSerializer

class AcademicPerformanceViewSet(viewsets.ModelViewSet):
    queryset = AcademicPerformance.objects.all()
    serializer_class = AcademicPerformanceSerializer

class AssessmentLearningOutcomeViewSet(viewsets.ModelViewSet):
    queryset = AssessmentLearningOutcome.objects.all()
    serializer_class = AssessmentLearningOutcomeSerializer

class AssessmentLearningOutcomeABETViewSet(viewsets.ModelViewSet):
    queryset = AssessmentLearningOutcome_ABET.objects.all()
    serializer_class = AssessmentLearningOutcomeABETSerializer
