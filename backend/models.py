"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class Priority(str, Enum):
    """Todo priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TodoCreate(BaseModel):
    """Schema for creating a new todo"""
    title: str = Field(..., min_length=1, max_length=500, description="Todo title")
    description: Optional[str] = Field(None, max_length=2000, description="Todo description")
    priority: Optional[Priority] = Field(Priority.MEDIUM, description="Todo priority")
    due_date: Optional[datetime] = Field(None, description="Due date")


class TodoUpdate(BaseModel):
    """Schema for updating a todo"""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=2000)
    completed: Optional[bool] = None
    pinned: Optional[bool] = None
    priority: Optional[Priority] = None
    due_date: Optional[datetime] = None


class TodoResponse(BaseModel):
    """Schema for todo response"""
    id: str
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    pinned: bool
    priority: Optional[Priority]
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]

    class Config:
        from_attributes = True  # Allows creation from ORM models


class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
