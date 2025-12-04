# 🧞 PlanGenie - AI-Powered Planning Assistant

Transform your vague goals into actionable, trackable plans with the power of AI. PlanGenie is your intelligent planning copilot that breaks down complex objectives into clear, manageable tasks.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Python](https://img.shields.io/badge/Python-3.9+-green)
![FastAPI](https://img.shields.io/badge/FastAPI-latest-009688)

## ✨ Features

### 🤖 AI-Powered Planning
- **Intelligent Plan Generation**: Describe your goal in plain English, get a comprehensive action plan with 7-12 specific tasks
- **Smart Task Breakdown**: AI analyzes your goal and creates actionable steps, not vague "research" tasks
- **Resource Recommendations**: Get curated links to documentation, tutorials, and tools

### ✅ Task Management
- **Interactive Task Lists**: Check off completed tasks with visual progress indicators
- **Inline Editing**: Click any task to edit title or description instantly
- **Drag & Drop Reordering**: Reorganize tasks to match your workflow
- **Status Tracking**: Pending, In Progress, and Completed states
- **Progress Bars**: Visual representation of plan completion

### 💬 AI Chat Assistant
- **Conversational Planning**: Refine your plans through natural conversation
- **Contextual Understanding**: AI remembers your plan details and previous messages
- **Plan Adjustments**: Ask AI to add tasks, modify timeline, or suggest improvements

### 📎 File Management
- **Task Attachments**: Upload proof of completion (images, PDFs, Word docs)
- **Multiple Files per Task**: Attach as many files as needed
- **Preview & Download**: Click to view or download attachments
- **10MB File Size Limit**: Sufficient for screenshots, certificates, and documents

### 🎯 Dashboard & Analytics
- **Plans Overview**: View all your plans with status filters (Active, Completed, Archived)
- **Progress Statistics**: Track completion rates across all plans
- **Visual Stats**: Beautiful cards showing active plans, completed plans, and overall progress

### 👤 User Profile
- **Achievement Tracking**: See total plans, active plans, and completion rates
- **Task Statistics**: View completed vs total tasks with visual progress bars
- **Account Information**: Manage your profile and view account details

### ⚙️ Settings & Preferences
- **Notification Controls**: Toggle email notifications, task reminders, and weekly digests
- **Appearance Options**: Dark mode support (coming soon)
- **Account Management**: Logout or delete account options

### 🔔 Notification & Smart Alert System
- **Smart Dashboard Alerts**: Proactive suggestions displayed on your dashboard
  - **Quick Wins**: Tasks under 1 hour with high priority
  - **Overdue Alerts**: Tasks past their due date
  - **High Priority**: Important tasks due soon
  - Auto-refresh every 5 minutes
  - One-click dismiss or action buttons
- **Email Notifications**: Stay informed with automated emails (powered by Resend)
  - Task reminders (configurable hours before due date)
  - Overdue task notifications
  - Weekly progress digests (configurable day of week)
  - Beautiful HTML templates with one-click actions
- **User Preferences**: Full control over notification settings
  - Toggle email notifications on/off
  - Configure reminder timing (24 hours before by default)
  - Set weekly digest day (Sunday by default)
  - Persistent settings across sessions

### 🔒 Authentication & Security
- **Email/Password Authentication**: Traditional sign-up and login
- **Google OAuth**: One-click sign-in with Google
- **Secure Sessions**: JWT-based authentication with Supabase
- **Row Level Security**: Database policies ensure users only see their own data

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router with TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form with validation
- **Drag & Drop**: @dnd-kit for task reordering
- **Notifications**: Sonner for toast messages
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **AI Integration**: OpenAI GPT-4o-mini for plan generation
- **Email Service**: Resend for transactional emails
- **Notifications**: APScheduler for background jobs (daily reminders, weekly digests)
- **Templates**: Jinja2 for HTML email rendering
- **API Documentation**: Auto-generated Swagger UI and ReDoc
- **Validation**: Pydantic models
- **CORS**: Configured for frontend communication

### Database & Storage
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT
- **File Storage**: Supabase Storage with public bucket
- **Real-time**: Supabase real-time subscriptions (ready for future features)

### DevOps & Deployment
- **Version Control**: Git
- **Frontend Hosting**: Vercel (recommended)
- **Backend Hosting**: Railway / Render (recommended)
- **Environment**: Development and Production configurations

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **Python** 3.9 or higher
- **pip** package manager
- **Git** for version control

You'll also need accounts for:
- **Supabase** (free tier available) - [Sign up here](https://supabase.com)
- **OpenAI** API key - [Get API key](https://platform.openai.com/api-keys)
- **Resend** (optional, for email notifications) - [Sign up here](https://resend.com) - Free tier: 100 emails/day

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/planGenie.git
cd planGenie
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Create and activate a virtual environment:
```bash
# Create virtual environment
python -m venv venv

# Activate it (Windows Git Bash)
source venv/Scripts/activate

# Or on macOS/Linux
# source venv/bin/activate
```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Create environment file:
```bash
cp .env.example .env
```

Edit `backend/.env` with your credentials:
```env
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
OPENAI_API_KEY=sk-your_openai_key_here

# Optional - Email Notifications
RESEND_API_KEY=re_your_resend_key_here

# App Settings
ENVIRONMENT=development
DEBUG=True
FRONTEND_URL=http://localhost:3004
```

Start the backend server:
```bash
python main.py
```

✅ Backend should now be running on **http://localhost:8000**

### 3. Frontend Setup

Open a new terminal and navigate to frontend:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Create environment file:
```bash
touch .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the development server:
```bash
npm run dev
```

✅ Frontend should now be running on **http://localhost:3004**

### 4. Database Setup

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project (if you haven't already)
3. Go to **SQL Editor** in the sidebar
4. Click **New query**
5. Copy and paste the database schema from `backend/database_schema.sql`
6. Click **Run** to execute the SQL

### 5. Storage Setup

1. In Supabase Dashboard, go to **Storage**
2. Click **New bucket**
3. Name it `task-attachments`
4. Toggle **Public bucket** to ON
5. Click **Create bucket**

### 6. Authentication Setup

**Enable Email/Password:**
1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled

**Enable Google OAuth (Optional):**
1. Go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Follow Supabase instructions to configure OAuth credentials

### 7. Notification System Setup (Optional)

**Run Database Migration:**
1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy and paste from `backend/migrations/02_create_notification_tables.sql`
4. Click **Run** to create notification tables

**Configure Resend for Email Notifications:**
1. Sign up at [resend.com](https://resend.com) (free tier: 100 emails/day)
2. Go to **API Keys** and create a new key
3. Copy the API key (starts with `re_...`)
4. Add to `backend/.env`:
   ```env
   RESEND_API_KEY=re_your_actual_key_here
   ```
5. Restart your backend server

The notification system includes:
- Smart dashboard alerts (Quick Wins, Overdue, High Priority)
- Email notifications (task reminders, weekly digests, overdue alerts)
- User preference management in settings

## 📁 Project Structure
```
planGenie/
├── frontend/                    # Next.js frontend application
│   ├── app/                     # Next.js 14 App Router
│   │   ├── auth/               # Authentication pages (login, signup)
│   │   ├── dashboard/          # Main dashboard page
│   │   ├── new-plan/           # Plan creation flow
│   │   ├── plans/[id]/         # Individual plan view with tasks
│   │   ├── profile/            # User profile and settings
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── error.tsx           # Global error page
│   │   └── not-found.tsx       # 404 page
│   ├── components/             # Reusable React components
│   │   ├── auth/              # Auth-related components
│   │   ├── dashboard/         # Dashboard components (PlanCard, etc.)
│   │   ├── plans/             # Plan-related components (TaskItem, Chat, etc.)
│   │   └── ui/                # shadcn/ui components (Button, Card, etc.)
│   ├── lib/                    # Utility functions and configurations
│   │   ├── api/               # API client functions (plans, tasks, uploads)
│   │   ├── auth/              # Auth context and helpers
│   │   └── supabase/          # Supabase client configuration
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   └── public/                 # Static assets (favicon, images)
│
└── backend/                     # FastAPI backend application
    ├── api/                    # API layer
    │   ├── routes/            # API endpoints (plans, tasks, chat, uploads)
    │   ├── schemas/           # Pydantic request/response models
    │   └── models/            # (if using ORM models)
    ├── services/               # Business logic layer
    │   ├── openai_service.py  # AI plan generation logic
    │   └── supabase_client.py # Supabase client setup
    ├── utils/                  # Utility functions
    ├── tests/                  # Backend tests
    ├── config.py               # Configuration management
    ├── main.py                 # FastAPI application entry point
    └── requirements.txt        # Python dependencies
```

## 🚀 Usage

### Creating Your First Plan

1. **Sign Up / Login**: Create an account or log in with Google
2. **New Plan**: Click the "New Plan" button on the dashboard
3. **Describe Your Goal**: Enter a title and description of what you want to achieve
4. **Set Timeline** (Optional): Specify how long you have to complete the goal
5. **Generate**: Click "Generate Plan" and watch AI create your action plan
6. **Review Tasks**: AI will break down your goal into 7-12 specific, actionable tasks

### Managing Tasks

- **Mark Complete**: Click the checkbox next to any task
- **Edit Task**: Click on the task title or description to edit inline
- **Reorder Tasks**: Drag and drop tasks to change their order
- **Add Files**: Click "Attach File" to upload proof of completion
- **Delete Task**: Click the trash icon to remove a task

### Using the AI Chat

1. Open any plan
2. Click the chat icon to open the AI assistant
3. Ask questions like:
   - "Can you add a task for testing?"
   - "Break down task 3 into smaller steps"
   - "Suggest resources for learning React"
4. AI will respond with contextual suggestions

### Tracking Progress

- **Dashboard Stats**: View active plans, completed plans, and overall stats
- **Progress Bars**: Each plan shows a visual progress indicator
- **Profile Analytics**: See your total completion rate and task statistics

## 🧪 Testing

### Running Backend Tests
```bash
cd backend
pytest
pytest --cov=api tests/  # With coverage report
```

### Running Frontend Unit Tests
```bash
cd frontend
npm test
npm run test:watch  # Watch mode
npm run test:coverage  # With coverage
```

### Running E2E Tests (Playwright) ✨ **NEW**

PlanGenie includes comprehensive end-to-end tests covering all critical user flows.

```bash
cd frontend

# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# Run specific test file
npm run test:e2e -- auth.spec.ts

# View test report
npm run test:e2e:report
```

**Test Coverage**: 58+ E2E test scenarios covering:
- Authentication (login, signup, logout, protected routes)
- Plan management (create, view, delete, filter)
- Task operations (CRUD, reordering, due dates, priorities)
- File uploads and previews
- AI chat interactions
- Dashboard and navigation
- Responsive design

See [E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md) for detailed documentation.

### Manual Testing Checklist

- [x] User can sign up with email/password
- [x] User can log in with Google OAuth
- [x] User can create a new plan with AI
- [x] AI generates 7-12 specific tasks (not vague "research" tasks)
- [x] Tasks can be checked/unchecked
- [x] Tasks can be edited inline (title and description)
- [x] Tasks can be reordered via drag & drop
- [x] Files can be uploaded to tasks (images, PDFs, docs)
- [x] Uploaded files can be viewed and deleted
- [x] Chat with AI works and remembers context
- [x] Progress bars update correctly
- [x] Dashboard shows accurate statistics
- [x] User profile displays correct stats
- [x] Settings page allows preference changes
- [x] 404 page shows for invalid routes
- [x] Error boundaries catch and display errors
- [x] Offline indicator appears when network is down
- [x] **E2E tests cover all critical flows** ✅ **NEW**

## 🚢 Deployment

### Frontend Deployment (Vercel)

1. **Push to GitHub**:
```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Framework Preset: **Next.js**
   - Root Directory: `frontend`
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_API_URL` (your Railway backend URL)
   - Click "Deploy"

3. **Update CORS in Backend**:
   - Add your Vercel domain to `allow_origins` in `backend/main.py`

### Backend Deployment (Railway)

1. **Prepare for Deployment**:
   - Ensure `requirements.txt` is up to date
   - Create `Procfile` in backend folder:
```
     web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

2. **Deploy to Railway**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Choose `backend` as the root directory
   - Add environment variables:
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `OPENAI_API_KEY`
     - `ENVIRONMENT=production`
     - `DEBUG=False`
   - Railway will auto-deploy

3. **Get Backend URL**:
   - Copy the generated Railway URL
   - Update `NEXT_PUBLIC_API_URL` in Vercel

### Alternative: Render for Backend

If you prefer Render over Railway:
- Go to [render.com](https://render.com)
- Create a new Web Service
- Connect your GitHub repo
- Set root directory to `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## 📊 API Documentation

Once the backend is running, you can explore the API:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

- `POST /api/plans/generate` - Generate a new plan with AI
- `GET /api/plans` - Get all user plans
- `GET /api/plans/{id}` - Get plan details
- `POST /api/tasks` - Create a new task
- `PATCH /api/tasks/{id}` - Update task (title, description, status)
- `DELETE /api/tasks/{id}` - Delete a task
- `POST /api/uploads/tasks/{task_id}` - Upload file to task
- `POST /api/plans/{id}/chat` - Send message to AI assistant

## 🔒 Security Considerations

- ✅ Environment variables are not committed to version control
- ✅ API keys are stored securely in `.env` files
- ✅ Supabase Row Level Security (RLS) policies protect user data
- ✅ JWT tokens expire after 1 week
- ✅ File uploads are validated (type and size)
- ✅ CORS is configured to allow only specific origins
- ✅ SQL injection is prevented through Supabase client

## 🐛 Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'openai'`
**Solution**: Activate virtual environment and reinstall dependencies
```bash
source venv/Scripts/activate
pip install -r requirements.txt
```

**Problem**: `CORS policy error`
**Solution**: Check that frontend URL is in `allow_origins` in `main.py`

**Problem**: `Supabase connection failed`
**Solution**: Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`

### Frontend Issues

**Problem**: `Module not found: Can't resolve '@/components/ui/...'`
**Solution**: Run `npm install` to ensure all dependencies are installed

**Problem**: `Network error when calling API`
**Solution**: Ensure backend is running on port 8000 and `NEXT_PUBLIC_API_URL` is correct

**Problem**: `Authentication not working`
**Solution**: Check that Supabase credentials in `.env.local` are correct

### Database Issues

**Problem**: `relation "plans" does not exist`
**Solution**: Run the database schema SQL in Supabase SQL Editor

**Problem**: `permission denied for table plans`
**Solution**: Check Row Level Security policies in Supabase

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Coding Standards

- **Frontend**: Follow Next.js and React best practices, use TypeScript
- **Backend**: Follow PEP 8 Python style guide
- **Commits**: Use clear, descriptive commit messages
- **Documentation**: Update README if adding new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [FastAPI](https://fastapi.tiangolo.com/) - Modern, fast web framework for Python
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [OpenAI](https://openai.com/) - AI-powered plan generation
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful, accessible component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TanStack Query](https://tanstack.com/query) - Powerful data synchronization
- [Lucide Icons](https://lucide.dev/) - Beautiful consistent icon set

## 📧 Support & Contact

If you encounter any issues or have questions:

- **GitHub Issues**: [Open an issue](https://github.com/yourusername/planGenie/issues)
- **Email**: your.email@example.com
- **Documentation**: Check this README and API docs at `/docs`

## 🗺️ Roadmap

### ✅ Recently Completed
- [x] **Task Due Dates** - DatePicker with overdue indicators
- [x] **Task Priority Levels** - Color-coded badges (High/Medium/Low)
- [x] **Notification System** - Smart alerts and email notifications
- [x] **Plan Templates** - Pre-built templates for common goals
- [x] **Performance Optimization** - Code splitting and query optimization
- [x] **End-to-End Testing** - Playwright test suite for critical flows ✅ **NEW**

### 🔮 Future Features
- [ ] **Calendar Integration**: Sync tasks with Google Calendar
- [ ] **Team Collaboration**: Share plans with team members
- [ ] **Mobile App**: Native iOS and Android apps
- [ ] **Dark Mode**: Full dark theme support
- [ ] **Analytics Dashboard**: Detailed productivity insights
- [ ] **Export Plans**: PDF and CSV export functionality
- [ ] **Recurring Tasks**: Support for repeated tasks
- [ ] **Task Dependencies**: Link tasks with dependencies
- [ ] **AI Document Verification**: Automatic proof validation

---

**Built with ❤️ by Sapna**

*Last updated: December 2024*