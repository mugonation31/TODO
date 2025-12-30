"""
Database operations using async PostgreSQL
"""
import asyncpg
from typing import List, Optional, Dict, Any
from config import settings
from models import TodoCreate, TodoUpdate
from datetime import datetime


# Global connection pool
pool: Optional[asyncpg.Pool] = None


async def get_pool() -> asyncpg.Pool:
    """Get or create database connection pool"""
    global pool
    if pool is None:
        pool = await asyncpg.create_pool(settings.database_url)
    return pool


async def close_pool():
    """Close database connection pool"""
    global pool
    if pool:
        await pool.close()
        pool = None


async def get_todos(user_id: str) -> List[Dict[str, Any]]:
    """
    Get all non-deleted todos for a user

    Args:
        user_id: User ID

    Returns:
        List of todos
    """
    pool = await get_pool()
    query = """
        SELECT id::text, user_id::text, title, description, completed, pinned,
               priority, due_date, created_at, updated_at, deleted_at
        FROM todos
        WHERE user_id = $1 AND deleted_at IS NULL
        ORDER BY pinned DESC, created_at DESC
    """
    rows = await pool.fetch(query, user_id)
    return [dict(row) for row in rows]


async def create_todo(user_id: str, todo: TodoCreate) -> Dict[str, Any]:
    """
    Create a new todo

    Args:
        user_id: User ID
        todo: Todo data

    Returns:
        Created todo
    """
    pool = await get_pool()
    query = """
        INSERT INTO todos (user_id, title, description, priority, due_date, completed, pinned)
        VALUES ($1, $2, $3, $4, $5, false, false)
        RETURNING id::text, user_id::text, title, description, completed, pinned,
                  priority, due_date, created_at, updated_at, deleted_at
    """
    row = await pool.fetchrow(
        query,
        user_id,
        todo.title,
        todo.description,
        todo.priority.value if todo.priority else 'medium',
        todo.due_date
    )
    return dict(row)


async def update_todo(todo_id: str, user_id: str, updates: TodoUpdate) -> Optional[Dict[str, Any]]:
    """
    Update a todo

    Args:
        todo_id: Todo ID
        user_id: User ID (for authorization)
        updates: Fields to update

    Returns:
        Updated todo or None if not found
    """
    pool = await get_pool()

    # Build dynamic update query
    update_fields = []
    values = []
    param_count = 1

    for field, value in updates.model_dump(exclude_unset=True).items():
        if value is not None:
            update_fields.append(f"{field} = ${param_count}")
            # Convert Priority enum to string
            if field == 'priority' and hasattr(value, 'value'):
                values.append(value.value)
            else:
                values.append(value)
            param_count += 1

    if not update_fields:
        # No fields to update, just return current state
        return await get_todo_by_id(todo_id, user_id)

    # Add user_id and todo_id to values
    values.extend([user_id, todo_id])

    query = f"""
        UPDATE todos
        SET {', '.join(update_fields)}, updated_at = NOW()
        WHERE user_id = ${param_count} AND id = ${param_count + 1} AND deleted_at IS NULL
        RETURNING id::text, user_id::text, title, description, completed, pinned,
                  priority, due_date, created_at, updated_at, deleted_at
    """

    row = await pool.fetchrow(query, *values)
    return dict(row) if row else None


async def soft_delete_todo(todo_id: str, user_id: str) -> bool:
    """
    Soft delete a todo (set deleted_at timestamp)

    Args:
        todo_id: Todo ID
        user_id: User ID (for authorization)

    Returns:
        True if deleted, False if not found
    """
    pool = await get_pool()
    query = """
        UPDATE todos
        SET deleted_at = NOW()
        WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
        RETURNING id
    """
    row = await pool.fetchrow(query, todo_id, user_id)
    return row is not None


async def get_todo_by_id(todo_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a single todo by ID

    Args:
        todo_id: Todo ID
        user_id: User ID (for authorization)

    Returns:
        Todo or None if not found
    """
    pool = await get_pool()
    query = """
        SELECT id::text, user_id::text, title, description, completed, pinned,
               priority, due_date, created_at, updated_at, deleted_at
        FROM todos
        WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    """
    row = await pool.fetchrow(query, todo_id, user_id)
    return dict(row) if row else None


async def get_deleted_todos(user_id: str) -> List[Dict[str, Any]]:
    """
    Get all soft-deleted todos (trash)

    Args:
        user_id: User ID

    Returns:
        List of deleted todos
    """
    pool = await get_pool()
    query = """
        SELECT id::text, user_id::text, title, description, completed, pinned,
               priority, due_date, created_at, updated_at, deleted_at
        FROM todos
        WHERE user_id = $1 AND deleted_at IS NOT NULL
        ORDER BY deleted_at DESC
    """
    rows = await pool.fetch(query, user_id)
    return [dict(row) for row in rows]


async def restore_todo(todo_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """
    Restore a soft-deleted todo

    Args:
        todo_id: Todo ID
        user_id: User ID (for authorization)

    Returns:
        Restored todo or None if not found
    """
    pool = await get_pool()
    query = """
        UPDATE todos
        SET deleted_at = NULL
        WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL
        RETURNING id::text, user_id::text, title, description, completed, pinned,
                  priority, due_date, created_at, updated_at, deleted_at
    """
    row = await pool.fetchrow(query, todo_id, user_id)
    return dict(row) if row else None


async def permanent_delete_todo(todo_id: str, user_id: str) -> bool:
    """
    Permanently delete a todo from database

    Args:
        todo_id: Todo ID
        user_id: User ID (for authorization)

    Returns:
        True if deleted, False if not found
    """
    pool = await get_pool()
    query = """
        DELETE FROM todos
        WHERE id = $1 AND user_id = $2
        RETURNING id
    """
    row = await pool.fetchrow(query, todo_id, user_id)
    return row is not None
