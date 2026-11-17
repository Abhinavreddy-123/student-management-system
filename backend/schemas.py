
from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

# -------------------------
# Course Schemas
# -------------------------

class CourseBase(BaseModel):
    course_name: str = Field(..., min_length=2, max_length=100)
    duration: str = Field(..., min_length=1, max_length=50)
    department: Optional[str] = Field(default=None, max_length=100)


class CourseCreate(CourseBase):
    pass


class CourseResponse(CourseBase):
    course_id: int

    model_config = ConfigDict(from_attributes=True)


# -------------------------
# Student Schemas
# -------------------------

class StudentBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    age: Optional[int] = Field(default=None, ge=16)
    gender: Optional[str] = Field(default=None, max_length=20)
    course_id: Optional[int] = None


class StudentCreate(StudentBase):
    pass


class StudentUpdate(StudentBase):
    pass


class StudentResponse(StudentBase):
    student_id: int
    enrollment_date: Optional[date] = None

    model_config = ConfigDict(from_attributes=True)


# -------------------------
# Student-Course JOIN Schema
# -------------------------

class StudentCourseResponse(BaseModel):
    student_id: int
    first_name: str
    last_name: str
    email: EmailStr
    age: Optional[int] = None
    gender: Optional[str] = None
    course_id: Optional[int] = None
    enrollment_date: Optional[date] = None

    course_name: str
    duration: str
    department: Optional[str] = None

