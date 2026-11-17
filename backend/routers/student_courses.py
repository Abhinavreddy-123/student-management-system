
import models
import schemas
from database import get_db
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# Create student-course router
router = APIRouter(
    tags=["Student-Course Relationships"]
)


# GET - Retrieve students along with their course details
@router.get(
    "/student-courses",
    response_model=list[schemas.StudentCourseResponse]
)
def get_student_courses(db: Session = Depends(get_db)):

    # Perform INNER JOIN between students and courses
    results = db.query(
        models.Student.student_id,
        models.Student.first_name,
        models.Student.last_name,
        models.Student.email,
        models.Student.age,
        models.Student.gender,
        models.Student.course_id,
        models.Student.enrollment_date,
        models.Course.course_name,
        models.Course.duration,
        models.Course.department
    ).join(
        models.Course,
        models.Student.course_id == models.Course.course_id
    ).order_by(
        models.Student.student_id
    ).all()

    return [dict(row._mapping) for row in results]
