# Installing Supabase JS SDK
cd frontend && npm install @supabase/supabase-js

check it was installed - cat package.json | grep supabase

What is the Supabase JS SDK?

SDK = Software Development Kit. It's a package of pre-written code that makes it easy to talk to Supabase. Why do we need it?

- Our Angular app needs to talk to Supabase for authentication (signup, login, logout)
- Instead of writing all the HTTP requests ourselves, Supabase gives us simple functions like signUp(), signIn(), signOut()
- It also manages the JWT (login token) for us automatically

What will happen when we install it?
- npm (Node Package Manager) will download the @supabase/supabase-js package
- It gets saved in the frontend/node_modules/ folder
- It gets added to frontend/package.json (so others can install it too)

# Create Environment Configuration
What are we doing?

We need to store our Supabase project's URL and API key somewhere safe. Angular has a standard place for this: the environment files.

Why?
- We'll have different settings for development vs production
- We don't want to hardcode secrets in our components
- Angular can swap these files automatically based on build mode

# Setting Up Local Supabase
Initialize Supabase in your project

Yes, run this from the project root (/home/simbamugoz/workspace/projects/TODO):

supabase init

What this does:

- Creates a supabase/ folder in your project
- Adds config files for your local Supabase instance
- Sets up migrations folder (for database changes)

# Start Local Supabase
After supabase init, run:

supabase start

What this does:
- Starts Docker containers (Postgres, Auth server, API server, Studio dashboard)
- Take a few minutes the first time (downloads Docker images)
- Gives you output with important URLs and keys

Look for this in the output:

API URL: http://localhost:54321
anon key: eyJhbGc....(very long string)
service_role key: eyJhbGc....(another long string)
Studio URL: http://localhost:54323

# Save the keys
Once you run supabase start, copy and save:

- The API URL (usually http://localhost:54321)
- The anon key (the public key, safe to use in frontend)

# Create dev environment configuration

Configure Angular Environment Files

What we're doing:
Angular has environment.ts files where we store configuration like API URLs and keys. We'll add your Supabase details there.

What to do:
Create the folder:

mkdir -p frontend/src/environments
touch environments.ts

environment.ts (local development):

export const environment = {
  production: false,
  supabase: {
    url: 'http://localhost:54321',
    anonKey: 'YOUR_PUBLISHABLE_KEY_HERE'  // ← Use the publishable key
  }
};

# Create SupabaseService

What is a Service in Angular?

Service = A class that handles business logic and data operations

- Think of it as a helper that components can use
- Keeps components clean and focused on UI
- Can be reused across multiple components

What will SupabaseService do?
- Initialize the Supabase client (using our environment config)
- Provide methods for signup, login, logout
- Handle the current user session
- Later: provide methods to call our FastAPI backend with JWT

Create the service:

Run this command in your terminal:

cd frontend
ng generate service core/services/supabase

What this does:
- Creates frontend/src/app/core/services/supabase.service.ts
- Creates a test file supabase.service.spec.ts
- Automatically registers the service with Angular

Or if you prefer, you can create the file  and write the code manually.

File to Create:
Path: frontend/src/app/core/services/supabase.service.ts First, create the 

folders if they don't exist:
mkdir -p frontend/src/app/core/services

touch supabase.service.ts

Add code.

# Setting Up Database Schema

What are we doing?

Creating the database structure (tables) that will store our TODO items in Supabase.

Why?

- We need a place to store todos with proper columns (title, description, completed status, etc.)
- We need Row Level Security (RLS) so users can only see their own todos
- Migrations let us track database changes over time (version control for database)

What is a Migration?

Migration = A file containing SQL commands to change your database

- Lives in supabase/migrations/ folder
- Applied in order (001_, 002_, etc.)
- Can be rolled back if needed
- Same changes apply to local dev and production

## Create the Migration File

Create: supabase/migrations/001_create_todos_table.sql

What this migration includes:

1. **todos table** with columns:
   - id (UUID, auto-generated)
   - user_id (links to authenticated user)
   - title, description
   - completed (boolean, default false)
   - priority (low/medium/high)
   - due_date (optional deadline)
   - created_at, updated_at (auto timestamps)

2. **Indexes** for fast queries on user_id and completed status

3. **Row Level Security (RLS) policies**:
   - Users can only SELECT their own todos
   - Users can only INSERT todos for themselves
   - Users can only UPDATE their own todos
   - Users can only DELETE their own todos

4. **Trigger function** to auto-update updated_at timestamp

## Apply the Migration

Run from project root:

```bash
supabase db reset
```

What this does:
- Resets local database
- Applies all migrations in order
- Creates the todos table with RLS policies

## View the Table

1. Open Supabase Studio: http://localhost:54323
2. Click "Table Editor" in sidebar
3. See your todos table

## Fix Security Warning (search_path)

Issue: Functions without fixed search_path are vulnerable to "trojan horse" attacks

Real-life example:
- Your function calls NOW()
- Malicious user creates fake NOW() in another schema
- Your function might call their malicious version instead

Fix: Add SECURITY DEFINER and SET search_path to the function

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- Only look in public and temp schemas
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;
```

Then reapply: supabase db reset
