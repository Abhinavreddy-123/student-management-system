
# Student Management System

A Student Management System built using FastAPI, PostgreSQL, and SQLAlchemy. The application provides REST APIs to manage students, courses, and their relationships.

## Technologies Used

### Backend
- Python 3.12
- FastAPI
- SQLAlchemy ORM
- PostgreSQL 18
- Psycopg 3
- Pydantic
- Uvicorn

### Frontend
- React
- Vite

### Tools
- Visual Studio Code
- Git and GitHub
- Podman Desktop
- Podman Compose

## Project Structure

```text
student-management-system/
├── backend/
│   ├── routers/
│   ├── .env.example
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── main.py
│   └── requirements.txt
├── frontend/
├── .gitignore
└── README.md
```

## Backend Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd student-management-system
```

### 2. Create and activate a virtual environment

```bash
cd backend
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file inside the `backend` directory using `.env.example` as a template.

Update the database credentials to match your local PostgreSQL configuration.

### 5. Run the application

```bash
uvicorn main:app --reload
```

### 6. Access the API documentation

Open the following URL in your browser:

http://127.0.0.1:8000/docs

## Features

- Student CRUD operations
- Course CRUD operations
- Retrieve students enrolled in a specific course
- Retrieve student and course information using SQL JOIN

## Project Status

Backend API implementation is in progress. Testing, containerization, and frontend development are planned next.
