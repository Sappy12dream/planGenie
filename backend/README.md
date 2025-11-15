# PlanGenie Backend

FastAPI backend for PlanGenie - AI-powered planning copilot.

## Setup

1. Create virtual environment:
```bash
   python -m venv venv
   source venv/Scripts/activate  # Git Bash on Windows
```

2. Install dependencies:
```bash
   pip install -r requirements.txt
```

3. Configure environment:
```bash
   cp .env.example .env
   # Edit .env with your credentials
```

4. Run development server:
```bash
   uvicorn main:app --reload --port 8000
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing
```bash
pytest
```
