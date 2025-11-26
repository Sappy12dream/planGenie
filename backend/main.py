from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration

from api.routes import plans, tasks, chat, uploads, subtasks, templates

# Load environment variables
load_dotenv()

# Initialize Sentry for error tracking and performance monitoring
sentry_dsn = os.getenv("SENTRY_DSN")
environment = os.getenv("ENVIRONMENT", "development")

if sentry_dsn:
    sentry_sdk.init(
        dsn=sentry_dsn,
        environment=environment,
        # Set traces_sample_rate to 1.0 to capture 100% of transactions for performance monitoring
        # In production, you may want to reduce this to 0.1 (10%) to reduce costs
        traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "1.0")),
        # Set profiles_sample_rate to 1.0 to profile 100% of sampled transactions
        # Remove this option if you don't want to use the profiling feature
        profiles_sample_rate=float(os.getenv("SENTRY_PROFILES_SAMPLE_RATE", "1.0")),
        # Enable performance monitoring
        enable_tracing=True,
        # Integrations
        integrations=[
            FastApiIntegration(transaction_style="endpoint"),
            StarletteIntegration(transaction_style="endpoint"),
        ],
        # Send default PII (Personally Identifiable Information) like user ID
        send_default_pii=True,
    )
    print(f"✅ Sentry initialized for environment: {environment}")
else:
    print("⚠️  Sentry DSN not found - error tracking disabled")

# Initialize FastAPI app
app = FastAPI(
    title="PlanGenie API",
    description="AI-powered planning copilot backend",
    version="0.1.0"
)

# Configure CORS - Allow both local and production frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3004",           # Local development
        "https://plan-genie-pi.vercel.app" # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(plans.router)
app.include_router(tasks.router)
app.include_router(chat.router)
app.include_router(uploads.router)
app.include_router(subtasks.router)
app.include_router(templates.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to PlanGenie API",
        "version": "0.1.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

