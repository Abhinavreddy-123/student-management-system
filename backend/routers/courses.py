
import models
import schemas
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

# Create course router
router = APIRouter(
    prefix="/courses",
    tags=["Courses"]
)


# 1. GET - Retrieve all courses
@router.get("/", response_model=list[schemas.CourseResponse])
def get_courses(db: Session = Depends(get_db)):

    courses = db.query(models.Course).order_by(
        models.Course.course_id
    ).all()

    return courses


# 2. GET - Retrieve a course by ID
@router.get("/{course_id}", response_model=schemas.CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):

    course = db.query(models.Course).filter(
        models.Course.course_id == course_id
    ).first()

    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    return course


# 3. POST - Create a new course
@router.post(
    "/",
    response_model=schemas.CourseResponse,
    status_code=status.HTTP_201_CREATED
)
def create_course(
    course: schemas.CourseCreate,
    db: Session = Depends(get_db)
):

    new_course = models.Course(**course.model_dump())

    db.add(new_course)

    try:
        db.commit()
        db.refresh(new_course)

        return new_course

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not create course due to a database constraint"
        )


# 4. PUT - Update an existing course
@router.put("/{course_id}", response_model=schemas.CourseResponse)
def update_course(
    course_id: int,
    course_data: schemas.CourseCreate,
    db: Session = Depends(get_db)
):

    course = db.query(models.Course).filter(
        models.Course.course_id == course_id
    ).first()

    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    updated_data = course_data.model_dump()

    for field, value in updated_data.items():
        setattr(course, field, value)

    try:
        db.commit()
        db.refresh(course)

        return course

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not update course due to a database constraint"
        )


# 5. DELETE - Delete a course
@router.delete("/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):

    course = db.query(models.Course).filter(
        models.Course.course_id == course_id
    ).first()

    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    db.delete(course)

    try:
        db.commit()

        return {
            "message": "Course deleted successfully",
            "course_id": course_id
        }

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete this course because students are enrolled in it"
        )

# 6. GET - Retrieve all students enrolled in a specific course
@router.get(
    "/{course_id}/students",
    response_model=list[schemas.StudentResponse]
)
def get_students_by_course(
    course_id: int,
    db: Session = Depends(get_db)
):

    # First, check whether the course exists
    course = db.query(models.Course).filter(
        models.Course.course_id == course_id
    ).first()

    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Retrieve all students enrolled in this course
    students = db.query(models.Student).filter(
        models.Student.course_id == course_id
    ).order_by(
        models.Student.student_id
    ).all()

    return students