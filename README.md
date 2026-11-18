# Student Management System

A full-stack Student Management System built with **FastAPI, PostgreSQL, SQLAlchemy, React, and Podman**. The application provides REST APIs and a web interface for managing students, courses, and course enrollments.

## Tech Stack

### Backend

- Python 3.12
- FastAPI
- SQLAlchemy ORM
- PostgreSQL 18
- Pydantic
- Python logging with rotating log files

### Frontend

- React 19
- Vite
- JavaScript
- CSS
- Lucide React icons

### Infrastructure and Testing

- Podman and Podman Compose
- Bruno for API testing
- Git and GitHub

## Features

### Student Management

- View the student list.
- Add new students.
- Search and filter students.
- View student details, including course assignment.

### Course Management

- View available courses.
- Add, edit, and delete courses.
- Search courses.
- View the number of students assigned to each course.

### Enrollment Management

- View student enrollment status.
- Assign students to courses.
- Change a student's assigned course.
- Remove a student's course assignment.
- Filter students by course and enrollment status.

### Dashboard

- View total students, courses, and enrollments.
- View students without course assignments.
- View recent students.
- View course-wise enrollment information.

### Logging and Error Handling

- Python's built-in logging module.
- Real-time application logs in the console.
- Rotating log file using `RotatingFileHandler`.
- HTTP request and response logging.
- Exception logging with traceback information.
- Health-check endpoint for database connectivity.

### Database and Containerization

- PostgreSQL database running in a Podman container.
- FastAPI backend running in a separate container.
- Persistent PostgreSQL named volume.
- Database health check before starting the backend.
- Environment-based database configuration.

## Project Structure

```text
student-management-system/
│
├── backend/
│   ├── routers/
│   │   ├── students.py
│   │   ├── courses.py
│   │   └── student_courses.py
│   ├── logs/
│   │   ├── __init__.py
│   │   └── logging_config.py
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Students.jsx
│   │   │   ├── Courses.jsx
│   │   │   └── Enrollments.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── bruno/
│
├── compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the application:

- Python 3.12
- Node.js and npm
- Podman Desktop
- Git

## Setup and Run

### 1. Clone the repository

```cmd
git clone YOUR_GITHUB_REPOSITORY_URL
cd student-management-system
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the repository's Git URL.

### 2. Configure environment variables

Create the root `.env` file:

```cmd
copy .env.example .env
```

Create the backend `.env` file:

```cmd
copy backend\.env.example backend\.env
```

Open both files and set the same PostgreSQL password in each.

Do not commit either `.env` file.

### 3. Start Podman

```cmd
podman machine start
```

### 4. Build and start the containers

Run this command from the project root:

```cmd
podman compose up -d --build
```

This starts:

| Service    | Container     | Host port |
| ---------- | ------------- | --------: |
| PostgreSQL | `student-db`  |      5433 |
| FastAPI    | `student-api` |      8000 |

Check the containers:

```cmd
podman ps
```

The database health check ensures that PostgreSQL is ready before the backend starts.

### 5. Verify the backend

Open the following URLs:

- API root: http://localhost:8000/
- Swagger API documentation: http://localhost:8000/docs
- Health check: http://localhost:8000/health

### 6. Start the frontend

Open a separate terminal:

```cmd
cd frontend
npm install
npm run dev
```

Open the Vite development URL:

http://localhost:5173/

The Vite development server proxies frontend API requests to the FastAPI backend at `http://localhost:8000`.

Keep the backend containers running while using the frontend.

## API Endpoints

| Method | Endpoint                        | Description                                    |
| ------ | ------------------------------- | ---------------------------------------------- |
| GET    | `/students/`                    | Retrieve all students                          |
| POST   | `/students/`                    | Create a student                               |
| GET    | `/students/{student_id}`        | Retrieve a student                             |
| PUT    | `/students/{student_id}`        | Update a student                               |
| DELETE | `/students/{student_id}`        | Delete a student                               |
| GET    | `/courses/`                     | Retrieve all courses                           |
| POST   | `/courses/`                     | Create a course                                |
| GET    | `/courses/{course_id}`          | Retrieve a course                              |
| PUT    | `/courses/{course_id}`          | Update a course                                |
| DELETE | `/courses/{course_id}`          | Delete a course                                |
| GET    | `/courses/{course_id}/students` | Retrieve students in a course                  |
| GET    | `/student-courses`              | Retrieve student-course enrollment information |
| GET    | `/health`                       | Check application and database health          |

## API Testing with Bruno

Bruno is used to test the backend REST APIs.

The API testing collection is maintained in the `bruno/` directory.

Tests cover:

- Student CRUD operations.
- Course CRUD operations.
- Retrieving students by course.
- Retrieving enrollment information.
- API response status codes and error handling.

Alternatively, the interactive Swagger documentation is available at:

http://localhost:8000/docs

## Application Logging

Application logs are implemented using Python's built-in `logging` module.

The logging configuration includes:

- Console logging for real-time monitoring.
- Rotating file logging.
- Request and response information.
- Error messages and exception tracebacks.
- Database-related failure information.

To monitor backend logs in real time:

```cmd
podman compose logs -f backend
```

The application log file is generated under `backend/logs/` inside the backend container.

## Database Persistence

PostgreSQL data is stored in a named Podman volume.

Stopping or removing the containers does not require deleting the database volume. To stop the application while retaining the containers and database:

```cmd
podman compose stop
```

To start the existing containers again:

```cmd
podman compose start
```

To rebuild and start the application after code or configuration changes:

```cmd
podman compose up -d --build
```

**Important:** Do not use `podman compose down -v` unless you intentionally want to delete the persistent database volume and its data.

## Development Status

- [x] FastAPI backend
- [x] PostgreSQL database integration
- [x] SQLAlchemy ORM models
- [x] Student and course APIs
- [x] Student-course enrollment functionality
- [x] Podman containerization
- [x] Database persistence using a named volume
- [x] Python-based application logging
- [x] API testing with Bruno
- [x] React frontend
- [x] Dashboard
- [x] Student Management interface
- [x] Course Management interface
- [x] Enrollment Management interface

## Repository

GitHub: Add or retain your repository URL here.
