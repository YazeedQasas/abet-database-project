import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { fetchAcademicYears, fetchArchiveStructure, fetchFiles, autoGenerateArchive, deleteAcademicYear, fetchProfessorCourses, assignCourse } from "../../services/archive";
import api from "../../services/api";
import { saveAs } from "file-saver";
import { FaFolder, FaFile, FaDownload, FaTrash, FaMagic, FaChevronDown, FaChevronUp, FaPlus, FaTimes } from "react-icons/fa";
import "./ArchiveAdmin.css";

const ArchiveAdmin = () => {
    const { currentUser } = useContext(AuthContext);

    // State for dropdowns
    const [years, setYears] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [courses, setCourses] = useState([]);

    // Selected values
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedProgram, setSelectedProgram] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");

    // Data & UI state
    const [archiveStructure, setArchiveStructure] = useState({});
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [configExpanded, setConfigExpanded] = useState(false);

    // Semester planning configuration state
    const [selectedConfigYear, setSelectedConfigYear] = useState("");
    const [activeSemesterTab, setActiveSemesterTab] = useState("First");
    const [selectedProfessors, setSelectedProfessors] = useState({
        "First": [],
        "Second": [],
        "Summer": []
    });
    const [selectedConfigDept, setSelectedConfigDept] = useState("");
    const [configDoctors, setConfigDoctors] = useState([]);

    // Course assignment state
    const [availableCourses, setAvailableCourses] = useState([]);

    // { "First": { profId: { name: "...", courses: [] } }, "Second": ... }
    const [professorCourses, setProfessorCourses] = useState({
        "First": {},
        "Second": {},
        "Summer": {}
    });
    const [profDropdowns, setProfDropdowns] = useState({});
    const [customCourseInputs, setCustomCourseInputs] = useState({});
    const [showCustomInput, setShowCustomInput] = useState({});

    // Helper to find professor key strictly
    const findProfessorKey = (professors, doctorObj) => {
        if (!professors || !doctorObj) return null;

        const normalize = (str) => str.toLowerCase().replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/, "").trim();

        const doctorName = doctorObj.name;
        const normDoctorName = normalize(doctorName);
        const doctorId = doctorObj.id ? doctorObj.id.toString() : "";

        return Object.keys(professors).find(p => {
            const parts = p.split(" - ");
            const pNameRaw = parts[0];
            const pId = parts.length > 1 ? parts[1].trim() : "";
            const normPName = normalize(pNameRaw);

            // 1. Try Exact ID Match (most reliable)
            if (doctorId && pId === doctorId) return true;

            // 2. Try Normalized Exact Name Match
            if (normPName === normDoctorName) return true;

            // 3. Try Partial Match
            if (normPName.includes(normDoctorName) || normDoctorName.includes(normPName)) {
                return true;
            }

            return false;
        });
    };

    const loadYears = async () => {
        try {
            const yearsData = await fetchAcademicYears();
            setYears(yearsData);
            // If selected year is not in new list, select first
            if (yearsData.length > 0 && !yearsData.includes(selectedYear)) {
                const sortedYears = [...yearsData].sort((a, b) => b.localeCompare(a));
                setSelectedYear(sortedYears[0]);
            }
        } catch (e) {
            console.error("Failed to load years", e);
        }
    };

    // Initial Load: Years and Departments
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [yearsData, deptsData] = await Promise.all([
                    fetchAcademicYears(),
                    api.get("/departments/")
                ]);

                setYears(yearsData);
                setDepartments(deptsData.data);

                // Default to latest year if available
                if (yearsData.length > 0) {
                    // Sort years descending to get latest
                    const sortedYears = [...yearsData].sort((a, b) => b.localeCompare(a));
                    setSelectedYear(sortedYears[0]);
                }
            } catch (err) {
                console.error("Error loading initial data:", err);
                setError("Failed to load initial data");
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

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

    // Fetch Archive Structure when Year changes
    useEffect(() => {
        if (!selectedYear) return;

        const loadStructure = async () => {
            try {
                setLoading(true);
                const structure = await fetchArchiveStructure(selectedYear);

                // Filter structure based on user permissions
                const filteredStructure = filterArchiveByUser(
                    structure,
                    currentUser?.userType || currentUser?.user_type,
                    currentUser?.user_id || currentUser?.id,
                    `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim()
                );

                setArchiveStructure(filteredStructure);
            } catch (err) {
                console.error("Error loading archive structure:", err);
                setError("Failed to load archive structure");
            } finally {
                setLoading(false);
            }
        };
        loadStructure();
    }, [selectedYear, currentUser]);

    // Fetch Archive Structure when Config Year changes (for editing existing archives)
    useEffect(() => {
        if (!selectedConfigYear || selectedConfigYear === selectedYear) return;

        const loadConfigStructure = async () => {
            try {
                const structure = await fetchArchiveStructure(selectedConfigYear);

                // Filter structure based on user permissions
                const filteredStructure = filterArchiveByUser(
                    structure,
                    currentUser?.userType || currentUser?.user_type,
                    currentUser?.user_id || currentUser?.id,
                    `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim()
                );

                setArchiveStructure(filteredStructure);
            } catch (err) {
                console.error("Error loading config archive structure:", err);
                // Don't set error here as it might be a new year without structure yet
            }
        };
        loadConfigStructure();
    }, [selectedConfigYear, currentUser]);

    // Fetch Programs when Department changes
    useEffect(() => {
        if (!selectedDept) {
            setPrograms([]);
            setSelectedProgram("");
            return;
        }

        const loadPrograms = async () => {
            try {
                const response = await api.get("/programs/");
                // Filter programs by department
                const deptPrograms = response.data.filter(
                    p => p.department === parseInt(selectedDept)
                );
                setPrograms(deptPrograms);
                setSelectedProgram("");
            } catch (err) {
                console.error("Error loading programs:", err);
            }
        };
        loadPrograms();
    }, [selectedDept]);

    // Fetch Doctors when Department changes
    useEffect(() => {
        if (!selectedDept) {
            setDoctors([]);
            setSelectedDoctor("");
            return;
        }

        const loadDoctors = async () => {
            try {
                const response = await api.get("/faculty/");
                // Filter doctors by department
                let deptDoctors = response.data.filter(
                    d => d.department === parseInt(selectedDept)
                );

                // If user is a professor, only show themselves
                const userType = currentUser?.userType || currentUser?.user_type;
                if (userType === 'professor') {
                    const userId = currentUser?.user_id || currentUser?.id;
                    deptDoctors = deptDoctors.filter(d => d.id === userId);
                }

                setDoctors(deptDoctors);
                setSelectedDoctor("");
            } catch (err) {
                console.error("Error loading doctors:", err);
            }
        };
        loadDoctors();
    }, [selectedDept, currentUser]);

    // Fetch Config Doctors when Config Department changes
    useEffect(() => {
        if (!selectedConfigDept) {
            setConfigDoctors([]);
            setSelectedProfessors([]);
            return;
        }

        const loadConfigDoctors = async () => {
            try {
                const response = await api.get("/faculty/");
                const deptDoctors = response.data.filter(
                    d => d.department === parseInt(selectedConfigDept)
                );
                setConfigDoctors(deptDoctors);
                setSelectedProfessors({
                    "First": [],
                    "Second": [],
                    "Summer": []
                }); // Reset selected professors when department changes
            } catch (err) {
                console.error("Error loading config doctors:", err);
            }
        };
        loadConfigDoctors();
    }, [selectedConfigDept]);

    // Fetch available courses when config department is selected
    useEffect(() => {
        if (!selectedConfigDept) {
            setAvailableCourses([]);
            return;
        }

        const loadAvailableCourses = async () => {
            try {
                const response = await api.get("/courses/");
                // Filter courses by the config department's programs
                const programsResponse = await api.get("/programs/");
                const deptPrograms = programsResponse.data.filter(
                    p => p.department === parseInt(selectedConfigDept)
                );
                const programIds = deptPrograms.map(p => p.id);

                const deptCourses = response.data.filter(
                    c => programIds.includes(c.program)
                );
                setAvailableCourses(deptCourses);
            } catch (err) {
                console.error("Error loading available courses:", err);
            }
        };
        loadAvailableCourses();
    }, [selectedConfigDept]);

    // Fetch professor courses when config department, year, or semester changes
    useEffect(() => {
        if (!selectedConfigDept || !selectedConfigYear) return;
        const loadProfCourses = async () => {
            try {
                // Backend expects "First", "Second", "Summer" (max_length=10)
                const data = await fetchProfessorCourses(selectedConfigYear, activeSemesterTab, selectedConfigDept);
                // data expected as {profId: {name: "...", courses: []}}
                setProfessorCourses(prev => ({
                    ...prev,
                    [activeSemesterTab]: data
                }));
            } catch (e) {
                console.error("Failed to load professor courses", e);
            }
        };
        loadProfCourses();
    }, [selectedConfigDept, selectedConfigYear, activeSemesterTab]);

    // Auto-populate selectedProfessors from existing archive structure
    useEffect(() => {
        if (!selectedConfigYear || !archiveStructure || !configDoctors.length) return;

        const populateFromArchive = () => {
            const newSelectedProfessors = {
                "First": [],
                "Second": [],
                "Summer": []
            };

            // Map semester names in archive to our tab names
            const semesterMap = {
                "First Semester": "First",
                "Second Semester": "Second",
                "Summer Semester": "Summer"
            };

            // Parse archive structure for the selected year
            Object.keys(archiveStructure).forEach(semesterFolder => {
                const semesterKey = semesterMap[semesterFolder];
                if (!semesterKey) return;

                const professors = archiveStructure[semesterFolder];
                if (!professors || typeof professors !== 'object') return;

                // Extract professor IDs from folder names
                Object.keys(professors).forEach(profFolderName => {
                    // Folder format: "Dr. Name - ID123" or just "Dr. Name"
                    const parts = profFolderName.split(" - ");
                    let profId = null;

                    if (parts.length > 1) {
                        // Has ID in folder name
                        profId = parts[1].trim();
                    } else {
                        // Try to match by name
                        const folderName = parts[0].trim();
                        const matchingProf = configDoctors.find(d => {
                            const normalize = (str) => str.toLowerCase().replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/, "").trim();
                            return normalize(d.name) === normalize(folderName);
                        });
                        if (matchingProf) {
                            profId = matchingProf.id;
                        }
                    }

                    // Add to selected if we found a matching professor
                    if (profId) {
                        const profIdNum = parseInt(profId);
                        const matchingProf = configDoctors.find(d => d.id === profIdNum || d.id.toString() === profId);
                        if (matchingProf && !newSelectedProfessors[semesterKey].includes(matchingProf.id)) {
                            newSelectedProfessors[semesterKey].push(matchingProf.id);
                        }
                    }
                });
            });

            setSelectedProfessors(newSelectedProfessors);
        };

        populateFromArchive();
    }, [selectedConfigYear, archiveStructure, configDoctors]);

    // Derive Courses when Doctor or Structure changes
    useEffect(() => {
        if (!selectedDoctor || !selectedYear || !archiveStructure) {
            setCourses([]);
            setSelectedCourse("");
            return;
        }

        const doctorObj = doctors.find(d => d.id.toString() === selectedDoctor);
        if (!doctorObj) return;

        const foundCourses = new Set();

        Object.keys(archiveStructure).forEach(term => {
            const professors = archiveStructure[term];
            const profKey = findProfessorKey(professors, doctorObj);

            if (profKey && professors[profKey]) {
                Object.keys(professors[profKey]).forEach(course => {
                    // Filter out common non-course folders if they appear at this level
                    if (!["syllabus", "exams", "assignments", "slides"].includes(course.toLowerCase())) {
                        foundCourses.add(course);
                    }
                });
            }
        });

        setCourses(Array.from(foundCourses));
        setSelectedCourse("");
    }, [selectedDoctor, archiveStructure, doctors, selectedYear]);

    // Fetch Folder Types when Course is selected
    const [folderTypes, setFolderTypes] = useState([]);
    const [selectedFolderType, setSelectedFolderType] = useState("");

    useEffect(() => {
        if (!selectedCourse || !selectedDoctor) {
            setFolderTypes([]);
            return;
        }

        const doctorObj = doctors.find(d => d.id.toString() === selectedDoctor);
        if (!doctorObj) return;

        const types = new Set();

        Object.keys(archiveStructure).forEach(term => {
            const professors = archiveStructure[term];
            const profKey = findProfessorKey(professors, doctorObj);

            if (profKey && professors[profKey] && professors[profKey][selectedCourse]) {
                Object.keys(professors[profKey][selectedCourse]).forEach(type => {
                    types.add(type);
                });
            }
        });

        setFolderTypes(Array.from(types));
    }, [selectedCourse, archiveStructure, doctors, selectedDoctor]);


    const handleDownload = async (filename, folderType) => {
        const doctorObj = doctors.find(d => d.id.toString() === selectedDoctor);
        if (!doctorObj) return;

        let foundPath = null;

        for (const term of Object.keys(archiveStructure)) {
            const professors = archiveStructure[term];
            const profKey = findProfessorKey(professors, doctorObj);

            if (profKey && professors[profKey] && professors[profKey][selectedCourse] && professors[profKey][selectedCourse][folderType]) {
                foundPath = [term, profKey, selectedCourse, folderType].join("/");
                break;
            }
        }

        if (!foundPath) return;

        try {
            const response = await api.get(
                `/download/?year=${selectedYear}&path=${encodeURIComponent(foundPath)}&filename=${encodeURIComponent(filename)}`,
                { responseType: "blob" }
            );
            saveAs(response.data, filename);
        } catch (err) {
            alert("Download failed: " + (err.response?.data?.error || err.message));
        }
    };

    const handleDeleteFile = async (filename, folderType) => {
        if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) {
            return;
        }

        const doctorObj = doctors.find(d => d.id.toString() === selectedDoctor);
        if (!doctorObj) return;

        let foundPath = null;

        for (const term of Object.keys(archiveStructure)) {
            const professors = archiveStructure[term];
            const profKey = findProfessorKey(professors, doctorObj);

            if (profKey && professors[profKey] && professors[profKey][selectedCourse] && professors[profKey][selectedCourse][folderType]) {
                foundPath = [term, profKey, selectedCourse, folderType].join("/");
                break;
            }
        }

        if (!foundPath) return;

        try {
            await api.delete(
                `/delete-file/?year=${selectedYear}&path=${encodeURIComponent(foundPath)}&filename=${encodeURIComponent(filename)}`
            );
            alert("File deleted successfully!");
            // Refresh the file list
            handleFolderClick(folderType);
        } catch (err) {
            alert("Delete failed: " + (err.response?.data?.error || err.message));
        }
    };

    const handleFolderClick = async (type) => {
        setSelectedFolderType(type);
        setFiles([]);

        const doctorObj = doctors.find(d => d.id.toString() === selectedDoctor);
        if (!doctorObj) return;

        let foundPath = null;

        for (const term of Object.keys(archiveStructure)) {
            const professors = archiveStructure[term];
            const profKey = findProfessorKey(professors, doctorObj);

            if (profKey && professors[profKey] && professors[profKey][selectedCourse] && professors[profKey][selectedCourse][type]) {
                foundPath = [term, profKey, selectedCourse, type].join("/");
                break;
            }
        }

        if (foundPath) {
            try {
                const f = await fetchFiles(selectedYear, foundPath);
                setFiles(f);
            } catch (e) {
                console.error(e);
                setFiles([]);
            }
        }
    };

    // --- Management Functions ---

    const getNextAcademicYear = (yearsList) => {
        const parsed = yearsList
            .map((y) => y.match(/^(\d{4})-(\d{4})$/))
            .filter(Boolean)
            .map((m) => [parseInt(m[1]), parseInt(m[2])]);
        if (!parsed.length) {
            const thisYear = new Date().getFullYear();
            return `${thisYear}-${thisYear + 1}`;
        }
        parsed.sort((a, b) => b[0] - a[0]);
        const [start, end] = parsed[0];
        return `${end}-${end + 1}`;
    };

    const nextAcademicYear = getNextAcademicYear(years);
    const yearAlreadyExists = years.includes(nextAcademicYear);

    const handleAutoGenerate = async () => {
        if (!selectedConfigYear) {
            setError("Please select an academic year first.");
            return;
        }

        setLoading(true);
        setError("");

        const allProfData = {};

        ["First", "Second", "Summer"].forEach(sem => {
            const semData = professorCourses[sem] || {};
            // Filter by selected professors for this semester
            const selectedForSem = selectedProfessors[sem] || [];

            Object.keys(semData).forEach(profId => {
                // Only include if selected
                if (!selectedForSem.includes(parseInt(profId)) && !selectedForSem.includes(profId)) {
                    // Check both number and string just in case
                    return;
                }

                if (!allProfData[profId]) {
                    // Use username as ID if available, otherwise fallback to DB ID
                    const profObj = configDoctors.find(d => d.id.toString() === profId);
                    const displayId = profObj?.username || profId;

                    allProfData[profId] = {
                        name: semData[profId].name,
                        id: displayId,
                        courses_by_semester: {
                            "First Semester": [],
                            "Second Semester": [],
                            "Summer Semester": []
                        }
                    };
                }
                const semKey = `${sem} Semester`;
                allProfData[profId].courses_by_semester[semKey] = semData[profId].courses;
            });
        });

        const professorsPayload = Object.values(allProfData);

        try {
            await api.post("/archive/auto-generate/", {
                academic_year: selectedConfigYear,
                professors: professorsPayload
            });
            await loadYears();
            setSelectedYear(selectedConfigYear);
        } catch (e) {
            setError("Failed to generate: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteYear = async () => {
        if (!selectedYear) return;

        const confirmMsg = `CRITICAL WARNING:\n\nYou are about to DELETE the entire archive for Academic Year ${selectedYear}.\n\nALL FILES AND FOLDERS WILL BE PERMANENTLY LOST.\n\nAre you absolutely sure you want to proceed?`;

        if (window.confirm(confirmMsg)) {
            // Double confirmation
            if (window.confirm(`Please confirm again: DELETE ${selectedYear} PERMANENTLY?`)) {
                setLoading(true);
                try {
                    await deleteAcademicYear(selectedYear);
                    await loadYears();
                    setSelectedYear(""); // Reset selection
                } catch (e) {
                    setError("Failed to delete year: " + e.message);
                } finally {
                    setLoading(false);
                }
            }
        }
    };

    // Professor selection handlers
    const toggleProfessor = (professorId) => {
        setSelectedProfessors(prev => {
            const currentSemSelected = prev[activeSemesterTab] || [];
            const isSelected = currentSemSelected.includes(professorId);

            let newSelected;
            if (isSelected) {
                newSelected = currentSemSelected.filter(id => id !== professorId);
            } else {
                newSelected = [...currentSemSelected, professorId];
            }

            return {
                ...prev,
                [activeSemesterTab]: newSelected
            };
        });
    };

    const toggleSelectAll = () => {
        const currentSemSelected = selectedProfessors[activeSemesterTab] || [];
        if (currentSemSelected.length === configDoctors.length) {
            // Deselect all for this semester
            setSelectedProfessors(prev => ({
                ...prev,
                [activeSemesterTab]: []
            }));
        } else {
            // Select all for this semester
            setSelectedProfessors(prev => ({
                ...prev,
                [activeSemesterTab]: configDoctors.map(d => d.id)
            }));
        }
    };

    const isAllProfessorsSelected = () => {
        const currentSemSelected = selectedProfessors[activeSemesterTab] || [];
        return configDoctors.length > 0 && currentSemSelected.length === configDoctors.length;
    };

    // Course assignment handlers
    const handleAddCourse = async (profId, courseName = null) => {
        const prof = configDoctors.find(d => d.id === profId);
        const profName = prof ? prof.name : "Unknown";

        const courseToAdd = courseName || profDropdowns[profId];
        if (!courseToAdd) return;

        // Update local state optimistically
        setProfessorCourses(prev => {
            const semesterData = prev[activeSemesterTab] || {};
            const currentEntry = semesterData[profId] || { name: profName, courses: [] };
            const val = courseToAdd.toString();
            if (!currentEntry.courses.includes(val)) {
                return {
                    ...prev,
                    [activeSemesterTab]: {
                        ...semesterData,
                        [profId]: {
                            name: profName,
                            courses: [...currentEntry.courses, val]
                        }
                    }
                };
            }
            return prev;
        });

        // Persist to backend if this is a custom course addition
        if (courseName && selectedConfigYear) {
            try {
                // Backend expects "First", "Second", "Summer"
                await assignCourse(selectedConfigYear, activeSemesterTab, profId, courseName);
            } catch (e) {
                console.error("Failed to assign course on server", e);
            }
            setCustomCourseInputs(prev => ({ ...prev, [profId]: "" }));
            setShowCustomInput(prev => ({ ...prev, [profId]: false }));
        } else {
            setProfDropdowns(prev => ({ ...prev, [profId]: "" }));
        }
    };

    const handleRemoveCourse = (profId, courseId) => {
        setProfessorCourses(prev => {
            const semesterData = prev[activeSemesterTab] || {};
            const currentEntry = semesterData[profId];
            if (!currentEntry) return prev;

            return {
                ...prev,
                [activeSemesterTab]: {
                    ...semesterData,
                    [profId]: {
                        ...currentEntry,
                        courses: currentEntry.courses.filter(id => id !== courseId.toString())
                    }
                }
            };
        });
    };

    const getProfessorCourses = (professorId) => {
        return professorCourses[activeSemesterTab]?.[professorId]?.courses || [];
    };

    return (
        <div className="archive-admin-container">
            <div className="archive-admin-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="archive-admin-title">Archive Admin</h1>
                        <p className="archive-admin-subtitle">Manage and view archives by Department and Faculty</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.9rem', color: yearAlreadyExists ? '#718096' : '#ed8936' }}>
                            {yearAlreadyExists ? `Next: ${nextAcademicYear} (Exists)` : `Next: ${nextAcademicYear}`}
                        </span>
                        <button
                            className="action-btn"
                            onClick={handleAutoGenerate}
                            disabled={yearAlreadyExists || loading}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <FaMagic /> Auto-Generate New Year
                        </button>
                    </div>
                </div>
            </div>

            <div className="filters-container">
                {/* 1. Year Selection */}
                <div className="filter-group">
                    <label className="filter-label">Academic Year</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                            className="filter-select"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            style={{ flex: 1 }}
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        {selectedYear && (
                            <button
                                className="action-btn danger"
                                onClick={handleDeleteYear}
                                title="Delete this Academic Year"
                                style={{ padding: '0.5rem' }}
                            >
                                <FaTrash />
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. Department Selection */}
                <div className="filter-group">
                    <label className="filter-label">Department</label>
                    <select
                        className="filter-select"
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                    >
                        <option value="">Select Department</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>

                {/* 3. Program Selection */}
                <div className="filter-group">
                    <label className="filter-label">Program</label>
                    <select
                        className="filter-select"
                        value={selectedProgram}
                        onChange={(e) => setSelectedProgram(e.target.value)}
                        disabled={!selectedDept}
                    >
                        <option value="">Select Program</option>
                        {programs.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                {/* 4. Doctor Selection */}
                <div className="filter-group">
                    <label className="filter-label">Professor</label>
                    <select
                        className="filter-select"
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        disabled={!selectedProgram}
                    >
                        <option value="">Select Professor</option>
                        {doctors.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>

                {/* 5. Course Selection */}
                <div className="filter-group">
                    <label className="filter-label">Course</label>
                    <select
                        className="filter-select"
                        value={selectedCourse}
                        onChange={(e) => {
                            setSelectedCourse(e.target.value);
                            setSelectedFolderType(""); // Reset folder type
                            setFiles([]);
                        }}
                        disabled={!selectedDoctor}
                    >
                        <option value="">Select Course</option>
                        {courses.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="content-section">
                {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
                {loading && <div className="loading-spinner">Loading...</div>}

                {!loading && !selectedCourse && (
                    <div className="empty-state">
                        <FaFolder size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>Select all filters to view archive folders</p>
                    </div>
                )}

                {!loading && selectedCourse && !selectedFolderType && (
                    <div className="folder-grid">
                        {folderTypes.length > 0 ? folderTypes.map(type => (
                            <div key={type} className="folder-card" onClick={() => handleFolderClick(type)}>
                                <div className="folder-header"></div>
                                <div className="folder-content">
                                    <FaFolder className="folder-icon" />
                                    <span className="folder-name">{type}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state">
                                <p>No folders found for this course.</p>
                            </div>
                        )}
                    </div>
                )}

                {!loading && selectedFolderType && (
                    <div>
                        <button
                            className="btn-download"
                            style={{ marginBottom: '1rem' }}
                            onClick={() => setSelectedFolderType("")}
                        >
                            &larr; Back to Folders
                        </button>
                        <h3 style={{ marginBottom: '1rem' }}>{selectedFolderType}</h3>
                        <div className="file-list">
                            {files.length > 0 ? files.map(file => (
                                <div key={file} className="file-item">
                                    <div className="file-info">
                                        <FaFile color="#718096" />
                                        <span className="file-name">{file}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="btn-download"
                                            onClick={() => handleDownload(file, selectedFolderType)}
                                        >
                                            <FaDownload /> Download
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDeleteFile(file, selectedFolderType)}
                                            style={{
                                                backgroundColor: '#e53e3e',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '14px',
                                                fontWeight: '500'
                                            }}
                                        >
                                            <FaTrash /> Delete
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <p>No files in this folder.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Academic Year Generation Configuration Section */}
            <div className="config-section">
                <div
                    className="config-header"
                    onClick={() => setConfigExpanded(!configExpanded)}
                    style={{ cursor: 'pointer' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {configExpanded ? <FaChevronUp /> : <FaChevronDown />}
                        <h2 className="config-title">Academic Year Generation Configuration</h2>
                    </div>
                    <span className="config-subtitle">
                        Configure course assignments for upcoming semesters
                    </span>
                </div>

                {configExpanded && (
                    <div className="config-content">
                        {/* Academic Year Selection */}
                        <div className="config-year-selector">
                            <label className="config-label">Select Academic Year:</label>
                            <select
                                className="config-select"
                                value={selectedConfigYear}
                                onChange={(e) => setSelectedConfigYear(e.target.value)}
                            >
                                <option value="">Select Year</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                                {nextAcademicYear && !years.includes(nextAcademicYear) && (
                                    <option value={nextAcademicYear}>{nextAcademicYear} (Upcoming)</option>
                                )}
                            </select>
                        </div>

                        {selectedConfigYear && (
                            <>
                                {/* Department Selection for Config */}
                                <div className="config-year-selector" style={{ marginTop: '1rem' }}>
                                    <label className="config-label">Select Department:</label>
                                    <select
                                        className="config-select"
                                        value={selectedConfigDept}
                                        onChange={(e) => setSelectedConfigDept(e.target.value)}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Semester Tabs */}
                                <div className="semester-tabs" style={{ marginTop: '2rem' }}>
                                    {['First', 'Second', 'Summer'].map(semester => (
                                        <button
                                            key={semester}
                                            className={`semester-tab ${activeSemesterTab === semester ? 'active' : ''}`}
                                            onClick={() => setActiveSemesterTab(semester)}
                                        >
                                            {semester} Semester
                                        </button>
                                    ))}
                                </div>

                                {/* Semester Content Area */}
                                <div className="semester-content">
                                    <h3>Configure Courses for {activeSemesterTab} Semester</h3>
                                    <p style={{ color: '#718096', marginTop: '0.5rem' }}>
                                        Academic Year: <strong>{selectedConfigYear}</strong>
                                    </p>

                                    <div className="professor-selection-area" style={{ marginTop: '2rem' }}>
                                        {selectedConfigDept ? (
                                            <>
                                                {/* Select All Checkbox */}
                                                <div className="select-all-section">
                                                    <label className="professor-checkbox-label select-all">
                                                        <input
                                                            type="checkbox"
                                                            checked={isAllProfessorsSelected()}
                                                            onChange={toggleSelectAll}
                                                            disabled={configDoctors.length === 0}
                                                        />
                                                        <span className="checkbox-text">
                                                            Select All Professors ({configDoctors.length})
                                                        </span>
                                                    </label>
                                                </div>

                                                {/* Professor List */}
                                                {configDoctors.length > 0 ? (
                                                    <div className="professor-list">
                                                        {configDoctors.map(professor => (
                                                            <label key={professor.id} className="professor-checkbox-label">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={(selectedProfessors[activeSemesterTab] || []).includes(professor.id)}
                                                                    onChange={() => toggleProfessor(professor.id)}
                                                                />
                                                                <span className="checkbox-text">
                                                                    {professor.name}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p style={{ textAlign: 'center', color: '#a0aec0', padding: '2rem' }}>
                                                        No professors found in this department.
                                                    </p>
                                                )}

                                                {/* Course Assignment for Selected Professors */}
                                                {(selectedProfessors[activeSemesterTab] || []).length > 0 && (
                                                    <div className="course-assignment-section">
                                                        <h4>Assign Courses to Professors:</h4>
                                                        <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                                            Select courses for each professor to teach in the {activeSemesterTab} semester
                                                        </p>

                                                        {(selectedProfessors[activeSemesterTab] || []).map(profId => {
                                                            const prof = configDoctors.find(d => d.id === profId);
                                                            if (!prof) return null;

                                                            const assignedCourses = getProfessorCourses(profId);

                                                            return (
                                                                <div key={profId} className="professor-course-card">
                                                                    <div className="professor-course-header">
                                                                        <div>
                                                                            <h5 className="professor-course-name">{prof.name}</h5>
                                                                            <span className="assigned-count">
                                                                                {assignedCourses.length} course{assignedCourses.length !== 1 ? 's' : ''} assigned
                                                                            </span>
                                                                        </div>
                                                                        <button
                                                                            className="remove-prof-btn"
                                                                            onClick={() => toggleProfessor(profId)}
                                                                            title="Remove professor"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>

                                                                    <div className="course-selection-area">
                                                                        {/* Add Course Control */}
                                                                        {showCustomInput[profId] ? (
                                                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                                                <input
                                                                                    type="text"
                                                                                    className="filter-select"
                                                                                    style={{ flex: 1, padding: '0.5rem' }}
                                                                                    placeholder="Enter course name..."
                                                                                    value={customCourseInputs[profId] || ""}
                                                                                    onChange={(e) => setCustomCourseInputs({ ...customCourseInputs, [profId]: e.target.value })}
                                                                                    onKeyDown={(e) => {
                                                                                        if (e.key === 'Enter') handleAddCourse(profId, customCourseInputs[profId]);
                                                                                    }}
                                                                                />
                                                                                <button
                                                                                    className="action-btn"
                                                                                    onClick={() => handleAddCourse(profId, customCourseInputs[profId])}
                                                                                >
                                                                                    Add
                                                                                </button>
                                                                                <button
                                                                                    className="action-btn danger"
                                                                                    onClick={() => setShowCustomInput({ ...showCustomInput, [profId]: false })}
                                                                                >
                                                                                    Cancel
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <div style={{ marginTop: '0.5rem' }}>
                                                                                {assignedCourses.length === 0 && (
                                                                                    <div style={{ color: '#a0aec0', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                                                                                        No courses assigned
                                                                                    </div>
                                                                                )}
                                                                                <button
                                                                                    className="action-btn"
                                                                                    style={{ width: '100%', justifyContent: 'center' }}
                                                                                    onClick={() => setShowCustomInput({ ...showCustomInput, [profId]: true })}
                                                                                >
                                                                                    <FaPlus /> Add Course
                                                                                </button>
                                                                            </div>
                                                                        )}

                                                                        {/* List of assigned courses */}
                                                                        <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                                            {assignedCourses.map(course => (
                                                                                <div key={course} style={{
                                                                                    background: '#edf2f7',
                                                                                    padding: '0.25rem 0.75rem',
                                                                                    borderRadius: '15px',
                                                                                    fontSize: '0.9rem',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '0.5rem'
                                                                                }}>
                                                                                    <span>{course}</span>
                                                                                    <button
                                                                                        onClick={() => handleRemoveCourse(profId, course)}
                                                                                        style={{
                                                                                            border: 'none',
                                                                                            background: 'none',
                                                                                            color: '#e53e3e',
                                                                                            cursor: 'pointer',
                                                                                            padding: 0,
                                                                                            display: 'flex',
                                                                                            alignItems: 'center'
                                                                                        }}
                                                                                    >
                                                                                        <FaTimes size={12} />
                                                                                    </button>
                                                                                </div>
                                                                            ))}
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p style={{ textAlign: 'center', color: '#a0aec0', padding: '2rem' }}>
                                                Please select a department above to view professors.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Final Generation Button */}
                        {selectedConfigYear && selectedConfigDept && (
                            <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
                                <button
                                    className="action-btn"
                                    onClick={handleAutoGenerate}
                                    disabled={loading}
                                    style={{
                                        padding: '1rem 2rem',
                                        fontSize: '1.1rem',
                                        backgroundColor: '#48bb78',
                                        color: 'white'
                                    }}
                                >
                                    <FaMagic style={{ marginRight: '0.5rem' }} />
                                    Apply Changes to {selectedConfigYear}
                                </button>
                                <p style={{ marginTop: '1rem', color: '#718096', fontSize: '0.9rem' }}>
                                    This will update the folder structure for all semesters based on your selections above.
                                </p>
                            </div>
                        )}

                        {!selectedConfigYear && (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#a0aec0' }}>
                                <p>Please select an academic year to begin configuring semester courses.</p>
                            </div>
                        )}
                    </div>
                )
                }
            </div >
        </div >
    );
};

export default ArchiveAdmin;
