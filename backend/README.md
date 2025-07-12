# ArcBrain Backend API

A FastAPI-based backend for the ArcBrain Decision Intelligence Platform, providing comprehensive decision management, AI analysis, and collaboration features.

## Features

- **Decision Management**: Create, update, and track decisions across different brain types
- **AI Analysis**: Generate intelligent analysis with reasoning, pros/cons, and recommendations
- **Template System**: Reusable decision templates for common scenarios
- **Analytics**: Decision metrics and performance tracking
- **Collaboration**: Team collaboration and chat features
- **Real-time Data**: Integration with external data sources

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **MongoDB**: NoSQL database for flexible data storage
- **Motor**: Async MongoDB driver
- **Pydantic**: Data validation and serialization
- **Python 3.8+**: Modern Python features and async support

## Quick Start

### Prerequisites

- Python 3.8 or higher
- MongoDB instance (local or cloud)
- pip package manager

### Installation

1. **Clone the repository and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server:**
   ```bash
   python start.py
   ```

The API will be available at `http://localhost:8000`

## Environment Configuration

Create a `.env` file with the following variables:

```env
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017
DB_NAME=arcbrain

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# AI Integration (for future use)
OPENAI_API_KEY=your-openai-api-key
GROQ_API_KEY=your-groq-api-key

# External Services
FINNHUB_API_KEY=your-finnhub-api-key
```

## API Endpoints

### Health Check
- `GET /api/health` - API health status

### Decision Management
- `POST /api/decisions` - Create a new decision
- `GET /api/decisions` - Get decisions with filtering
- `GET /api/decisions/{id}` - Get specific decision
- `PUT /api/decisions/{id}` - Update decision
- `POST /api/decisions/{id}/analyze` - Generate AI analysis

### Templates
- `POST /api/templates` - Create template
- `GET /api/templates` - Get templates with filtering

### Analytics
- `GET /api/analytics/overview` - Get decision metrics

### Collaboration
- `POST /api/decisions/{id}/collaborate` - Start collaboration
- `POST /api/decisions/{id}/chat` - Add chat message

## Data Models

### Decision
```python
{
  "id": "uuid",
  "title": "string",
  "brain_type": "finance|strategy|personal",
  "user_id": "string",
  "organization_id": "string",
  "decision_input": {
    "problem_context": "string",
    "desired_outcome": "string",
    "constraints": ["string"],
    "stakeholders": ["string"],
    "deadline": "datetime",
    "budget_range": "string"
  },
  "ai_analysis": {
    "reasoning_steps": ["string"],
    "pros_cons": {
      "pros": ["string"],
      "cons": ["string"]
    },
    "risk_assessment": {"string": "string"},
    "recommendations": ["string"],
    "confidence_score": 0.0,
    "estimated_impact": "string"
  },
  "status": "draft|analyzing|reviewed|approved|executed|completed",
  "priority": "low|medium|high|critical",
  "tags": ["string"],
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Template
```python
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "brain_type": "finance|strategy|personal",
  "category": "string",
  "template_data": {},
  "usage_count": 0,
  "is_public": true,
  "created_by": "string",
  "rating": 0.0,
  "tags": ["string"]
}
```

## Development

### Running in Development Mode

```bash
# Start with auto-reload
python start.py

# Or use uvicorn directly
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Testing

```bash
# Run tests (when implemented)
pytest

# Run with coverage
pytest --cov=app
```

## Deployment

### Docker Deployment

1. **Build the image:**
   ```bash
   docker build -t arcbrain-backend .
   ```

2. **Run the container:**
   ```bash
   docker run -p 8000:8000 --env-file .env arcbrain-backend
   ```

### Production Considerations

- Use a production WSGI server like Gunicorn
- Set up proper MongoDB authentication
- Configure CORS for production domains
- Use environment-specific configuration
- Set up monitoring and logging
- Implement rate limiting
- Add authentication middleware

## Integration with Frontend

The backend is designed to work seamlessly with the Next.js frontend. Key integration points:

1. **API Base URL**: Configure in frontend environment variables
2. **CORS**: Backend allows frontend origins
3. **Data Types**: Shared TypeScript interfaces
4. **Error Handling**: Consistent error responses
5. **Real-time Updates**: WebSocket support (planned)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is part of the ArcBrain Decision Intelligence Platform. 