import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  BookOpen,
  Building2,
  Clock,
  GraduationCap,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { apiRequest } from "../services/api";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [formData, setFormData] = useState({
    course_name: "",
    duration: "",
    department: "",
  });

  // Fetch courses and enrollment information
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const [coursesData, enrollmentData] = await Promise.all([
        apiRequest("/courses/"),
        apiRequest("/student-courses"),
      ]);

      setCourses(coursesData);
      setEnrollments(enrollmentData);
    } catch (err) {
      setError(err.message || "Unable to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Calculate the number of students enrolled in each course
  const getStudentCount = (courseId) => {
    return enrollments.filter((enrollment) => enrollment.course_id === courseId)
      .length;
  };

  // Search functionality
  const filteredCourses = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return courses;

    return courses.filter((course) => {
      return (
        course.course_name?.toLowerCase().includes(search) ||
        course.department?.toLowerCase().includes(search) ||
        course.duration?.toLowerCase().includes(search) ||
        String(course.course_id).includes(search)
      );
    });
  }, [courses, searchTerm]);

  // Open modal for adding a course
  const openAddModal = () => {
    setEditingCourse(null);

    setFormData({
      course_name: "",
      duration: "",
      department: "",
    });

    setError("");
    setModalOpen(true);
  };

  // Open modal for editing a course
  const openEditModal = (course) => {
    setEditingCourse(course);

    setFormData({
      course_name: course.course_name || "",
      duration: course.duration || "",
      department: course.department || "",
    });

    setError("");
    setModalOpen(true);
  };

  // Handle form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Add or update a course
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.course_name.trim() || !formData.duration.trim()) {
      setError("Course name and duration are required.");
      return;
    }

    const payload = {
      course_name: formData.course_name.trim(),
      duration: formData.duration.trim(),
      department: formData.department.trim() || null,
    };

    try {
      setSaving(true);
      setError("");

      if (editingCourse) {
        await apiRequest(`/courses/${editingCourse.course_id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        setSuccess("Course updated successfully.");
      } else {
        await apiRequest("/courses/", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setSuccess("Course added successfully.");
      }

      setModalOpen(false);

      await fetchCourses();
    } catch (err) {
      setError(err.message || "Unable to save course.");
    } finally {
      setSaving(false);
    }
  };

  // Delete a course
  const handleDelete = async (course) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${course.course_name}"?`,
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await apiRequest(`/courses/${course.course_id}`, {
        method: "DELETE",
      });

      setSuccess("Course deleted successfully.");

      await fetchCourses();
    } catch (err) {
      setError(err.message || "Unable to delete course.");
    }
  };

  // Automatically clear success message after a short period
  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [success]);

  const totalStudents = enrollments.length;

  const assignedStudents = new Set(
    enrollments.map((enrollment) => enrollment.student_id),
  ).size;

  return (
    <div className="courses-page">
      {/* Page Heading */}
      <div className="courses-page-heading">
        <div>
          <h2>Courses Management</h2>
          <p>Manage courses, departments and student registrations.</p>
        </div>

        <button className="courses-primary-button" onClick={openAddModal}>
          <Plus size={17} />
          Add Course
        </button>
      </div>

      {/* Summary Cards */}
      <div className="courses-summary">
        <div className="courses-summary-card">
          <div className="courses-summary-icon blue">
            <BookOpen size={21} />
          </div>

          <div>
            <span>Total Courses</span>
            <h3>{courses.length}</h3>
          </div>
        </div>

        <div className="courses-summary-card">
          <div className="courses-summary-icon green">
            <Users size={21} />
          </div>

          <div>
            <span>Total Enrollments</span>
            <h3>{totalStudents}</h3>
          </div>
        </div>

        <div className="courses-summary-card">
          <div className="courses-summary-icon purple">
            <GraduationCap size={21} />
          </div>

          <div>
            <span>Enrolled Students</span>
            <h3>{assignedStudents}</h3>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="courses-table-card">
        <div className="courses-toolbar">
          <div>
            <h3>All Courses</h3>
            <p>View and manage all available courses.</p>
          </div>

          <div className="courses-toolbar-actions">
            <div className="courses-search-box">
              <Search size={17} />

              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <button
              className="courses-refresh-button"
              onClick={fetchCourses}
              disabled={loading}
              title="Refresh courses"
            >
              <RefreshCw size={17} className={loading ? "courses-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && !modalOpen && (
          <div className="courses-alert error">
            <AlertCircle size={17} />
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <X size={15} />
            </button>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="courses-alert success">
            <span>{success}</span>
            <button onClick={() => setSuccess("")} aria-label="Dismiss message">
              <X size={15} />
            </button>
          </div>
        )}

        <div className="courses-table-wrapper">
          <table className="courses-table">
            <thead>
              <tr>
                <th>COURSE</th>
                <th>DURATION</th>
                <th>DEPARTMENT</th>
                <th>STUDENTS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="courses-empty">
                    <RefreshCw size={22} className="courses-spin" />
                    <p>Loading courses...</p>
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="courses-empty">
                    <BookOpen size={30} />
                    <p>
                      {searchTerm
                        ? "No courses match your search."
                        : "No courses found. Add your first course."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.course_id}>
                    <td>
                      <div className="courses-name-cell">
                        <div className="courses-row-icon">
                          <BookOpen size={17} />
                        </div>

                        <div>
                          <strong>{course.course_name}</strong>
                          <span>Course ID: #{course.course_id}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="courses-detail-cell">
                        <Clock size={15} />
                        {course.duration}
                      </div>
                    </td>

                    <td>
                      <div className="courses-detail-cell">
                        <Building2 size={15} />
                        {course.department || "Not specified"}
                      </div>
                    </td>

                    <td>
                      <span className="courses-student-count">
                        <Users size={14} />
                        {getStudentCount(course.course_id)}
                      </span>
                    </td>

                    <td>
                      <div className="courses-action-buttons">
                        <button
                          className="courses-action edit"
                          onClick={() => openEditModal(course)}
                          title="Edit course"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          className="courses-action delete"
                          onClick={() => handleDelete(course)}
                          title="Delete course"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="courses-table-footer">
          Showing {filteredCourses.length} of {courses.length} courses
        </div>
      </div>

      {/* Add / Edit Course Modal */}
      {modalOpen && (
        <div
          className="courses-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setModalOpen(false);
            }
          }}
        >
          <div className="courses-modal">
            <div className="courses-modal-header">
              <div className="courses-modal-title">
                <div className="courses-modal-icon">
                  {editingCourse ? (
                    <Pencil size={20} />
                  ) : (
                    <BookOpen size={20} />
                  )}
                </div>

                <div>
                  <h3>{editingCourse ? "Edit Course" : "Add New Course"}</h3>

                  <p>
                    {editingCourse
                      ? "Update the course information below."
                      : "Enter the details to create a new course."}
                  </p>
                </div>
              </div>

              <button
                className="courses-modal-close"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="courses-form-body">
                {error && (
                  <div className="courses-alert error">
                    <AlertCircle size={17} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="courses-form-field">
                  <label htmlFor="course_name">Course Name *</label>

                  <input
                    id="course_name"
                    name="course_name"
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={formData.course_name}
                    onChange={handleChange}
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="courses-form-field">
                  <label htmlFor="duration">Course Duration *</label>

                  <input
                    id="duration"
                    name="duration"
                    type="text"
                    placeholder="e.g. 4 Years"
                    value={formData.duration}
                    onChange={handleChange}
                    maxLength={50}
                    required
                  />
                </div>

                <div className="courses-form-field">
                  <label htmlFor="department">Department</label>

                  <input
                    id="department"
                    name="department"
                    type="text"
                    placeholder="e.g. Computer Science and Engineering"
                    value={formData.department}
                    onChange={handleChange}
                    maxLength={100}
                  />

                  <span className="courses-field-hint">
                    Department is optional.
                  </span>
                </div>
              </div>

              <div className="courses-modal-footer">
                <button
                  type="button"
                  className="courses-secondary-button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="courses-primary-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="courses-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingCourse ? "Save Changes" : "Add Course"}
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

export default Courses;
