import {
  AlertCircle,
  GraduationCap,
  Mail,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import "../App.css";
import { apiRequest } from "../services/api";

function Students() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add Student modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const initialForm = {
    first_name: "",
    last_name: "",
    email: "",
    age: "",
    gender: "",
    course_id: "",
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchStudents = async () => {
    setLoading(true);
    setError("");

    try {
      const [studentData, courseData] = await Promise.all([
        apiRequest("/students/"),
        apiRequest("/courses/"),
      ]);

      setStudents(studentData);
      setCourses(courseData);
    } catch (err) {
      console.error("Students API error:", err);
      setError(err.message || "Unable to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const courseMap = Object.fromEntries(
    courses.map((course) => [course.course_id, course.course_name]),
  );

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();

    return (
      fullName.includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setFormData(initialForm);
    setFormError("");
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    if (saving) return;

    setShowAddModal(false);
    setFormError("");
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setFormError("");

    const payload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      age: Number(formData.age),
      gender: formData.gender,
      course_id: Number(formData.course_id),
    };

    if (
      !payload.first_name ||
      !payload.last_name ||
      !payload.email ||
      !formData.age ||
      !payload.gender ||
      !formData.course_id
    ) {
      setFormError("Please fill in all fields.");
      return;
    }

    if (!Number.isInteger(payload.age) || payload.age <= 0) {
      setFormError("Please enter a valid age.");
      return;
    }

    if (!Number.isInteger(payload.course_id) || payload.course_id <= 0) {
      setFormError("Please select a valid course.");
      return;
    }

    try {
      setSaving(true);

      await apiRequest("/students/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setShowAddModal(false);
      setFormData(initialForm);

      await fetchStudents();
    } catch (err) {
      console.error("Add student error:", err);
      setFormError(err.message || "Unable to add student.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="students-page">
      {/* Page heading */}
      <div className="page-heading">
        <div>
          <h2>Student Management</h2>
          <p>View and manage all registered students.</p>
        </div>

        <button className="primary-button" onClick={openAddModal}>
          <Plus size={17} />
          Add Student
        </button>
      </div>

      {/* Summary cards */}
      <div className="student-summary">
        <div className="summary-card">
          <div className="summary-icon">
            <Users size={21} />
          </div>
          <div>
            <span>Total Students</span>
            <h3>{students.length}</h3>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon assigned">
            <GraduationCap size={21} />
          </div>
          <div>
            <span>Assigned Students</span>
            <h3>{students.filter((s) => s.course_id !== null).length}</h3>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon unassigned">
            <Users size={21} />
          </div>
          <div>
            <span>Unassigned Students</span>
            <h3>{students.filter((s) => s.course_id === null).length}</h3>
          </div>
        </div>
      </div>

      {/* Students table */}
      <div className="students-table-card">
        <div className="students-toolbar">
          <div>
            <h3>All Students</h3>
            <p>{students.length} registered records</p>
          </div>

          <div className="students-actions">
            <div className="search-box">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              className="refresh-button"
              onClick={fetchStudents}
              disabled={loading}
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            {error}
            <button onClick={fetchStudents}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="students-empty">Loading student records...</div>
        ) : (
          !error && (
            <div className="table-wrapper">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Email Address</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Course</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.student_id}>
                      <td>#{student.student_id}</td>

                      <td>
                        <div className="student-name">
                          <div className="student-avatar">
                            {student.first_name.charAt(0)}
                          </div>

                          <span>
                            {student.first_name} {student.last_name}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="email-cell">
                          <Mail size={14} />
                          {student.email}
                        </div>
                      </td>

                      <td>{student.age}</td>
                      <td>{student.gender}</td>

                      <td>
                        {student.course_id === null ? (
                          <span className="unassigned-badge">Not Assigned</span>
                        ) : (
                          <span className="course-badge">
                            {courseMap[student.course_id] || "Unknown"}
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="table-action edit"
                            title="Edit student"
                            disabled
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="table-action delete"
                            title="Delete student"
                            disabled
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredStudents.length === 0 && (
                <div className="students-empty">
                  No matching student records found.
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div
          className="student-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeAddModal();
          }}
        >
          <div
            className="student-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-student-title"
          >
            <div className="student-modal-header">
              <div className="student-modal-heading">
                <div className="student-modal-icon">
                  <UserPlus size={21} />
                </div>

                <div>
                  <h2 id="add-student-title">Add New Student</h2>
                  <p>Enter the student's information below.</p>
                </div>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={closeAddModal}
                disabled={saving}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddStudent}>
              <div className="student-form-grid">
                <div className="form-field">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    placeholder="Enter first name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    placeholder="Enter last name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="student@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="age">Age</label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="1"
                    max="120"
                    placeholder="Enter age"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-field full-width">
                  <label htmlFor="course_id">Course</label>
                  <select
                    id="course_id"
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a course</option>

                    {courses.map((course) => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formError && (
                <div className="form-error-message">
                  <AlertCircle size={17} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="student-modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeAddModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="spin-icon" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Student
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;
