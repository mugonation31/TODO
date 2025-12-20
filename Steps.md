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