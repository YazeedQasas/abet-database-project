import React, { useState, useContext, useEffect } from "react";
import "./Archive.css";
import { AuthContext } from "../../context/AuthContext";
import {
  fetchAcademicYears,
  fetchArchiveStructure,
  fetchFiles,
  uploadFile,
  deleteFile,
} from "../../services/archive";
import { saveAs } from "file-saver";
import api from "../../services/api";

const orangeGradients = [
  "linear-gradient(90deg, #ff6f2d 60%, #ffb069 100%)",
  "linear-gradient(90deg, #fd964b 60%, #fff0da 100%)",
  "linear-gradient(90deg, #ff8c42 67%, #ffc093 100%)",
  "linear-gradient(90deg, #ff944d 69%, #ffddb4 100%)",
  "linear-gradient(90deg, #ff702d 70%, #ffe6cb 100%)",
  "linear-gradient(90deg, #ffad6b 70%, #ffdeb3 100%)",
];

const Archive = () => {
  const { currentUser } = useContext(AuthContext);
  const [years, setYears] = useState([]);
  const [structure, setStructure] = useState({}); // default to an object, not null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // <--- new
  const [files, setFiles] = useState([]);
  const [selectedFolderType, setSelectedFolderType] = useState(null);

  // Navigation state
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [searchProf, setSearchProf] = useState("");

  // Permissions
  const isDean = currentUser?.userType === "dean";
  const isHoD = currentUser?.userType === "HoD";
  const isProfessor = currentUser?.userType === "professor";
  const isAdmin = currentUser?.userType === "admin";

  useEffect(() => {
    const loadFiles = async () => {
      if (
        selectedAcademicYear &&
        selectedTerm &&
        selectedProfessor &&
        selectedCourse &&
        selectedFolderType
      ) {
        const path = [
          selectedTerm,
          selectedProfessor,
          selectedCourse,
          selectedFolderType,
        ].join("/");
        try {
          const f = await fetchFiles(selectedAcademicYear, path);
          setFiles(f);
        } catch (e) {
          setFiles([]);
        }
      }
    };
    loadFiles();
  }, [
    selectedAcademicYear,
    selectedTerm,
    selectedProfessor,
    selectedCourse,
    selectedFolderType,
  ]);

  useEffect(() => {
    loadYears();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear) {
      handleYearChange(selectedAcademicYear);
    }
  }, [selectedAcademicYear]);

  const loadYears = async () => {
    setLoading(true);
    setError("");
    try {
      const y = await fetchAcademicYears();
      setYears(y);
    } catch (e) {
      setError("Error loading years: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to filter archive structure based on user permissions
  const filterArchiveByUser = (structure, userType, userId, userName) => {
    // Admin, HoD, and Dean can see everything
    if (['admin', 'HoD', 'dean'].includes(userType)) {
      return structure;
    }

    // Professors can only see their own folders
    if (userType === 'professor') {
      const filteredStructure = {};

      // Normalize function to compare names
      const normalize = (str) => str.toLowerCase().replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/, "").trim();
      const normalizedUserName = normalize(userName || "");

      Object.keys(structure).forEach(semesterFolder => {
        const professors = structure[semesterFolder];
        if (!professors || typeof professors !== 'object') return;

        const filteredProfessors = {};

        Object.keys(professors).forEach(profFolderName => {
          // Check if this folder belongs to the current user
          const parts = profFolderName.split(" - ");
          const profId = parts.length > 1 ? parts[1].trim() : null;
          const profName = parts[0].trim();
          const normalizedProfName = normalize(profName);

          // Match by ID or name
          if ((profId && profId === userId.toString()) ||
            (normalizedProfName === normalizedUserName)) {
            filteredProfessors[profFolderName] = professors[profFolderName];
          }
        });

        if (Object.keys(filteredProfessors).length > 0) {
          filteredStructure[semesterFolder] = filteredProfessors;
        }
      });

      return filteredStructure;
    }

    // For other user types, return empty structure
    return {};
  };

  const handleYearChange = async (year) => {
    setLoading(true);
    setError("");
    try {
      const s = await fetchArchiveStructure(year);
      console.log("structure api raw response:", s);

      // Filter structure based on user permissions
      const filteredStructure = filterArchiveByUser(
        s,
        currentUser?.userType || currentUser?.user_type,
        currentUser?.user_id || currentUser?.id,
        `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim()
      );

      setStructure(filteredStructure);
      setSelectedTerm("");
      setSelectedProfessor(null);
      setSelectedCourse(null);
    } catch (e) {
      // Add this log
      console.error("Year structure fetch failed for", year, ":", e);
      setError("Could not load structure for year: " + year + " (" + e + ")");
      setStructure({});
    } finally {
      setLoading(false);
    }
  };

  const handleBackToYears = () => {
    setSelectedAcademicYear("");
    setStructure({});
    setSelectedTerm("");
    setSelectedProfessor(null);
    setSelectedCourse(null);
    setError("");
  };



  const handleDownload = async (file) => {
    const path = [
      selectedTerm,
      selectedProfessor,
      selectedCourse,
      selectedFolderType,
    ].join("/");
    try {
      const response = await api.get(
        `/download/?year=${selectedAcademicYear}&path=${encodeURIComponent(
          path
        )}&filename=${encodeURIComponent(file)}`,
        {
          responseType: "blob", // crucial for binary files
        }
      );
      saveAs(response.data, file); // triggers save/open dialog
    } catch (err) {
      alert("Download failed: " + (err.response?.data?.error || err.message));
    }
  };





  // ---- UI RENDER ----

  if (loading) {
    return (
      <div className="abet-archive">
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="abet-archive">
        <div className="error-message">{error}</div>
        <button onClick={handleBackToYears}>Back</button>
      </div>
    );
  }

  // 1. Year grid (top-level view, no year selected)
  if (!selectedAcademicYear) {
    return (
      <div className="abet-archive">
        <div className="archive-header">
          <div className="archive-header-content simple-header-flex">
            <h1 className="archive-title">Archive</h1>

          </div>
        </div>

        <div className="archive-main year-grid">
          {years.length === 0 && <div>No academic years available.</div>}
          {years.map((year, idx) => (
            <div
              key={year}
              className="card-hover year-block"
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedAcademicYear(year)}
            >
              <div
                className="card-header"
                style={{
                  background: orangeGradients[idx % orangeGradients.length],
                  height: 60,
                }}
              />
              <div className="card-content-row">
                <span className="card-title">{year}</span>
              </div>
              <div className="card-actions">

              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const termKeys = structure ? Object.keys(structure) : [];
  const professorFolderNames =
    selectedTerm && structure && structure[selectedTerm]
      ? Object.keys(structure[selectedTerm])
      : [];

  if (selectedProfessor && selectedCourse && selectedFolderType) {
    const path = [
      selectedTerm,
      selectedProfessor,
      selectedCourse,
      selectedFolderType,
    ].join("/");

    return (
      <div className="abet-archive">
        <div className="archive-header">
          <div className="archive-header-content">
            <h1>
              {selectedProfessor} – {selectedCourse} – {selectedFolderType}
            </h1>
            <button
              className="action-btn"
              onClick={() => setSelectedFolderType(null)}
            >
              {"<"} {selectedCourse}
            </button>
          </div>
        </div>
        <div className="file-section">
          <h3>Files in this folder:</h3>
          <div className="file-list">
            {files.length > 0 ? (
              files.map((file) => (
                <div
                  key={file}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  <span style={{ flex: 1, color: "#3a4291", fontWeight: 500 }}>
                    {file}
                  </span>
                  <button
                    className="download-btn"
                    onClick={() => handleDownload(file)}
                  >
                    Download
                  </button>
                  <button
                    className="delete-btn"
                    onClick={async () => {
                      if (
                        window.confirm(
                          `Delete "${file}"? This cannot be undone.`
                        )
                      ) {
                        await deleteFile(selectedAcademicYear, path, file);
                        const f = await fetchFiles(selectedAcademicYear, path);
                        setFiles(f);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <span style={{ color: "#ccc" }}>No files yet</span>
            )}
          </div>

          <form
            className="upload-form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!e.target.fileInput.files.length) return;
              const file = e.target.fileInput.files[0];
              await uploadFile(selectedAcademicYear, path, file);
              const f = await fetchFiles(selectedAcademicYear, path);
              setFiles(f);
              e.target.reset();
            }}
          >
            <input type="file" name="fileInput" />
            <button type="submit">Upload</button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Term selector (semester view)
  if (!selectedTerm) {
    return (
      <div className="abet-archive">
        <div className="archive-header">
          <div className="archive-header-content simple-header-flex">
            <h1 className="archive-title">{selectedAcademicYear} Archive</h1>
            <button
              className="action-btn"
              onClick={handleBackToYears}
              style={{ marginLeft: "1.5rem" }}
            >
              {"<"} All Years
            </button>
          </div>
        </div>
        <div
          className="archive-main term-selection-bar"
          style={{ marginTop: "2rem" }}
        >
          {termKeys.length === 0 && <div>No terms for this year.</div>}
          {termKeys.map((term, idx) => (
            <button
              key={term}
              className={`term-btn${selectedTerm === term ? " active" : ""}`}
              onClick={() => setSelectedTerm(term)}
              style={{
                background: orangeGradients[idx % orangeGradients.length],
              }}
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 3. Professor selection (inside term)
  if (!selectedProfessor) {
    return (
      <div className="abet-archive">
        <div className="archive-header">
          <div className="archive-header-content simple-header-flex">
            <h1 className="archive-title">
              {selectedTerm} – {selectedAcademicYear}
            </h1>
            <button className="action-btn" onClick={() => setSelectedTerm("")}>
              {"<"} Terms
            </button>
          </div>
        </div>
        <div className="archive-main professor-grid">
          {professorFolderNames.length === 0 && <div>No professors found.</div>}
          {professorFolderNames.map((profName, idx) => {
            let [name, id] = profName.split(" - ");
            return (
              <div
                key={profName}
                className="professor-block card-hover"
                onClick={() => setSelectedProfessor(profName)}
              >
                <div
                  className="card-header"
                  style={{
                    background: orangeGradients[idx % orangeGradients.length],
                  }}
                />
                <div className="card-content-row">
                  <span className="card-title">{name || profName}</span>
                  <span className="card-id">{id || ""}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 4. Folder selection (inside professor)
  if (!selectedCourse) {
    const folderKeys =
      selectedTerm &&
        selectedProfessor &&
        structure &&
        structure[selectedTerm] &&
        structure[selectedTerm][selectedProfessor]
        ? Object.keys(structure[selectedTerm][selectedProfessor])
        : [];
    return (
      <div className="abet-archive">
        <div className="archive-header">
          <div className="archive-header-content">
            <h1>
              {selectedProfessor} – {selectedTerm}
            </h1>
            <button
              className="action-btn"
              onClick={() => setSelectedProfessor(null)}
            >
              {"<"} Professors
            </button>
          </div>
        </div>
        <div className="archive-main course-grid">
          {folderKeys.length === 0 && <div>No folders in this folder.</div>}
          {folderKeys.map((folder, idx) => (
            <div
              key={folder}
              className="card-hover course-block"
              onClick={() => setSelectedCourse(folder)}
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
  }

  // 5. Leaf folder view
  if (selectedProfessor && selectedCourse && !selectedFolderType) {
    const leafItems =
      selectedTerm &&
        selectedProfessor &&
        selectedCourse &&
        structure &&
        structure[selectedTerm] &&
        structure[selectedTerm][selectedProfessor] &&
        structure[selectedTerm][selectedProfessor][selectedCourse]
        ? Object.keys(
          structure[selectedTerm][selectedProfessor][selectedCourse]
        )
        : [];
    return (
      <div className="abet-archive">
        <div className="archive-header">
          <div className="archive-header-content">
            <h1>
              {selectedProfessor} – {selectedCourse}
            </h1>
            <button
              className="action-btn"
              onClick={() => setSelectedCourse(null)}
            >
              {"<"} Folders
            </button>
          </div>
        </div>
        <div className="archive-main folder-grid">
          {leafItems.length > 0 ? (
            leafItems.map((item, idx) => (
              <div
                key={item}
                className="card-hover folder-block"
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedFolderType(item)}
              >
                <div
                  className="card-header"
                  style={{
                    background: orangeGradients[idx % orangeGradients.length],
                  }}
                />
                <div className="card-content-row">
                  <span className="card-title">{item}</span>
                </div>
              </div>
            ))
          ) : (
            <span>This folder is empty.</span>
          )}
        </div>
      </div>
    );
  }
};

export default Archive;
