# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from django.http import FileResponse
import shutil
# import shutil  # duplicate removed
import os
from programs.models import SemesterCourseAssignment, Course, Faculty, Program, Department
from rest_framework import status
class AutoGenerateArchiveView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        academic_year = request.data.get("academic_year")  # e.g. "2025-2026"
        # semesters dictionary: key = semester name, value = list of course dicts for that semester
        semesters = ["First Semester", "Second Semester", "Summer Semester"]
        professors = request.data.get("professors", [])
        if not professors:
            # Fallback to empty or handle as needed
            professors = []
        folder_types = ["Syllabus", "Slides", "Exams", "Assignments"]

        base = settings.ARCHIVE_BASE_PATH
        year_folder = os.path.join(base, academic_year)

        # Remove existing year folder to avoid duplicates from old structure
        if os.path.exists(year_folder):
            shutil.rmtree(year_folder)

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

        # Filter structure based on user permissions
        user = request.user
        if not user.is_staff and not user.is_superuser:
            # Assuming faculty have a related 'faculty_profile'
            try:
                faculty = user.faculty_profile
                faculty_id = str(faculty.id)
                username = user.username
                
                filtered_structure = {}
                
                # Iterate through semesters
                for semester, professors in structure.items():
                    if isinstance(professors, dict):
                        filtered_professors = {}
                        for prof_folder, contents in professors.items():
                            # Check if folder matches faculty ID or Username
                            # Folder format: "Name - ID"
                            parts = prof_folder.split(" - ")
                            folder_id = parts[-1].strip() if len(parts) > 1 else ""
                            
                            print(f"DEBUG: Checking folder '{prof_folder}' -> ID '{folder_id}' against Faculty ID '{faculty_id}' and Username '{username}'")
                            
                            if folder_id == faculty_id or folder_id == username:
                                filtered_professors[prof_folder] = contents
                                print("DEBUG: Match found!")
                        
                        if filtered_professors:
                            filtered_structure[semester] = filtered_professors
                
                structure = filtered_structure
            except Exception as e:
                print(f"DEBUG: Error in filtering: {e}")
                import traceback
                traceback.print_exc()
                # If user is not faculty or other error, return empty or handle appropriately
                # For now, if not faculty profile found, return empty
                structure = {}

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


from cryptography.fernet import Fernet
import io

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
        
        try:
            # Initialize Fernet with the key from settings
            fernet = Fernet(settings.ENCRYPTION_KEY)
            
            # Read original file data
            file_data = file_obj.read()
            
            # Encrypt data
            encrypted_data = fernet.encrypt(file_data)
            
            # Write encrypted data to file
            with open(file_path, "wb+") as dest:
                dest.write(encrypted_data)
                
            return Response({"uploaded": True, "filename": file_obj.name})
        except Exception as e:
            print(f"Encryption Error: {e}")
            return Response({"error": f"Encryption failed: {str(e)}"}, status=500)


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
            try:
                # Initialize Fernet
                fernet = Fernet(settings.ENCRYPTION_KEY)
                
                with open(file_path, "rb") as f:
                    file_data = f.read()
                
                try:
                    # Attempt to decrypt
                    decrypted_data = fernet.decrypt(file_data)
                    print(f"Successfully decrypted file: {filename}, size: {len(decrypted_data)} bytes")
                except Exception as decrypt_err:
                    # If decryption fails, assume it's a legacy (unencrypted) file
                    print(f"Decryption failed (legacy file?): {decrypt_err}")
                    decrypted_data = file_data
                
                # Return decrypted data as HTTP response with proper headers
                from django.http import HttpResponse
                response = HttpResponse(decrypted_data, content_type='application/octet-stream')
                response['Content-Disposition'] = f'attachment; filename="{filename}"'
                response['Content-Length'] = len(decrypted_data)
                response['Access-Control-Expose-Headers'] = 'Content-Disposition'
                return response
                
            except Exception as e:
                print(f"Download Error: {e}")
                import traceback
                traceback.print_exc()
                return Response({"error": f"Download failed: {str(e)}"}, status=500)
                
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

# New API view to fetch professor courses for a given year/semester
class ProfessorCoursesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        year = request.query_params.get("year")
        semester = request.query_params.get("semester")
        department_id = request.query_params.get("department_id")
        if not year or not semester:
            return Response({"error": "Year and semester are required"}, status=400)
        # Fetch assignments for the specified year/semester
        assignments = SemesterCourseAssignment.objects.filter(
            academic_year=year,
            semester=semester
        ).select_related('instructor', 'course')
        if department_id:
            assignments = assignments.filter(instructor__department_id=department_id)
        # Group courses by professor
        prof_courses = {}
        for assign in assignments:
            prof_id = str(assign.instructor.id)
            if prof_id not in prof_courses:
                prof_courses[prof_id] = {"name": assign.instructor.name, "courses": []}
            prof_courses[prof_id]["courses"].append(assign.course.name)
        # Fallback: include courses directly linked to faculty if no semester assignment exists
        faculty_qs = Faculty.objects.filter(department_id=department_id) if department_id else Faculty.objects.all()
        for faculty in faculty_qs:
            fid = str(faculty.id)
            if fid not in prof_courses:
                courses = Course.objects.filter(instructor=faculty)
                if courses.exists():
                    prof_courses[fid] = {"name": faculty.name, "courses": [c.name for c in courses]}
        return Response(prof_courses)

# New API view to create a new course (if needed) and assign it to a professor for a semester
class AssignCourseView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        year = request.data.get("year")
        semester = request.data.get("semester")
        professor_id = request.data.get("professor_id")
        course_name = request.data.get("course_name")
        if not all([year, semester, professor_id, course_name]):
            return Response({"error": "Missing required fields"}, status=400)
        try:
            instructor = Faculty.objects.get(id=professor_id)
        except Faculty.DoesNotExist:
            return Response({"error": "Professor not found"}, status=404)
        # Find existing course or create a new one
        course = Course.objects.filter(name__iexact=course_name).first()
        if not course:
            # Assign to first program in professor's department
            program = Program.objects.filter(department=instructor.department).first()
            if not program:
                program = Program.objects.first()
            if not program:
                return Response({"error": "No program available for new course"}, status=400)
            course = Course.objects.create(
                name=course_name,
                program=program,
                description=f"Auto‑created course: {course_name}",
                credits=3,
                instructor=instructor,
            )
        # Create or get semester assignment
        assignment, created = SemesterCourseAssignment.objects.get_or_create(
            academic_year=year,
            semester=semester,
            course=course,
            instructor=instructor,
            defaults={"program": course.program},
        )
        return Response({
            "status": "assigned",
            "course_id": course.id,
            "created": created,
        })
