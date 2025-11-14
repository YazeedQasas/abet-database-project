from django.urls import path
from .views import AutoGenerateArchiveView, ArchiveStructureView, DeleteAcademicYearView, ListAcademicYearsView, ListFilesView, FileUploadView, DownloadFileView, DeleteFileView

urlpatterns = [
    path("archive/auto-generate/", AutoGenerateArchiveView.as_view()),
    path("structure/<str:year>/", ArchiveStructureView.as_view()),
    path("structure/<str:year>/delete/", DeleteAcademicYearView.as_view()),
    path("years/", ListAcademicYearsView.as_view()),
    path("files/", ListFilesView.as_view()),
    path("upload/", FileUploadView.as_view()),
    path("download/", DownloadFileView.as_view()),
    path("delete-file/", DeleteFileView.as_view()),
]