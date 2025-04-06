# core/serializers.py
from rest_framework import serializers
from .models import InstitutionalSupport, ProgramCriteria, Meeting, Document, MastersLevelRequirement


class InstitutionalSupportSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitutionalSupport
        fields = '__all__'

class ProgramCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramCriteria
        fields = '__all__'

class MeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = '__all__'

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'

class MastersLevelRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = MastersLevelRequirement
        fields = '__all__'
