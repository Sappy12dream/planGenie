# PlanGenie Development Plan

## 🎯 Project Overview
Build an AI-powered planning copilot that transforms vague goals into actionable, trackable plans.

---

## 📋 Development Phases

### Phase 0: Project Setup & Foundation
**Goal:** Get the development environment and core infrastructure ready

- [ ] **0.1 Repository Setup**
  - [X] Initialize Git repository
  - [ ] Set up monorepo structure (frontend/backend)
  - [ ] Create .gitignore and basic README

- [ ] **0.2 Frontend Scaffolding**
  - [ ] Initialize Next.js with TypeScript using vite
  - [ ] Set up Tailwind CSS + shadcn/ui
  - [ ] Configure ESLint and Prettier
  - [ ] Set up React Query and React Hook Form
  - [ ] Create basic folder structure (`/components`, `/app`, `/lib`, `/hooks`)

- [ ] **0.3 Backend Scaffolding**
  - [ ] Initialize FastAPI project
  - [ ] Set up virtual environment and dependencies
  - [ ] Create basic project structure (`/api`, `/models`, `/services`)
  - [ ] Configure CORS for local development
  - [ ] Set up pytest for testing

- [ ] **0.4 Database Setup**
  - [ ] Create Supabase project
  - [ ] Design initial database schema (see Schema Design section)
  - [ ] Set up environment variables for connection
  - [ ] Create database migrations/setup script

- [ ] **0.5 AI Layer Setup**
  - [ ] Set up OpenAI API key
  - [ ] Install and configure LangChain
  - [ ] Create basic AI service wrapper
  - [ ] Test simple prompt/completion flow

**Questions for You:**
- Do you have OpenAI API access already, or should we plan for API key setup?
I have API key, we can add it in .env
- Preference for monorepo vs separate repos?
monorepo
- Any existing design system or brand colors in mind?
monochromatic, more like default shadcn/ui

---

### Phase 1: MVP - Basic Plan Generation
**Goal:** User can input a goal and get an AI-generated plan

- [ ] **1.1 Frontend - Plan Input**
  - [ ] Create landing page with hero section
  - [ ] Build plan input form (title, description, timeline)
  - [ ] Add basic validation
  - [ ] Loading states during generation

- [ ] **1.2 Backend - Plan Generation API**
  - [ ] Create `/api/plans/generate` endpoint
  - [ ] Design prompt template for plan generation
  - [ ] Parse AI response into structured format (tasks, timeline, resources)
  - [ ] Store generated plan in database
  - [ ] Return plan ID and structured data

- [ ] **1.3 Frontend - Plan Display**
  - [ ] Create plan view page
  - [ ] Display plan title, description, and timeline
  - [ ] Render tasks in a clean list/card layout
  - [ ] Show resources as links or attachments
  - [ ] Basic responsive design

- [ ] **1.4 Database Models**
  - [ ] Plans table (id, user_id, title, description, status, created_at)
  - [ ] Tasks table (id, plan_id, title, description, status, due_date, order)
  - [ ] Resources table (id, plan_id, title, url, type)

**Questions for You:**
- Should users be able to generate plans anonymously at first, or require auth from day 1?
auth is required, with username & password or google auth
- What's the initial character limit for plan descriptions?

---

### Phase 2: Task Tracking & Progress
**Goal:** Users can mark tasks complete and see progress

- [ ] **2.1 Task Interaction**
  - [ ] Add checkboxes to mark tasks complete/incomplete
  - [ ] Update task status in database
  - [ ] Optimistic UI updates with React Query
  - [ ] Add visual indicators for completed tasks

- [ ] **2.2 Progress Tracking**
  - [ ] Calculate completion percentage
  - [ ] Display progress bar on plan page
  - [ ] Show stats (X of Y tasks complete)
  - [ ] Add filter views (all, active, completed)

- [ ] **2.3 Task Management**
  - [ ] Edit task details inline
  - [ ] Add new tasks manually
  - [ ] Delete tasks
  - [ ] Reorder tasks (drag & drop?)

- [ ] **2.4 Backend APIs**
  - [ ] `PATCH /api/tasks/:id` - Update task
  - [ ] `POST /api/plans/:id/tasks` - Create task
  - [ ] `DELETE /api/tasks/:id` - Delete task
  - [ ] `GET /api/plans/:id/progress` - Get progress stats

**Questions for You:**
- Should task reordering be drag-and-drop or simpler up/down buttons for MVP?
drag and drop
---

### Phase 3: AI Chat Interface
**Goal:** Users can chat with AI to refine and update plans

- [ ] **3.1 Chat UI**
  - [ ] Build chat interface component (message list, input box)
  - [ ] Display user and AI messages
  - [ ] Show typing indicators
  - [ ] Auto-scroll to latest message

- [ ] **3.2 Chat Backend**
  - [ ] Create `/api/plans/:id/chat` endpoint
  - [ ] Store chat history in database
  - [ ] Pass plan context to AI (current tasks, resources)
  - [ ] Parse AI responses for plan updates

- [ ] **3.3 Plan Updates via Chat**
  - [ ] Detect when AI suggests task changes
  - [ ] Show suggested changes as interactive prompts
  - [ ] Allow user to accept/reject AI suggestions
  - [ ] Apply accepted changes to plan

