# TODO App - Step-by-Step Implementation Guide

**Stack:** Angular + FastAPI + Supabase (Postgres) + Docker

**Architecture:**
```
Angular (Docker) → Supabase Auth → JWT → FastAPI (Docker) → Supabase Postgres
```

---

## Phase 1: Frontend (Angular)

### 1.1 Initial Setup
- [x] Create Angular project
- [x] Verify Angular runs at http://localhost:4200
- [x] Install Supabase JS SDK
- [x] Create environment configuration files

### 1.2 Supabase Integration
- [x] Create Supabase project (get URL and anon key)
- [x] Configure Supabase client in Angular
- [x] Create `SupabaseService` for auth and API calls

### 1.3 Authentication Components
- [x] Create `LoginComponent`
- [x] Create `RegisterComponent`
- [x] Create `AuthService` (wraps SupabaseService auth methods)
- [x] Add auth state management

### 1.4 Todo Components
- [x] Create `TodoListComponent` (display all todos)
- [x] Create `TodoItemComponent` (single todo with edit/delete/pin/complete)
- [x] Create `TodoFormComponent` (create/edit todos)
- [x] Create `TodoService` (calls FastAPI backend with JWT)
- [x] Add Todo models (Todo, CreateTodoRequest, UpdateTodoRequest)
- [x] Implement trash/restore functionality in TodoService
- [x] Create `TrashComponent` (view and manage deleted todos)

### 1.5 Routing & Guards
- [x] Set up routes (/, /login, /register, /todos, /trash)
- [x] Create `AuthGuard` (protect /todos and /trash routes)
- [x] Add navigation component with login/logout

### 1.6 UI Polish
- [x] Add loading states
- [x] Add error handling and user feedback
- [x] Style components (modern gradient design)
- [x] Add filters (show completed, show pinned only)

---

## Phase 2: Database (Supabase)

### 2.1 Supabase Project Setup
- [x] Create new Supabase project at https://supabase.com
- [x] Note down Project URL and anon/public API key
- [x] Note down Database password (for direct DB access if needed)

### 2.2 Create Users Table
- [x] Open SQL Editor in Supabase Dashboard
- [x] Run SQL to create `public.users` table
- [x] Set up Row Level Security (RLS) policies for users
- [x] Test: verify table appears in Table Editor

### 2.3 Create Todos Table
- [x] Run SQL to create `public.todos` table
- [x] Add indexes for performance (user_id)
- [x] Create trigger for auto-updating `updated_at`
- [x] Set up Row Level Security (RLS) policies for todos
- [x] Add `pinned` column for pinning important todos
- [x] Add `deleted_at` column for soft deletes
- [x] Add indexes for pinned and deleted_at columns

### 2.4 Auto-Profile Creation
- [x] Create trigger function to auto-create profile on signup
- [x] Attach trigger to `auth.users` table
- [x] Test: sign up a user and verify profile row is created

