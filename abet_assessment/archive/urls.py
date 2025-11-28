from django.urls import path
from .views import AutoGenerateArchiveView, ArchiveStructureView, DeleteAcademicYearView, ListAcademicYearsView, ListFilesView, FileUploadView, DownloadFileView, DeleteFileView, ProfessorCoursesView, AssignCourseView

urlpatterns = [
    path("archive/auto-generate/", AutoGenerateArchiveView.as_view()),
    path("structure/<str:year>/", ArchiveStructureView.as_view()),
    path("structure/<str:year>/delete/", DeleteAcademicYearView.as_view()),
    path("years/", ListAcademicYearsView.as_view()),
    path("files/", ListFilesView.as_view()),
    path("upload/", FileUploadView.as_view()),
    path("download/", DownloadFileView.as_view()),
    path("professor-courses/", ProfessorCoursesView.as_view()),
    path("assign-course/", AssignCourseView.as_view()),
]