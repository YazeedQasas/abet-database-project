# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from django.http import FileResponse
import shutil
import os


class AutoGenerateArchiveView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        academic_year = request.data.get("academic_year")  # e.g. "2025-2026"
        # semesters dictionary: key = semester name, value = list of course dicts for that semester
        semesters = ["First Semester", "Second Semester", "Summer Semester"]
        professors = [
            {
                "name": "Dr. Rushdi Hamamreh", "id": "721021",
                "courses_by_semester": {
                    "First Semester": ["Database Systems", "Computer Networks"],
                    "Second Semester": ["Software Engineering"],
                    "Summer Semester": ["AI"]
                }
            },
            {
                "name": "Dr. Emad Hamadeh", "id": "721022",
                "courses_by_semester": {
                    "First Semester": ["VLSI", "Computer Architecture"],
                    "Second Semester": ["Embedded Systems"],
                    "Summer Semester": [""]
                }
            }
        ]
        folder_types = ["Syllabus", "Slides", "Exams", "Assignments"]

        base = settings.ARCHIVE_BASE_PATH
        year_folder = os.path.join(base, academic_year)

        for semester in semesters:
            semester_folder = os.path.join(year_folder, semester)
            for prof in professors:
                prof_folder = os.path.join(
                    semester_folder, f"{prof['name']} - {prof['id']}")
                # Safely get courses for this semester for this professor:
                courses = prof["courses_by_semester"].get(semester, [])
                for course in courses:
                    course_folder = os.path.join(prof_folder, course)
                    for sub in folder_types:
                        final_path = os.path.join(course_folder, sub)
                        os.makedirs(final_path, exist_ok=True)

        return Response({"status": "ok", "created": year_folder})


class ArchiveStructureView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, year):
        # year expected as "2025-2026"
        base = os.path.join(settings.ARCHIVE_BASE_PATH, year)
        structure = {}

        def dir_tree(root):
            tree = {}
            try:
                entries = os.listdir(root)
            except FileNotFoundError:
                return tree
            for entry in entries:
                path = os.path.join(root, entry)
                if os.path.isdir(path):
                    tree[entry] = dir_tree(path)
            return tree

        structure = dir_tree(base)
        return Response({"year": year, "structure": structure})


class DeleteAcademicYearView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, year):
        year_folder = os.path.join(settings.ARCHIVE_BASE_PATH, year)
        if os.path.exists(year_folder):
            shutil.rmtree(year_folder)
            return Response({"deleted": True, "year": year})
        return Response({"deleted": False, "error": "Not found"}, status=404)


class ListAcademicYearsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        base = settings.ARCHIVE_BASE_PATH
        try:
            years = [d for d in os.listdir(
                base) if os.path.isdir(os.path.join(base, d))]
        except FileNotFoundError:
            years = []
        # Optionally add sorting logic: years.sort(reverse=True)
        return Response({"years": years})


class ListFilesView(APIView):
    permission_classes = [IsAuthenticated]
    # URL: /api/files/?path=<relative_path_from_year>

    def get(self, request):
        year = request.query_params.get("year")
        # E.g., "First Semester/Dr. Placeholder1 - ID1/Syllabus"
        path = request.query_params.get("path", "")
        root = os.path.join(settings.ARCHIVE_BASE_PATH, year, path)
        files = []
        try:
            for entry in os.listdir(root):
                full = os.path.join(root, entry)
                if os.path.isfile(full):
                    files.append(entry)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
        return Response({"files": files})


class FileUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAdminUser]
    # POST /api/upload/?year=2025-2026&path=First Semester/Dr. Placeholder1 - ID1/Syllabus

    def post(self, request):
        year = request.query_params.get("year")
        path = request.query_params.get("path", "")
        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response({"error": "No file provided"}, status=400)
        upload_dir = os.path.join(settings.ARCHIVE_BASE_PATH, year, path)
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file_obj.name)
        with open(file_path, "wb+") as dest:
            for chunk in file_obj.chunks():
                dest.write(chunk)
        return Response({"uploaded": True, "filename": file_obj.name})


class DownloadFileView(APIView):
    permission_classes = [IsAuthenticated]
    # GET /api/download/?year=2025-2026&path=First Semester/Dr. Placeholder1 - ID1/Syllabus&filename=exam1.pdf

    def get(self, request):
        year = request.query_params.get("year")
        path = request.query_params.get("path", "")
        filename = request.query_params.get("filename")
        file_path = os.path.join(
            settings.ARCHIVE_BASE_PATH, year, path, filename)
        if os.path.exists(file_path):
            return FileResponse(open(file_path, "rb"), as_attachment=True, filename=filename)
        return Response({"error": "File not found"}, status=404)


class DeleteFileView(APIView):
    permission_classes = [IsAdminUser]
    # DELETE /api/delete-file/?year=2025-2026&path=First Semester/Dr. Placeholder1 - ID1/Syllabus&filename=exam1.pdf

    def delete(self, request):
        year = request.query_params.get("year")
        path = request.query_params.get("path", "")
        filename = request.query_params.get("filename")
        file_path = os.path.join(
            settings.ARCHIVE_BASE_PATH, year, path, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            return Response({"deleted": True})
        return Response({"error": "File not found"}, status=404)