### 2.5 Database Testing
- [x] Test insert/select/update/delete via SQL editor
- [x] Verify RLS policies work (try accessing other user's data)
- [x] Check soft delete behavior (deleted_at)

---

## Phase 3: Backend (FastAPI)

### 3.1 Initial Setup
- [x] Create backend directory
- [x] Create Python virtual environment
- [x] Install FastAPI and Uvicorn
- [x] Create basic main.py with health check
- [x] Create requirements.txt with all dependencies
- [x] Create .env file for secrets

### 3.2 Dependencies & Configuration
- [x] Install: `python-jose` (JWT), `python-dotenv`, `httpx`, `asyncpg`
- [x] Create `config.py` (load env vars: Supabase URL, JWT secret, DB URL)
- [x] Create database connection pool (async)

### 3.3 JWT Verification
- [x] Create `auth.py` with JWT verification function
- [x] Create dependency `get_current_user` (extracts user_id from JWT)
- [x] Add CORS middleware (allow Angular origin)

### 3.4 Database Models & Queries
- [x] Create `models.py` (Pydantic models for Todo, User)
- [x] Create `database.py` (async Postgres query functions)
- [x] Add CRUD functions: create_todo, get_todos, update_todo, soft_delete_todo
- [x] Fix UUID to string serialization (::text casting in SQL queries)

### 3.5 API Endpoints
- [x] `GET /api/todos` - list user's todos (exclude deleted)
- [x] `POST /api/todos` - create new todo
- [x] `PATCH /api/todos/{id}` - update todo (title, description, completed, pinned)
- [x] `DELETE /api/todos/{id}` - soft delete todo (set deleted_at)
- [x] `GET /api/trash` - get deleted todos
- [x] `POST /api/todos/{id}/restore` - restore deleted todo
- [x] `DELETE /api/todos/{id}/permanent` - permanently delete todo

### 3.6 Testing Backend
- [x] Test endpoints with curl/Postman using real Supabase JWT
- [x] Verify user isolation (can't see other users' todos)
- [x] Test error cases (invalid JWT, missing fields, etc.)
- [x] End-to-end integration test (Angular → FastAPI → Postgres)

---

## Phase 4: Docker

### 4.1 Angular Dockerfile
- [ ] Create `frontend/Dockerfile`
- [ ] Multi-stage build (build Angular, serve with nginx)
- [ ] Create `frontend/.dockerignore`
- [ ] Test: build and run Angular container locally

### 4.2 FastAPI Dockerfile
- [ ] Create `backend/Dockerfile`
- [ ] Install dependencies from requirements.txt
- [ ] Use uvicorn to run FastAPI
- [ ] Create `backend/.dockerignore`
- [ ] Test: build and run FastAPI container locally

### 4.3 Docker Compose
- [ ] Create `docker-compose.yml` at project root
- [ ] Define `frontend` service (port 4200 → 80)
- [ ] Define `backend` service (port 8000)
- [ ] Add environment variables (Supabase URL, JWT secret, etc.)
- [ ] Add health checks for both services

### 4.4 Environment Variables
- [ ] Create `.env.example` with template
- [ ] Document all required env vars
- [ ] Add `.env` to `.gitignore` (already done)
- [ ] Configure Angular build to use env vars

### 4.5 Docker Testing
- [ ] Run `docker-compose up --build`
- [ ] Verify frontend accessible at http://localhost:4200
- [ ] Verify backend accessible at http://localhost:8000
- [ ] Test full flow: signup → login → create todo → list todos

---

## Phase 5: Integration & Final Testing

### 5.1 End-to-End Testing
- [x] Test: Sign up new user
- [x] Test: Login with email/password
- [x] Test: Create multiple todos
- [x] Test: Edit todo title and description
- [x] Test: Mark todo as completed
- [x] Test: Pin todo to top
- [x] Test: Soft delete todo
- [ ] Test: Logout and login again (data persists)

### 5.2 Edge Cases
- [ ] Test: Try accessing todos without login (should redirect)
- [ ] Test: Invalid JWT (should return 401)
- [ ] Test: Create todo with empty title (should fail validation)
- [ ] Test: Multiple users (can't see each other's todos)

### 5.3 Production Readiness
- [ ] Add logging (frontend: console, backend: structured logs)
- [ ] Add rate limiting on backend (optional)
- [ ] Use production Supabase project (not free tier test project)
- [ ] Set up proper CORS (restrict to your domain)
- [ ] Use HTTPS in production
- [ ] Set secure JWT expiration times

### 5.4 Documentation
- [ ] Update README.md with setup instructions
- [ ] Document environment variables
- [ ] Add API documentation (FastAPI auto-generates this)
- [ ] Add deployment notes

---

## Current Status

**What's Done:**
- ✅ Angular frontend created and running
- ✅ FastAPI backend created with JWT auth and async CRUD endpoints
- ✅ Virtual environment set up
- ✅ Git repository initialized
- ✅ .gitignore configured
- ✅ Supabase SDK installed and configured
- ✅ Authentication components (Login/Signup) created with modern UI
- ✅ Database tables created with RLS policies
- ✅ Todo models created with all fields (priority, due_date, pinned, deleted_at)
- ✅ TodoService implemented with full CRUD and trash/restore features
- ✅ Database schema updated with pinned and deleted_at columns
- ✅ TodoListComponent with modern UI, filters, and CRUD actions
- ✅ TodoFormComponent with reactive forms and validation
- ✅ AuthGuard protecting /todos route
- ✅ Navigation component with user greeting and logout
- ✅ HttpClient provider configured
- ✅ Loading states, error handling, and responsive design
- ✅ Backend UUID to string serialization fix
- ✅ CORS configuration
- ✅ End-to-end integration tested and working
- ✅ Modern purple gradient UI design throughout
- ✅ TodoItemComponent created with reusable design for normal and trash modes
- ✅ TrashComponent implemented with restore and permanent delete functionality

**Next Step:**
📍 **Docker Configuration (Phase 4):** Containerize the application for deployment

---

## Quick Commands Reference

### Development
```bash
# Frontend (Angular)
cd frontend
npm start                    # runs on http://localhost:4200

# Backend (FastAPI)
cd backend
source venv/bin/activate
uvicorn main:app --reload    # runs on http://localhost:8000
```

### Docker
```bash
# Build and run everything
docker-compose up --build

# Run in background
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f
```

### Git
```bash
# Check status
git status

# Commit progress
git add .
git commit -m "Completed Phase X.Y"
```

---

## Notes

- **Supabase runs externally** (cloud-hosted or local), not in Docker
- **Start with frontend**, work down to Docker
- **Test each phase** before moving to the next
- **Commit often** to track progress
- Use this guide as a living document - check off tasks as you complete them!
