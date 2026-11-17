
import models
import schemas
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

# Create student router
router = APIRouter(
    prefix="/students",
    tags=["Students"]
)


# 1. GET - Retrieve all students
@router.get("/", response_model=list[schemas.StudentResponse])
def get_students(db: Session = Depends(get_db)):

    students = db.query(models.Student).order_by(
        models.Student.student_id
    ).all()

    return students


# 2. GET - Retrieve a student by ID
@router.get("/{student_id}", response_model=schemas.StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):

    student = db.query(models.Student).filter(
        models.Student.student_id == student_id
    ).first()

    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    return student


# 3. POST - Create a new student
@router.post(
    "/",
    response_model=schemas.StudentResponse,
    status_code=status.HTTP_201_CREATED
)
def create_student(
    student: schemas.StudentCreate,
    db: Session = Depends(get_db)
):

    # Check whether email already exists
    existing_student = db.query(models.Student).filter(
        models.Student.email == student.email
    ).first()

    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A student with this email already exists"
        )

    # Check whether the selected course exists
    if student.course_id is not None:
        course = db.query(models.Course).filter(
            models.Course.course_id == student.course_id
        ).first()

        if course is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )

    # Create SQLAlchemy student object
    new_student = models.Student(**student.model_dump())

    try:
        db.add(new_student)
        db.commit()
        db.refresh(new_student)

        return new_student

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not create student due to a database constraint"
        )


# 4. PUT - Update an existing student
@router.put("/{student_id}", response_model=schemas.StudentResponse)
def update_student(
    student_id: int,
    student_data: schemas.StudentUpdate,
    db: Session = Depends(get_db)
):

    # Find the existing student
    student = db.query(models.Student).filter(
        models.Student.student_id == student_id
    ).first()

    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    # Check whether the new email belongs to another student
    existing_student = db.query(models.Student).filter(
        models.Student.email == student_data.email,
        models.Student.student_id != student_id
    ).first()

    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Another student is already using this email"
        )

    # Check whether the selected course exists
    if student_data.course_id is not None:
        course = db.query(models.Course).filter(
            models.Course.course_id == student_data.course_id
        ).first()

        if course is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )

    # Update student fields
    updated_data = student_data.model_dump()

    for field, value in updated_data.items():
        setattr(student, field, value)

    try:
        db.commit()
        db.refresh(student)

        return student

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not update student due to a database constraint"
        )


# 5. DELETE - Delete a student
@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):

    student = db.query(models.Student).filter(
        models.Student.student_id == student_id
    ).first()

    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    db.delete(student)
    db.commit()

    return {
        "message": "Student deleted successfully",
        "student_id": student_id
    }
