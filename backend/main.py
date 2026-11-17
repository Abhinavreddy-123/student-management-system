
from database import engine
from fastapi import FastAPI
from routers import courses, student_courses, students
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

# Initialize FastAPI application
app = FastAPI(
    title="Student Management System API",
    description="REST APIs for managing students and courses",
    version="1.0.0"
)
app.include_router(students.router)
app.include_router(courses.router)
app.include_router(student_courses.router)
# Root endpoint
@app.get("/")
def home():
    return {
        "message": "Welcome to Student Management System API"
    }


# Database health-check endpoint
@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except SQLAlchemyError:
        return {
            "status": "unhealthy",
            "database": "disconnected"
        }
