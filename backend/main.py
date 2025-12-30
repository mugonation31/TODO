"""
FastAPI backend for TODO app with Supabase authentication
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from contextlib import asynccontextmanager

# Local imports
from config import settings
from auth import get_current_user
from models import TodoCreate, TodoUpdate, TodoResponse, MessageResponse
import database as db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    # Startup: Initialize database pool
    await db.get_pool()
    yield
    # Shutdown: Close database pool
    await db.close_pool()


# Create FastAPI app
app = FastAPI(
    title="TODO API",
    description="Backend API for TODO app with Supabase authentication",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoints
@app.get("/")
def root():
    return {"message": "TODO API is running", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "OK"}


# Todo endpoints
@app.get("/api/todos", response_model=List[TodoResponse])
async def get_todos(user_id: str = Depends(get_current_user)):
    """Get all active todos for the current user"""
    todos = await db.get_todos(user_id)
    return todos


@app.post("/api/todos", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo: TodoCreate,
    user_id: str = Depends(get_current_user)
):
    """Create a new todo"""
    created_todo = await db.create_todo(user_id, todo)
    return created_todo


# Trash endpoint (must come BEFORE /api/todos/{todo_id} to avoid route collision)
@app.get("/api/todos/trash", response_model=List[TodoResponse])
async def get_trash(user_id: str = Depends(get_current_user)):
    """Get all soft-deleted todos (trash)"""
    todos = await db.get_deleted_todos(user_id)
    return todos


@app.get("/api/todos/{todo_id}", response_model=TodoResponse)
async def get_todo(
    todo_id: str,
    user_id: str = Depends(get_current_user)
):
    """Get a specific todo by ID"""
    todo = await db.get_todo_by_id(todo_id, user_id)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    return todo


@app.patch("/api/todos/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: str,
    updates: TodoUpdate,
    user_id: str = Depends(get_current_user)
):
    """Update a todo"""
    updated_todo = await db.update_todo(todo_id, user_id, updates)
    if not updated_todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    return updated_todo


@app.delete("/api/todos/{todo_id}", response_model=MessageResponse)
async def delete_todo(
    todo_id: str,
    user_id: str = Depends(get_current_user)
):
    """Soft delete a todo"""
    success = await db.soft_delete_todo(todo_id, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    return {"message": "Todo deleted successfully"}


# Restore and permanent delete endpoints
@app.post("/api/todos/{todo_id}/restore", response_model=TodoResponse)
async def restore_todo(
    todo_id: str,
    user_id: str = Depends(get_current_user)
):
    """Restore a soft-deleted todo from trash"""
    restored_todo = await db.restore_todo(todo_id, user_id)
    if not restored_todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found in trash"
        )
    return restored_todo


@app.delete("/api/todos/{todo_id}/permanent", response_model=MessageResponse)
async def permanent_delete_todo(
    todo_id: str,
    user_id: str = Depends(get_current_user)
):
    """Permanently delete a todo from database"""
    success = await db.permanent_delete_todo(todo_id, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    return {"message": "Todo permanently deleted"}
