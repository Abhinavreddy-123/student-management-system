
from database import Base
from sqlalchemy import Column, Date, ForeignKey, Integer, String, text
from sqlalchemy.orm import relationship


# Course model
class Course(Base):
    __tablename__ = "courses"

    course_id = Column(Integer, primary_key=True, index=True)
    course_name = Column(String(100), nullable=False)
    duration = Column(String(50), nullable=False)
    department = Column(String(100))

    # One course can have multiple students
    students = relationship("Student", back_populates="course")


# Student model
class Student(Base):
    __tablename__ = "students"

    student_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    age = Column(Integer)
    gender = Column(String(20))
    course_id = Column(Integer, ForeignKey("courses.course_id"))
    enrollment_date = Column(Date, server_default=text("CURRENT_DATE"))

    # Each student belongs to one course
    course = relationship("Course", back_populates="students")
