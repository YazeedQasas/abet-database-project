from django.contrib import admin
from .models import *

admin.site.register(Department)
admin.site.register(Program)
admin.site.register(Course)
admin.site.register(Student)
admin.site.register(CourseStudent)
admin.site.register(LearningOutcomes)
admin.site.register(Assessment)
admin.site.register(Assessment_LearningOutcomes)
admin.site.register(Assessment_Result)
admin.site.register(Documents)
admin.site.register(Users)
admin.site.register(Meetings)
admin.site.register(Department_Course)
admin.site.register(Faculty)