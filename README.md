# Student Management System

A Student Management System built using **Python, FastAPI, PostgreSQL, SQLAlchemy, and Podman**. The application provides REST APIs to manage students and courses, retrieve course-wise student information, and combine student and course details through relational queries.

## Technology Stack

| Component               | Technology             |
| ----------------------- | ---------------------- |
| Programming Language    | Python 3.12            |
| Backend Framework       | FastAPI                |
| Database                | PostgreSQL 18          |
| ORM                     | SQLAlchemy             |
| Database Driver         | Psycopg 3              |
| Data Validation         | Pydantic               |
| ASGI Server             | Uvicorn                |
| Containerization        | Podman                 |
| Container Orchestration | Podman Compose         |
| API Documentation       | Swagger UI             |
| Version Control         | Git and GitHub         |
| Frontend                | React + Vite (planned) |

## Features

### Student Management

- Create a new student.
- Retrieve all students.
- Retrieve a student by ID.
- Update student information.
- Delete a student.
- Validate student email addresses and prevent duplicate emails.
- Associate students with courses.

### Course Management

- Create a new course.
- Retrieve all courses.
- Retrieve a course by ID.
- Update course information.
- Delete courses while protecting existing student-course relationships.
- Retrieve all students enrolled in a specific course.

### Student-Course Relationships

- Retrieve combined student and course information using SQL JOIN operations.
- Maintain a one-to-many relationship between courses and students.

### Database and Infrastructure

- PostgreSQL relational database with primary keys and foreign-key constraints.
- SQLAlchemy ORM for database operations.
- Environment-based database configuration.
- Persistent PostgreSQL storage using Podman volumes.
- Containerized backend and database services using Podman Compose.

## Project Structure

```text
student-management-system/
│
├── backend/
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── students.py
│   │   ├── courses.py
│   │   └── student_courses.py
│   │
│   ├── .env.example
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   └── requirements.txt
│
├── .gitignore
├── compose.yaml
├── README.md
└── student_management.dump (local database backup; not committed)
```

## Database Design

The application uses two main tables:

**Students**

- student_id (Primary Key)
- first_name
- last_name
- email
- age
- gender
- course_id (Foreign Key)
- enrollment_date

**Courses**

- course_id (Primary Key)
- course_name
- duration
- department

A course can have multiple students, establishing a one-to-many relationship.

## Running the Application with Podman

### Prerequisites

- Podman Desktop
- Podman Compose
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Abhinavreddy-123/student-management-system.git
cd student-management-system
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
DB_PASSWORD=your_postgresql_password
```

Create `backend/.env` using `backend/.env.example` as a template. Configure the database connection for local development:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_management
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
```

Use the same PostgreSQL password in both files.

### 3. Start the application

From the project root, execute:

```bash
podman compose up -d --build
```

This starts:

- PostgreSQL database container (`student-db`)
- FastAPI backend container (`student-api`)

The PostgreSQL database uses a persistent Podman volume.

### 4. Access the application

- API homepage: http://localhost:8000
- Swagger UI documentation: http://localhost:8000/docs
- API health endpoint: http://localhost:8000/health

### 5. Stop the application

```bash
podman compose down
```

To stop the containers without removing them:

```bash
podman compose stop
```

The persistent database volume is retained when using `podman compose down`.

## Running the Backend Locally

For local development without containers:

1. Navigate to the backend directory.
2. Create and activate a Python virtual environment.
3. Install dependencies.

```bash
cd backend
python -m venv .venv
```

Activate on Windows:

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure `backend/.env` to connect to your local PostgreSQL instance, then run:

```bash
uvicorn main:app --reload
```

The API will be available at http://localhost:8000.

## API Overview

| Method | Endpoint                        | Description                                      |
| ------ | ------------------------------- | ------------------------------------------------ |
| GET    | `/students/`                    | Retrieve all students                            |
| GET    | `/students/{student_id}`        | Retrieve a student                               |
| POST   | `/students/`                    | Create a student                                 |
| PUT    | `/students/{student_id}`        | Update a student                                 |
| DELETE | `/students/{student_id}`        | Delete a student                                 |
| GET    | `/courses/`                     | Retrieve all courses                             |
| GET    | `/courses/{course_id}`          | Retrieve a course                                |
| POST   | `/courses/`                     | Create a course                                  |
| PUT    | `/courses/{course_id}`          | Update a course                                  |
| DELETE | `/courses/{course_id}`          | Delete a course                                  |
| GET    | `/courses/{course_id}/students` | Retrieve students enrolled in a course           |
| GET    | `/student-courses`              | Retrieve combined student and course information |

## Development Status

- [x] PostgreSQL database setup
- [x] Database schema and relationships
- [x] FastAPI backend implementation
- [x] Student CRUD APIs
- [x] Course CRUD APIs
- [x] Course-wise student retrieval
- [x] Student-course JOIN API
- [x] Database configuration using environment variables
- [x] Podman containerization
- [x] Podman Compose configuration
- [x] Database migration into PostgreSQL container
- [x] GitHub repository setup
- [ ] Comprehensive API testing
- [ ] React + Vite frontend development
- [ ] Frontend and backend integration

## Repository

GitHub: https://github.com/Abhinavreddy-123/student-management-system
