# core/views.py
from rest_framework import viewsets
from .models import  InstitutionalSupport, ProgramCriteria, Meeting, Document, MastersLevelRequirement
from .serializers import InstitutionalSupportSerializer, ProgramCriteriaSerializer, MeetingSerializer, DocumentSerializer, MastersLevelRequirementSerializer


class InstitutionalSupportViewSet(viewsets.ModelViewSet):
    queryset = InstitutionalSupport.objects.all()
    serializer_class = InstitutionalSupportSerializer

class ProgramCriteriaViewSet(viewsets.ModelViewSet):
    queryset = ProgramCriteria.objects.all()
    serializer_class = ProgramCriteriaSerializer

class MeetingViewSet(viewsets.ModelViewSet):
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

class MastersLevelRequirementViewSet(viewsets.ModelViewSet):
    queryset = MastersLevelRequirement.objects.all()
    serializer_class = MastersLevelRequirementSerializer
