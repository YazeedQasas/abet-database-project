# core/views.py
from rest_framework import viewsets
from .models import Facility, InstitutionalSupport, ProgramCriteria, Meeting, Document, MastersLevelRequirement
from .serializers import FacilitySerializer, InstitutionalSupportSerializer, ProgramCriteriaSerializer, MeetingSerializer, DocumentSerializer, MastersLevelRequirementSerializer

class FacilityViewSet(viewsets.ModelViewSet):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer

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
