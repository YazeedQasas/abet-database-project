# In your app's filters.py (or views.py)

from django_filters import rest_framework as filters
from .models import AcademicPerformance

class AcademicPerformanceFilter(filters.FilterSet):
    """
    Custom filter for the AcademicPerformance model.
    """
    course = filters.NumberFilter(field_name='assessment_id__course_id')

    class Meta:
        model = AcademicPerformance
        # 3. List the filters that this FilterSet will expose.
        fields = ['course','assessment_id']
