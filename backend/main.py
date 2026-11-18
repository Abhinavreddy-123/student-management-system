
import time

from database import engine
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from logs.logging_config import logger
from routers import courses, student_courses, students
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

# Initialize FastAPI application
app = FastAPI(
    title="Student Management System API",
    description="REST APIs for managing students and courses",
    version="1.0.0"
)

# Register routers
app.include_router(students.router)
app.include_router(courses.router)
app.include_router(student_courses.router)


# Log every incoming API request and its response
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.perf_counter()

    logger.info(
        "Incoming request: %s %s",
        request.method,
        request.url.path
    )

    response = await call_next(request)

    duration = (time.perf_counter() - start_time) * 1000

    log_method = (
        logger.error if response.status_code >= 500
        else logger.warning if response.status_code >= 400
        else logger.info
    )

    log_method(
        "Request completed: %s %s | Status: %s | Time: %.2f ms",
        request.method,
        request.url.path,
        response.status_code,
        duration
    )

    return response


# Handle unexpected application exceptions
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        "Application error: %s %s",
        request.method,
        request.url.path,
        exc_info=(type(exc), exc, exc.__traceback__)
    )

    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"}
    )


# Root endpoint
@app.get("/")
def home():
    logger.info("Home endpoint accessed")

    return {
        "message": "Welcome to Student Management System API"
    }


# Database health-check endpoint
@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        logger.info("Database health check successful")

        return {
            "status": "healthy",
            "database": "connected"
        }

    except SQLAlchemyError:
        logger.exception("Database health check failed")

        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": "disconnected"
            }
        )
