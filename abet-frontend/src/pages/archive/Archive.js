import React, { useState, useContext } from "react";
import "./Archive.css";
import { AuthContext } from "../../context/AuthContext";

const SEMESTERS = [
  { key: "first", label: "First Semester" },
  { key: "second", label: "Second Semester" },
  { key: "summer", label: "Summer Semester" },
];

// Define your per-term data:
const initialSemesterData = {
  first: [
    {
      professorId: "771120",
      name: "Dr. Rushdi Hamamreh",
      courses: [
        { courseId: "89082", name: "Computer Networks" },
        { courseId: "98201", name: "Database Systems" },
      ],
    },
    {
      professorId: "123067",
      name: "Dr. Emad Hamadeh",
      courses: [
        { courseId: "47098", name: "Computer Architecture & Organization" },
      ],
    },
  ],
  second: [
    {
      professorId: "771120",
      name: "Dr. Rushdi Hamamreh",
      courses: [{ courseId: "11132", name: "Network Security" }],
    },
    {
      professorId: "123067",
      name: "Dr. Emad Hamadeh",
      courses: [{ courseId: "94821", name: "VLSI" }],
    },
  ],
  summer: [],
};

const folders = ["Syllabus", "Slides", "Exams", "Assignments"];
const orangeGradients = [
  "linear-gradient(90deg, #ff6f2d 60%, #ffb069 100%)",
  "linear-gradient(90deg, #fd964b 60%, #fff0da 100%)",
  "linear-gradient(90deg, #ff8c42 67%, #ffc093 100%)",
  "linear-gradient(90deg, #ff944d 69%, #ffddb4 100%)",
  "linear-gradient(90deg, #ff702d 70%, #ffe6cb 100%)",
  "linear-gradient(90deg, #ffad6b 70%, #ffdeb3 100%)",
];

// Generate academic year string dynamically
const getAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // Jan=0, Dec=11
  // Most academic years start in September (month 8)
  if (month < 8) {
    // Before September, still part of the previous academic year
    return `${year - 1}-${year}`;
  } else {
    return `${year}-${year + 1}`;
  }
};

const academicYear = getAcademicYear();

