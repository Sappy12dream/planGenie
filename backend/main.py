from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from api.routes import plans, tasks, chat

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="PlanGenie API",
    description="AI-powered planning copilot backend",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3004"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(plans.router)
app.include_router(tasks.router)
app.include_router(chat.router)

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
