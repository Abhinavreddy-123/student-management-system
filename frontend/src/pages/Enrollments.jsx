import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  RefreshCw,
  Save,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { apiRequest } from "../services/api";

function Enrollments() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // Fetch students and courses
  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError("");

      const [studentsData, coursesData] = await Promise.all([
        apiRequest("/students/"),
        apiRequest("/courses/"),
      ]);

      setStudents(studentsData);
      setCourses(coursesData);
    } catch (err) {
      setError(err.message || "Unable to load enrollment information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  // Course lookup
  const getCourse = (courseId) => {
    return courses.find((course) => course.course_id === courseId);
  };

  // Enrollment statistics
  const enrolledStudents = students.filter(
    (student) => student.course_id !== null && student.course_id !== undefined,
  );

  const unassignedStudents = students.filter(
    (student) => student.course_id === null || student.course_id === undefined,
  );

  // Filter students
  const filteredStudents = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return students.filter((student) => {
      const course = courses.find(
        (item) => item.course_id === student.course_id,
      );

      const matchesSearch =
        !search ||
        `${student.first_name} ${student.last_name}`
          .toLowerCase()
          .includes(search) ||
        student.email?.toLowerCase().includes(search) ||
        String(student.student_id).includes(search) ||
        course?.course_name?.toLowerCase().includes(search) ||
        course?.department?.toLowerCase().includes(search);

      const matchesCourse =
        courseFilter === "all"
          ? true
          : courseFilter === "unassigned"
            ? !student.course_id
            : student.course_id === Number(courseFilter);

      return matchesSearch && matchesCourse;
    });
  }, [students, courses, searchTerm, courseFilter]);

  // Open assignment modal
  const openAssignmentModal = (student) => {
    setSelectedStudent(student);
    setSelectedCourseId(student.course_id ? String(student.course_id) : "");
    setError("");
    setModalOpen(true);
  };

  // Save course assignment
  const handleAssignment = async (event) => {
    event.preventDefault();

    if (!selectedStudent) return;

    const payload = {
      first_name: selectedStudent.first_name,
      last_name: selectedStudent.last_name,
      email: selectedStudent.email,
      age: selectedStudent.age ?? null,
      gender: selectedStudent.gender ?? null,
      course_id: selectedCourseId ? Number(selectedCourseId) : null,
    };

    try {
      setSaving(true);
      setError("");

      await apiRequest(`/students/${selectedStudent.student_id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setModalOpen(false);
      setSelectedStudent(null);

      setSuccess(
        selectedCourseId
          ? "Course assignment updated successfully."
          : "Student course assignment removed successfully.",
      );

      await fetchEnrollments();
    } catch (err) {
      setError(err.message || "Unable to update course assignment.");
    } finally {
      setSaving(false);
    }
  };

  // Remove course assignment
  const handleRemoveAssignment = async (student) => {
    const confirmed = window.confirm(
      `Remove the course assignment for ${student.first_name} ${student.last_name}?`,
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const payload = {
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        age: student.age ?? null,
        gender: student.gender ?? null,
        course_id: null,
      };

      await apiRequest(`/students/${student.student_id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setSuccess("Course assignment removed successfully.");

      await fetchEnrollments();
    } catch (err) {
      setError(err.message || "Unable to remove course assignment.");
    }
  };

  // Clear success message
  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [success]);

  return (
    <div className="enrollments-page">
      {/* Page Heading */}
      <div className="enrollments-page-heading">
        <div>
          <h2>Enrollments Management</h2>
          <p>Manage student registrations and course assignments.</p>
        </div>

        <button
          className="enrollments-refresh-button"
          onClick={fetchEnrollments}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "enrollments-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="enrollments-summary">
        <div className="enrollments-summary-card">
          <div className="enrollments-summary-icon blue">
            <Users size={21} />
          </div>

          <div>
            <span>Total Students</span>
            <h3>{students.length}</h3>
          </div>
        </div>

        <div className="enrollments-summary-card">
          <div className="enrollments-summary-icon green">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Enrolled Students</span>
            <h3>{enrolledStudents.length}</h3>
          </div>
        </div>

        <div className="enrollments-summary-card">
          <div className="enrollments-summary-icon orange">
            <UserRound size={21} />
          </div>

          <div>
            <span>Not Enrolled</span>
            <h3>{unassignedStudents.length}</h3>
          </div>
        </div>

        <div className="enrollments-summary-card">
          <div className="enrollments-summary-icon purple">
            <BookOpen size={21} />
          </div>

          <div>
            <span>Available Courses</span>
            <h3>{courses.length}</h3>
          </div>
        </div>
      </div>

      {/* Enrollment Table */}
      <div className="enrollments-table-card">
        <div className="enrollments-toolbar">
          <div>
            <h3>Student Enrollments</h3>
            <p>View and manage course assignments for all students.</p>
          </div>

          <div className="enrollments-toolbar-actions">
            <div className="enrollments-search-box">
              <Search size={17} />

              <input
                type="text"
                placeholder="Search students or courses..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="enrollments-filter">
              <select
                value={courseFilter}
                onChange={(event) => setCourseFilter(event.target.value)}
                aria-label="Filter by course"
              >
                <option value="all">All Students</option>
                <option value="unassigned">Not Enrolled</option>

                {courses.map((course) => (
                  <option
                    key={course.course_id}
                    value={String(course.course_id)}
                  >
                    {course.course_name}
                  </option>
                ))}
              </select>

              <ChevronDown size={15} />
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && !modalOpen && (
          <div className="enrollments-alert error">
            <AlertCircle size={17} />
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <X size={15} />
            </button>
          </div>
        )}

        {success && (
          <div className="enrollments-alert success">
            <CheckCircle2 size={17} />
            <span>{success}</span>
            <button onClick={() => setSuccess("")} aria-label="Dismiss message">
              <X size={15} />
            </button>
          </div>
        )}

        <div className="enrollments-table-wrapper">
          <table className="enrollments-table">
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>COURSE</th>
                <th>DEPARTMENT</th>
                <th>ENROLLMENT DATE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="enrollments-empty">
                    <RefreshCw size={22} className="enrollments-spin" />
                    <p>Loading enrollments...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="enrollments-empty">
                    <Users size={30} />
                    <p>No students match your search or filter.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const course = getCourse(student.course_id);
                  const isEnrolled = Boolean(student.course_id);

                  return (
                    <tr key={student.student_id}>
                      <td>
                        <div className="enrollments-student-cell">
                          <div className="enrollments-student-avatar">
                            {student.first_name?.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {student.first_name} {student.last_name}
                            </strong>
                            <span>{student.email}</span>
                            <small>Student ID: #{student.student_id}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        {course ? (
                          <div className="enrollments-course-cell">
                            <div className="enrollments-course-icon">
                              <GraduationCap size={16} />
                            </div>
                            <span>{course.course_name}</span>
                          </div>
                        ) : (
                          <span className="enrollments-not-assigned">
                            Not assigned
                          </span>
                        )}
                      </td>

                      <td>
                        <span className="enrollments-department">
                          {course?.department || "—"}
                        </span>
                      </td>

                      <td>
                        <div className="enrollments-date">
                          <CalendarDays size={14} />
                          {isEnrolled && student.enrollment_date
                            ? student.enrollment_date
                            : "—"}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`enrollments-status ${
                            isEnrolled ? "enrolled" : "not-enrolled"
                          }`}
                        >
                          <span className="enrollments-status-dot" />
                          {isEnrolled ? "Enrolled" : "Not Enrolled"}
                        </span>
                      </td>

                      <td>
                        <div className="enrollments-actions">
                          <button
                            className="enrollments-manage-button"
                            onClick={() => openAssignmentModal(student)}
                          >
                            {isEnrolled ? "Change" : "Assign"}
                          </button>

                          {isEnrolled && (
                            <button
                              className="enrollments-remove-button"
                              onClick={() => handleRemoveAssignment(student)}
                              title="Remove course assignment"
                            >
                              <X size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="enrollments-table-footer">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>

      {/* Assign / Change Course Modal */}
      {modalOpen && selectedStudent && (
        <div
          className="enrollments-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setModalOpen(false);
            }
          }}
        >
          <div className="enrollments-modal">
            <div className="enrollments-modal-header">
              <div className="enrollments-modal-title">
                <div className="enrollments-modal-icon">
                  <GraduationCap size={21} />
                </div>

                <div>
                  <h3>
                    {selectedStudent.course_id
                      ? "Change Course Assignment"
                      : "Assign Course"}
                  </h3>

                  <p>Choose a course for this student.</p>
                </div>
              </div>

              <button
                className="enrollments-modal-close"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleAssignment}>
              <div className="enrollments-form-body">
                {error && (
                  <div className="enrollments-alert error">
                    <AlertCircle size={17} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="enrollments-selected-student">
                  <div className="enrollments-student-avatar">
                    {selectedStudent.first_name?.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <strong>
                      {selectedStudent.first_name} {selectedStudent.last_name}
                    </strong>
                    <span>{selectedStudent.email}</span>
                  </div>
                </div>

                <div className="enrollments-form-field">
                  <label htmlFor="course_assignment">Select Course *</label>

                  <select
                    id="course_assignment"
                    value={selectedCourseId}
                    onChange={(event) =>
                      setSelectedCourseId(event.target.value)
                    }
                    required
                  >
                    <option value="">Choose a course</option>

                    {courses.map((course) => (
                      <option
                        key={course.course_id}
                        value={String(course.course_id)}
                      >
                        {course.course_name}
                      </option>
                    ))}
                  </select>

                  <span className="enrollments-field-hint">
                    Selecting a new course will update the student's current
                    assignment.
                  </span>
                </div>
              </div>

              <div className="enrollments-modal-footer">
                <button
                  type="button"
                  className="enrollments-secondary-button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="enrollments-primary-button"
                  disabled={saving || !selectedCourseId}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="enrollments-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Assignment
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

export default Enrollments;
