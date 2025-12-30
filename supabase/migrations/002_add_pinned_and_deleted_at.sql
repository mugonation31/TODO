-- Add pinned column for pinning important todos
ALTER TABLE todos
ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;

-- Add deleted_at column for soft deletes
ALTER TABLE todos
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create index on pinned for filtering pinned todos
CREATE INDEX IF NOT EXISTS idx_todos_pinned ON todos(pinned);

-- Create index on deleted_at for filtering active/deleted todos
CREATE INDEX IF NOT EXISTS idx_todos_deleted_at ON todos(deleted_at);

-- RLS policies remain unchanged - users can see ALL their todos
-- (both active and deleted). Filtering happens in the application layer.
-- This allows for trash/restore features.
