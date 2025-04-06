# views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ABETCriterion, KPI, Assessment, KPIScore
from .serializers import (
    ABETCriterionSerializer, 
    KPISerializer, 
    AssessmentSerializer, 
    KPIScoreSerializer
)

class ABETCriterionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ABETCriterion.objects.all().prefetch_related('kpis')
    serializer_class = ABETCriterionSerializer

class KPIViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = KPI.objects.all()
    serializer_class = KPISerializer
    
    def get_queryset(self):
        queryset = KPI.objects.all()
        criterion_id = self.request.query_params.get('criterion_id', None)
        if criterion_id is not None:
            queryset = queryset.filter(criterion_id=criterion_id)
        return queryset

class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.all().prefetch_related('scores', 'scores__kpi', 'scores__kpi__criterion')
    serializer_class = AssessmentSerializer
    
    @action(detail=True, methods=['post'])
    def submit_score(self, request, pk=None):
        assessment = self.get_object()
        
        serializer = KPIScoreSerializer(data=request.data)
        if serializer.is_valid():
            kpi_id = serializer.validated_data['kpi'].id
            score = serializer.validated_data['score']
            evidence = serializer.validated_data.get('evidence', '')
            
            kpi_score, created = KPIScore.objects.update_or_create(
                assessment=assessment,
                kpi_id=kpi_id,
                defaults={'score': score, 'evidence': evidence}
            )
            
            return Response(KPIScoreSerializer(kpi_score).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def complete_assessment(self, request, pk=None):
        assessment = self.get_object()
        assessment.completed = True
        assessment.save()
        
        return Response({'status': 'assessment marked as completed'})