- [ ] **3.4 Database Models**
  - [ ] Messages table (id, plan_id, role, content, timestamp)
  - [ ] Suggested_changes table (id, message_id, change_type, data, status)

**Questions for You:**
- Should chat be a sidebar or full-screen overlay?
side bar
- Should every plan have its own chat, or one global assistant?
every plan have its own chat
---

### Phase 4: File Upload & Proof Verification
**Goal:** Users can upload files to verify task completion

- [ ] **4.1 File Upload UI**
  - [ ] Add upload button to task items
  - [ ] Show file preview (images, PDFs)
  - [ ] Display uploaded files in task details
  - [ ] Support multiple files per task

- [ ] **4.2 File Storage**
  - [ ] Set up Supabase Storage bucket
  - [ ] Create upload API endpoint
  - [ ] Generate and store file URLs
  - [ ] Set file size and type limits

- [ ] **4.3 AI Verification (Optional Enhancement)**
  - [ ] Pass uploaded file to AI (for images/text)
  - [ ] AI validates if proof matches task
  - [ ] Show verification status badge

- [ ] **4.4 Database Models**
  - [ ] Uploads table (id, task_id, file_name, file_url, uploaded_at)

**Questions for You:**
- What file types should we support initially? (images, PDFs, docs?)
images, pdf, docs
- Should AI verification be part of MVP or later enhancement?
later, for now uploading it would be fine
---

### Phase 5: User Authentication & Multi-Plan Management
**Goal:** Users can create accounts and manage multiple plans

- [ ] **5.1 Authentication**
  - [ ] Set up Supabase Auth
  - [ ] Create sign up / sign in pages
  - [ ] Implement session management
  - [ ] Protect routes (redirect if not authenticated)

- [ ] **5.2 Dashboard**
  - [ ] Create dashboard/home page
  - [ ] List all user's plans
  - [ ] Show plan status and progress at a glance
  - [ ] Search and filter plans
  - [ ] Delete plans

- [ ] **5.3 User Profile**
  - [ ] Basic profile page
  - [ ] Display user stats (total plans, completion rate)
  - [ ] Settings (email, notifications)

**Questions for You:**
- Should we support social login (Google, GitHub) or just email/password initially?
google & email/password
- Any preferences for session duration or remember me functionality?
remember for a week
---

### Phase 6: Polish & Production Readiness
**Goal:** Make the app production-ready and polished

- [ ] **6.1 Testing**
  - [ ] Write frontend component tests
  - [ ] Write backend API tests
  - [ ] End-to-end testing with Playwright/Cypress
  - [ ] Test AI prompt reliability and edge cases

- [ ] **6.2 Error Handling**
  - [ ] Add error boundaries in React
  - [ ] Implement retry logic for API calls
  - [ ] User-friendly error messages
  - [ ] Logging and monitoring setup

- [ ] **6.3 Performance**
  - [ ] Optimize API response times
  - [ ] Add loading skeletons
  - [ ] Implement pagination for large plans
  - [ ] Code splitting and lazy loading

- [ ] **6.4 Deployment**
  - [ ] Deploy frontend (Vercel recommended for Next.js)
  - [ ] Deploy backend (Railway, Render, or AWS)
  - [ ] Set up environment variables
  - [ ] Configure custom domain
  - [ ] Set up CI/CD pipeline

- [ ] **6.5 Documentation**
  - [ ] Write API documentation
  - [ ] Create user guide
  - [ ] Add inline code comments
  - [ ] Update README with setup instructions

---

## 📊 Database Schema Design

### Plans
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key, nullable initially)
- title (text)
- description (text)
- status (enum: draft, active, completed, archived)
- created_at (timestamp)
- updated_at (timestamp)
```

### Tasks
```sql
- id (uuid, primary key)
- plan_id (uuid, foreign key)
- title (text)
- description (text)
- status (enum: pending, in_progress, completed)
- due_date (date, nullable)
- order (integer)
- created_at (timestamp)
```

### Resources
```sql
- id (uuid, primary key)
- plan_id (uuid, foreign key)
- title (text)
- url (text)
- type (enum: link, document, video, other)
- created_at (timestamp)
```

### Messages (for chat)
```sql
- id (uuid, primary key)
- plan_id (uuid, foreign key)
- role (enum: user, assistant)
- content (text)
- created_at (timestamp)
```

### Uploads
```sql
- id (uuid, primary key)
- task_id (uuid, foreign key)
- file_name (text)
- file_url (text)
- file_size (integer)
- mime_type (text)
- uploaded_at (timestamp)
```

---

## 🎨 Design Priorities

1. **Clean & Minimal** - Focus on clarity, not clutter
2. **Mobile-First** - Most planning happens on phones
3. **Fast Feedback** - Show loading states, optimistic updates
4. **Progressive Disclosure** - Don't overwhelm with all features at once

---

## 🚀 Success Metrics

- [ ] Generate a plan in < 10 seconds
- [ ] 90%+ uptime for AI generation
- [ ] Mobile-responsive on all screens
- [ ] <2s page load times
- [ ] Plans persist reliably in database

---

## 📝 Notes & Decisions

*(We'll add notes here as we make decisions during development)*