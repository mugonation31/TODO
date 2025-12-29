-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT false,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);

-- Create index on completed status for filtering
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);

-- Enable Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own todos
CREATE POLICY "Users can view their own todos"
    ON todos
    FOR SELECT
    USING ((select auth.uid()) = user_id);

-- RLS Policy: Users can insert their own todos
CREATE POLICY "Users can insert their own todos"
    ON todos
    FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

-- RLS Policy: Users can update their own todos
CREATE POLICY "Users can update their own todos"
    ON todos
    FOR UPDATE
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- RLS Policy: Users can delete their own todos
CREATE POLICY "Users can delete their own todos"
    ON todos
    FOR DELETE
    USING ((select auth.uid()) = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
