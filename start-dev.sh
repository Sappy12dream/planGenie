#!/bin/bash

# Start both frontend and backend development servers

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🚀 Starting PlanGenie Development Servers..."
echo ""

# Start backend in background
echo "📦 Starting Backend (port 8003)..."
cd "$SCRIPT_DIR/backend"
source venv/Scripts/activate
uvicorn main:app --reload --port 8003 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend in foreground
echo "⚛️  Starting Frontend (port 3004)..."
cd "$SCRIPT_DIR/frontend"
npm run dev

# When frontend stops (Ctrl+C), kill backend too
echo ""
echo "🛑 Shutting down servers..."
kill $BACKEND_PID 2>/dev/null

echo "✅ Development servers stopped"
