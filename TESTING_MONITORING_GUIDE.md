# Testing & Monitoring Setup Guide

## ✅ What We've Implemented

### 1. Backend Testing Suite

**Created Files:**
- `backend/conftest.py` - Pytest configuration with shared fixtures
- `backend/tests/test_chat_api.py` - Chat endpoint tests (NEW)
- `backend/tests/test_uploads_api.py` - File upload tests (NEW)

**Existing Test Files (Already Present):**
- `backend/tests/test_plans_api.py` - Plan generation and CRUD tests
- `backend/tests/test_tasks_api.py` - Task operations tests  
- `backend/tests/test_ai_service.py` - AI service tests
- `backend/tests/test_api.py` - General API tests
- `backend/tests/test_main.py` - Main app tests

### 2. Error Monitoring Configuration

**Backend:**
- ✅ Sentry SDK already installed (`requirements.txt`)
- ✅ Sentry initialization in `main.py` (lines 14-40)
- ✅ Monitoring service in `services/monitoring_service.py`
- ✅ Environment variables in `.env.example`

**Frontend:**
- ✅ Sentry SDK installed (`package.json`)
- ✅ Updated `sentry.client.config.ts` with environment-based configuration
- ✅ Environment variables in `.env.local.example`

---

## 🚀 How to Enable Sentry (Next Steps)

### Step 1: Create Sentry Account
1. Go to [sentry.io](https://sentry.io)
2. Sign up for a free account
3. Create a new project
   - Choose "FastAPI" for backend project
   - Choose "Next.js" for frontend project

### Step 2: Get Your DSN Keys
From your Sentry dashboard:
- Backend DSN: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
- Frontend DSN: `https://yyyyy@yyyyy.ingest.sentry.io/yyyyy`

### Step 3: Update Environment Variables

**Backend (.env):**
```bash
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_TRACES_SAMPLE_RATE=1.0  # 100% in development
SENTRY_PROFILES_SAMPLE_RATE=1.0
ENVIRONMENT=development  # or 'production'
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://yyyyy@yyyyy.ingest.sentry.io/yyyyy
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development  # or 'production'
sentry_AUTH_TOKEN=your-auth-token  # Optional, for releases
```

### Step 4: Test Error Tracking

**Backend Test:**
1. Restart backend server: `python main.py`
2. Trigger a test error (create a route that raises an exception)
3. Check Sentry dashboard for the error

**Frontend Test:**
1. Restart frontend: `npm run dev`
2. Trigger a client-side error
3. Check Sentry dashboard

---

## 🧪 Running Tests

### Run All Tests
```bash
cd backend
python -m pytest tests/ -v
```

### Run Tests with Coverage
```bash
python -m pytest tests/ --cov=api --cov-report=html
```

### Run Specific Test File
```bash
python -m pytest tests/test_chat_api.py -v
python -m pytest tests/test_uploads_api.py -v
```

### Expected Results
- **Total tests:** 20+ test cases
- **Coverage:** Aiming for 40-50% with new tests
- **All tests should pass** (assuming mocks are set up correctly)

---

## 📊 Performance Optimization Recommendations

### Priority 1: Database Query Optimization
1. **Add database indexes** (most likely already present, check schema)
2. **Optimize plan statistics query** - Cache results for 5 minutes
3. **Use select() with specific columns** - Don't fetch all fields unnecessarily

### Priority 2: API Response Optimization
1. **Enable response compression** - Add compression middleware to FastAPI
2. **Implement caching for read-heavy endpoints**
   - Cache user statistics
   - Cache plan metadata
3. **Database connection pooling** - Likely handled by Supabase client already

### Priority 3: Frontend Optimization
1. **Run bundle analyzer:**
   ```bash
   cd frontend
   npm install --save-dev @next/bundle-analyzer
   ```
   
2. **code splitting:**
   - Lazy load the chat interface
   - Lazy load the file upload component
   - Lazy load heavy components

3. **Image optimization:**
   - Use Next.js `<Image>` component
   - Compress uploaded images on the server

### Priority 4: Load Testing
1. **Install load testing tool:**
   ```bash
   pip install locust
   ```

2. **Create simple load test:**
   - Test plan generation with 10-50 concurrent users
   - Test task operations under load
   - Measure response times

---

## 📈 Monitoring Metrics to Track

### Once Sentry is Live:

**Backend Metrics:**
- AI generation success rate
- Average plan generation time
- API endpoint response times
- Error rate by endpoint
- Database query times

**Frontend Metrics:**
- Page load times
- User interaction lag
- JavaScript errors
- API call failures
- Session replay for debugging

**User Engagement:**
- Plans created per user
- Task completion rate
- File uploads per task
- Chat messages sent
- Active users per day

---

## ✅ Completion Checklist

### Testing (Done ✅)
- [x] Created pytest configuration and fixtures
- [x] Added tests for chat API
- [x] Added tests for uploads API
- [x] Test framework ready to run

### Monitoring (Ready ⚠️)
- [x] Sentry SDK installed (backend + frontend)
- [x] Sentry configuration files updated
- [x] Monitoring service created
- [ ] **TODO:** Add Sentry DSN to environment variables
- [ ] **TODO:** Test error tracking in staging
- [ ] **TODO:** Deploy to production

### Performance (Next Steps 📋)
- [ ] Run backend performance profiling
- [ ] Run frontend bundle analyzer
- [ ] Implement quick optimization wins
- [ ] Run load tests
- [ ] Document baseline metrics

---

## 🎯 Next Actions for Dev Team

1. **This Week:**
   - Create Sentry account and get DSN keys
   - Add DSN to `.env` and `.env.local`
   - Run pytest suite and verify all tests pass
   - Fix any failing tests

2. **Next Week:**
   - Run bundle analyzer and optimize frontend
   - Add response caching for heavy queries
   - Run load tests to identify bottlenecks
   - Set up error alerts in Sentry

3. **Ongoing:**
   - Monitor Sentry dashboard for errors
   - Track key metrics (generation time, success rate)
   - Gradually improve test coverage to 70%+

---

**Last Updated:** November 24, 2024  
**Status:** Testing infrastructure complete, Sentry ready for DSN configuration
