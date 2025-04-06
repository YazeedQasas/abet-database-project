from rest_framework import serializers
from .models import ABETCriterion, KPI, Assessment, KPIScore

class KPISerializer(serializers.ModelSerializer):
    class Meta:
        model = KPI
        fields = ['id', 'name', 'description', 'weight']

class ABETCriterionSerializer(serializers.ModelSerializer):
    kpis = KPISerializer(many=True, read_only=True)
    
    class Meta:
        model = ABETCriterion
        fields = ['id', 'name', 'description', 'kpis']

class KPIScoreSerializer(serializers.ModelSerializer):
    kpi_name = serializers.ReadOnlyField(source='kpi.name')
    criterion_name = serializers.ReadOnlyField(source='kpi.criterion.name')
    
    class Meta:
        model = KPIScore
        fields = ['id', 'kpi', 'kpi_name', 'criterion_name', 'score', 'evidence']

class AssessmentSerializer(serializers.ModelSerializer):
    scores = KPIScoreSerializer(many=True, read_only=True)
    overall_score = serializers.SerializerMethodField()
    
    class Meta:
        model = Assessment
        fields = ['id', 'name', 'date_created', 'completed', 'scores', 'overall_score']
    
    def get_overall_score(self, obj):
        return obj.calculate_overall_score()