const Archive = () => {
  const { currentUser } = useContext(AuthContext);

  // State for academic term
  const [semesterData, setSemesterData] = useState(initialSemesterData);
  const [selectedTerm, setSelectedTerm] = useState("first");

  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [searchProf, setSearchProf] = useState("");

  // Permissions
  const isDean = currentUser?.userType === "dean";
  const isHoD = currentUser?.userType === "HoD";
  const isProfessor = currentUser?.userType === "professor";
  const isAdmin = currentUser?.userType === "admin";

  const getAcademicYears = (yearsBack = 5) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    let thisAcademicStart = month < 8 ? year - 1 : year;
    return Array.from({ length: yearsBack + 1 }, (_, i) => {
      const start = thisAcademicStart - i;
      return `${start}-${start + 1}`;
    });
  };

  const academicYears = getAcademicYears(2);

  const getNextAcademicYear = (yearStr) => {
    const [start, end] = yearStr.split("-").map(Number);
    return `${start + 1}-${end + 1}`;
  };
  const getTermLabel = (key) =>
    SEMESTERS.find((t) => t.key === key)?.label || key;

  const [selectedAcademicYear, setSelectedAcademicYear] =
    useState(academicYear);

  // Professors for the current term
  let profList = semesterData[selectedTerm] || [];
  if (isProfessor) {
    profList = profList.filter((prof) => prof.professorId === currentUser.id);
  }
  const filteredProfessors = profList.filter(
    (prof) =>
      prof.name.toLowerCase().includes(searchProf.toLowerCase()) ||
      prof.professorId.toLowerCase().includes(searchProf.toLowerCase())
  );

  // Handler to auto-generate folders for all semesters (HoD/Dean only)
  const handleAutoGenerate = () => {
    const generated = {};
    SEMESTERS.forEach((term) => {
      generated[term.key] = (semesterData[term.key] || []).map((prof) => ({
        ...prof,
        courses: prof.courses.map((course) => ({
          ...course,
          // Just stubs/subfolders, files empty
        })),
      }));
    });
    setSemesterData(generated);
    alert(
      "Semester folder structures have been reset/generated (UI only for now)."
    );
    // Backend API call goes here in the future!
  };

  const handleDeleteCurrentAcademicYear = () => {
    if (
      window.confirm(
        `Are you sure you want to delete all archive data for the academic year ${selectedAcademicYear}? This cannot be undone.`
      )
    ) {
      // Remove all semester data for that year (frontend mock)
      // This assumes your data per year actually comes from backend (or is keyed by year)
      setSemesterData({
        first: [],
        second: [],
        summer: [],
      });
      setSelectedProfessor(null);
      setSelectedCourse(null);
      alert(
        `All archive data for academic year ${selectedAcademicYear} has been deleted (UI only, for now).`
      );
      // TODO: Connect to backend deletion logic!
    }
  };

  // --- UI ---

  // Term button row
  const renderTermSelector = () => (
    <div className="term-selection-bar">
      {SEMESTERS.map((term, idx) => (
        <button
          key={term.key}
          className={`term-btn${selectedTerm === term.key ? " active" : ""}`}
          onClick={() => {
            setSelectedTerm(term.key);
            setSelectedProfessor(null);
            setSelectedCourse(null);
          }}
          style={{
            background: orangeGradients[idx % orangeGradients.length],
            fontSize: "1.16rem",
            boxShadow:
              selectedTerm === term.key
                ? "0 6px 20px 0 #ff6f2d44, 0 0 0 4px #fff2e0"
                : "0 2px 9px 0 #ff6f2d1a",
            color: selectedTerm === term.key ? "#fffff" : "#fffff",
            transform: selectedTerm === term.key ? "scale(1.09)" : "none",
            zIndex: selectedTerm === term.key ? 2 : 1,
          }}
        >
          {term.label}
          {selectedTerm === term.key && <span className="selected-dot"></span>}
        </button>
      ))}
    </div>
  );

  // ---- Professors ----
  if (!selectedProfessor) {
    return (
      <div className="abet-archive">
        <div className="archive-header">
          <div className="archive-header-content simple-header-flex">
            <div
              style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}
            >
              <h1 className="archive-title">Archive</h1>
              <div className="academic-year-bar">
                <label className="academic-label" htmlFor="academic-year">
                  Academic Year:
                </label>
                <select
                  id="academic-year"
                  className="academic-year-dropdown"
                  value={selectedAcademicYear}
                  onChange={(e) => setSelectedAcademicYear(e.target.value)}
                >
                  {academicYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {(isDean || isHoD || isAdmin) && (
              <div className="button-toolbar">
                <button className="main-btn" onClick={handleAutoGenerate}>
                  Auto-Generate Terms
                </button>
                <span className="info-chip">
                  Next academic year:{" "}
                  <b>{getNextAcademicYear(selectedAcademicYear)}</b>
                </span>
                <button
                  className="danger-btn"
                  onClick={handleDeleteCurrentAcademicYear}
                >
                  Delete Academic Year
                </button>
              </div>
            )}
          </div>
        </div>

        {renderTermSelector()}
        <div className="archive-search-container">
          <input
            className="search-bar"
            type="text"
            placeholder="Search professor..."
            value={searchProf}
            onChange={(e) => setSearchProf(e.target.value)}
          />
        </div>

        <div className="archive-main professor-grid">
          {filteredProfessors.map((prof, index) => (
            <div
              key={prof.professorId}
              className="professor-block card-hover"
              onClick={() => setSelectedProfessor(prof)}
            >
              <div
                className="card-header"
                style={{
                  background: orangeGradients[index % orangeGradients.length],
                }}
              />
              <div className="card-content-row">
                <span className="card-title">{prof.name}</span>
                <span className="card-id">{prof.professorId}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---- Courses ----
  if (!selectedCourse) {
    return (
      <div className="abet-archive">
        <div className="archive-header">
          <div className="archive-header-content">
            <h1>{selectedProfessor.name}'s Courses</h1>
            <button
              className="action-btn"
              onClick={() => setSelectedProfessor(null)}
            >
              Back
            </button>
          </div>
        </div>
        {renderTermSelector()}
        <div className="archive-main course-grid">
          {selectedProfessor.courses.map((course, idx) => (
            <div
              key={course.courseId}
              className="card-hover course-block"
              onClick={() => setSelectedCourse(course)}
              style={{ cursor: "pointer" }}
            >
              <div
                className="card-header"
                style={{
                  background: orangeGradients[idx % orangeGradients.length],
                }}
              />
              <div className="card-content-row">
                <span className="card-title">{course.name}</span>
                <span className="card-id">{course.courseId}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---- Folders ----
  return (
    <div className="abet-archive">
      <div className="archive-header">
        <div className="archive-header-content">
          <h1>
            {selectedProfessor.name} – {selectedCourse.name}
          </h1>
          <button
            className="action-btn"
            onClick={() => setSelectedCourse(null)}
          >
            Back
          </button>
        </div>
      </div>
      {renderTermSelector()}
      <div className="archive-main folder-grid">
        {folders.map((folder, idx) => (
          <div
            key={folder}
            className="card-hover folder-block"
            style={{ cursor: "pointer" }}
          >
            <div
              className="card-header"
              style={{
                background: orangeGradients[idx % orangeGradients.length],
              }}
            />
            <div className="card-content-row">
              <span className="card-title">{folder}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Archive;
