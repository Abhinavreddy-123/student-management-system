import { useEffect, useState } from "react";

import {
  AlertCircle,
  Bell,
  BookMarked,
  BookOpen,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  Menu,
  RefreshCw,
  Search,
  Users,
  UserX,
} from "lucide-react";

import "./App.css";
import Courses from "./pages/Courses";
import Enrollments from "./pages/Enrollments";
import Students from "./pages/Students";
import { apiRequest } from "./services/api";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch dashboard information
  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const [studentData, courseData, enrollmentData] = await Promise.all([
        apiRequest("/students/"),
        apiRequest("/courses/"),
        apiRequest("/student-courses"),
      ]);

      setStudents(studentData);
      setCourses(courseData);
      setEnrollments(enrollmentData);
    } catch (err) {
      console.error("Dashboard API error:", err);
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Sidebar navigation
  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Students", icon: Users },
    { name: "Courses", icon: BookOpen },
    { name: "Enrollments", icon: GraduationCap },
  ];

  // Calculate statistics
  const unassignedStudents = students.filter(
    (student) => student.course_id === null,
  ).length;

  const courseMap = Object.fromEntries(
    courses.map((course) => [course.course_id, course.course_name]),
  );

  // Latest student records
  const recentStudents = [...students]
    .sort((a, b) => new Date(b.enrollment_date) - new Date(a.enrollment_date))
    .slice(0, 5);

  const statistics = [
    {
      title: "Total Students",
      value: students.length,
      icon: Users,
      color: "blue",
      description: "Registered students",
    },
    {
      title: "Total Courses",
      value: courses.length,
      icon: BookOpen,
      color: "purple",
      description: "Available courses",
    },
    {
      title: "Enrollments",
      value: enrollments.length,
      icon: GraduationCap,
      color: "green",
      description: "Course registrations",
    },
    {
      title: "Unassigned Students",
      value: unassignedStudents,
      icon: UserX,
      color: "orange",
      description: "Students without courses",
    },
  ];

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "" : "sidebar-closed"}`}>
        <div className="brand">
          <div className="brand-icon">
            <GraduationCap size={25} />
          </div>

          <div>
            <h2>EduManage</h2>
            <span>Management Portal</span>
          </div>
        </div>

        <div className="nav-section">
          <p className="nav-heading">MAIN MENU</p>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => setActivePage(item.name)}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <div className="profile-avatar">A</div>

          <div className="profile-info">
            <strong>Administrator</strong>
            <span>System Admin</span>
          </div>

          <ChevronDown size={17} />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={21} />
            </button>

            <div>
              <h1>{activePage}</h1>
              <p>Welcome back! Here's your overview.</p>
            </div>
          </div>

          <div className="topbar-right">
            <button className="icon-button">
              <Search size={20} />
            </button>

            <button className="icon-button">
              <Bell size={20} />
            </button>

            <div className="topbar-profile">A</div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <section className="dashboard-content">
          {/* DASHBOARD PAGE */}
          {activePage === "Dashboard" && (
            <>
              <div className="welcome-section">
                <div>
                  <h2>Welcome to EduManage</h2>
                  <p>
                    Manage your students, courses and enrollments in one place.
                  </p>
                </div>

                <div className="welcome-actions">
                  <span className="system-status">
                    <span className="status-dot"></span>
                    System Online
                  </span>

                  <button
                    className="refresh-button"
                    onClick={fetchDashboardData}
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
                  <span>{error}</span>
                  <button onClick={fetchDashboardData}>Retry</button>
                </div>
              )}

              {loading ? (
                <div className="placeholder-section">
                  <h3>Loading dashboard...</h3>
                  <p>
                    Fetching student, course and enrollment information from the
                    database.
                  </p>
                </div>
              ) : error ? (
                <div className="placeholder-section">
                  <h3>Dashboard data unavailable</h3>
                  <p>Check the backend connection and try again.</p>
                </div>
              ) : (
                <>
                  {/* STATISTICS */}
                  <div className="stats-grid">
                    {statistics.map((stat) => {
                      const Icon = stat.icon;

                      return (
                        <div className="stat-card" key={stat.title}>
                          <div className={`stat-icon ${stat.color}`}>
                            <Icon size={22} />
                          </div>

                          <div className="stat-details">
                            <p>{stat.title}</p>
                            <h3>{stat.value}</h3>
                            <span>{stat.description}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* DASHBOARD TABLES */}
                  <div className="content-grid">
                    {/* RECENT STUDENTS */}
                    <div className="data-card recent-students">
                      <div className="card-header">
                        <div>
                          <h3>Recent Students</h3>
                          <p>Latest student records</p>
                        </div>

                        <button
                          className="view-button"
                          onClick={() => setActivePage("Students")}
                        >
                          View All
                        </button>
                      </div>

                      <div className="table-wrapper">
                        <table>
                          <thead>
                            <tr>
                              <th>Student</th>
                              <th>Email</th>
                              <th>Course</th>
                              <th>Age</th>
                            </tr>
                          </thead>

                          <tbody>
                            {recentStudents.map((student) => (
                              <tr key={student.student_id}>
                                <td>
                                  <div className="student-name">
                                    <span>
                                      {student.first_name} {student.last_name}
                                    </span>
                                  </div>
                                </td>

                                <td>{student.email}</td>

                                <td>
                                  {student.course_id === null
                                    ? "Not assigned"
                                    : courseMap[student.course_id] || "Unknown"}
                                </td>

                                <td>{student.age}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {recentStudents.length === 0 && (
                          <p className="empty-message">
                            No student records found.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* COURSE OVERVIEW */}
                    <div className="data-card course-overview">
                      <div className="card-header">
                        <div>
                          <h3>Course Overview</h3>
                          <p>Available courses</p>
                        </div>

                        <BookMarked size={20} />
                      </div>

                      <div className="course-list">
                        {courses.map((course) => {
                          const count = enrollments.filter(
                            (item) => item.course_id === course.course_id,
                          ).length;

                          return (
                            <div className="course-item" key={course.course_id}>
                              <div>
                                <strong>{course.course_name}</strong>
                                <span>{course.department}</span>
                              </div>

                              <span className="course-count">
                                {count} enrolled
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* STUDENTS PAGE */}
          {activePage === "Students" && <Students />}

          {/* COURSES PLACEHOLDER */}
          {activePage === "Courses" && <Courses />}

          {/* ENROLLMENTS PLACEHOLDER */}
          {activePage === "Enrollments" && <Enrollments />}
        </section>
      </main>
    </div>
  );
}

export default App;
