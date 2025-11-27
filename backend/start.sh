#!/bin/bash

# Activate virtual environment
source venv/Scripts/activate

# Start the FastAPI server
uvicorn main:app --reload --port 8003
