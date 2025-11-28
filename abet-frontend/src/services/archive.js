import api from "./api";

// GET list of academic years (folders)
export const fetchAcademicYears = async () => {
  const res = await api.get("/years/");
  return res.data.years;
};

// GET folder/file structure for a given academic year
export const fetchArchiveStructure = async (year) => {
  const res = await api.get(`/structure/${encodeURIComponent(year)}/`);
  return res.data.structure;
};

// POST auto-generate folder structure for a year
export const autoGenerateArchive = async (year) => {
  const res = await api.post("/archive/auto-generate/", {
    academic_year: year,
  });
  return res.data;
};

// DELETE an academic year/folder tree
export const deleteAcademicYear = async (year) => {
  const res = await api.delete(
    `/structure/${encodeURIComponent(year)}/delete/`
  );
  return res.data;
};

export const fetchFiles = async (year, path) => {
  const res = await api.get("/files/", {
    params: { year: year, path: path },
  });
  return res.data.files;
};

export const uploadFile = async (year, path, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post(
    `/upload/?year=${encodeURIComponent(year)}&path=${encodeURIComponent(
      path
    )}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};

export const deleteFile = async (year, path, filename) => {
  const res = await api.delete(
    `/delete-file/?year=${encodeURIComponent(year)}&path=${encodeURIComponent(
      path
    )}&filename=${encodeURIComponent(filename)}`
  );
  return res.data;
};
// GET professor courses for a given year/semester (optional department filter)
export const fetchProfessorCourses = async (year, semester, departmentId = null) => {
  const params = { year, semester };
  if (departmentId) params.department_id = departmentId;
  const res = await api.get('/professor-courses/', { params });
  return res.data; // expects object mapping professorId -> { name, courses }
};

// POST assign a new course to a professor for a specific year/semester
export const assignCourse = async (year, semester, professorId, courseName) => {
  const res = await api.post('/assign-course/', {
    year,
    semester,
    professor_id: professorId,
    course_name: courseName,
  });
  return res.data;
};
