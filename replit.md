# ChemBio Defense Dashboard

## Overview

This is a Flask-based web application designed for chemical and biological threat analysis and defense operations. The system provides a comprehensive dashboard for tactical operators and command centers to analyze scenes, detect hazards, and coordinate responses to chemical and biological threats.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Flask with SQLAlchemy ORM
- **Database**: SQLite (configurable to PostgreSQL via environment variable)
- **Real-time Communication**: Flask-SocketIO for WebSocket connections
- **API Structure**: RESTful APIs with separate blueprints for main routes and API endpoints
- **Agent-Based Analysis**: Multi-agent system for specialized threat analysis

### Frontend Architecture
- **Framework**: Bootstrap 5 with dark theme
- **JavaScript**: Vanilla JS with modular architecture
- **Real-time Updates**: Socket.IO client for live communication
- **User Interface**: Tab-based dashboard with tactical and command center views

### AI/ML Integration
- **Primary AI Service**: Google Gemini API for image and video analysis
- **Vector Database**: ChromaDB with sentence transformers for RAG (Retrieval-Augmented Generation)
- **Multi-Agent System**: Coordinated specialized agents for different analysis types

## Key Components

### Agent System
The application uses a multi-agent architecture with specialized agents:
- **HazardDetectionAgent**: Identifies chemical and biological hazards
- **SynthesisAnalysisAgent**: Analyzes chemical synthesis operations
- **MOPPRecommendationAgent**: Provides Mission Oriented Protective Posture recommendations
- **SamplingStrategyAgent**: Suggests sampling strategies for evidence collection
- **AgentCoordinator**: Orchestrates all agents for comprehensive analysis

### Database Models
- **SceneAnalysis**: Stores analysis results, confidence scores, and agent outputs
- **Communication**: Manages tactical-command communication with message types
- **SensorData**: Stores sensor readings with alert levels
- **KnowledgeBase**: RAG knowledge base entries with embeddings
- **AuditLog**: Activity logging for compliance and security tracking
- **ComplianceReport**: Generated compliance reports with scores and findings
- **DataRetention**: Data retention policies and compliance tracking

### Services
- **AnalysisService**: Coordinates scene analysis with agent system
- **GeminiService**: Handles Google Gemini API interactions
- **VectorDatabase**: Manages ChromaDB for knowledge retrieval
- **AuditService**: Comprehensive audit trail and compliance management

### User Interface
- **Tactical View**: Field operator interface for immediate threat assessment
- **Command Center View**: Strategic overview with comprehensive analysis
- **Real-time Communication**: Bidirectional messaging between tactical and command
- **Audit Dashboard**: Comprehensive compliance monitoring and reporting interface

## Data Flow

1. **Scene Upload**: User uploads images/videos or provides YouTube URLs
2. **Preprocessing**: Scene data is processed and enhanced with RAG knowledge
3. **Agent Analysis**: Multi-agent system analyzes the scene in parallel
4. **Result Synthesis**: Agent outputs are combined into unified recommendations
5. **Storage**: Results are stored in database with session tracking
6. **Display**: Results are presented in role-appropriate interfaces
7. **Communication**: Findings can be shared between tactical and command users

## External Dependencies

### Required APIs
- **Google Gemini API**: For AI-powered image and video analysis
- **API Key**: Set via `GEMINI_API_KEY` environment variable

### Python Packages
- **Flask**: Web framework with SQLAlchemy and SocketIO
- **Google GenAI**: Gemini API client
- **ChromaDB**: Vector database for knowledge retrieval
- **Sentence Transformers**: Text embeddings for RAG
- **PIL/OpenCV**: Image processing
- **Bootstrap**: Frontend framework (CDN)

### File Storage
- **Upload Directory**: Local file storage for uploaded media
- **Supported Formats**: Images (PNG, JPG, JPEG, GIF, BMP, TIFF), Videos (MP4, AVI, MOV, WMV, FLV, WEBM)
- **Size Limits**: 50MB maximum file size

## Deployment Strategy

### Environment Configuration
- **Database**: SQLite by default, PostgreSQL via `DATABASE_URL` environment variable
- **Session Secret**: Configurable via `SESSION_SECRET` environment variable
- **Debug Mode**: Enabled for development, should be disabled in production

### Production Considerations
- **Proxy Configuration**: Uses ProxyFix middleware for deployment behind reverse proxy
- **Database Pooling**: Configured with connection pool recycling and pre-ping
- **CORS**: Socket.IO configured to allow all origins (should be restricted in production)

### Security Features
- **Session Management**: Server-side session handling with secure keys
- **File Validation**: Strict file type and size validation
- **Input Sanitization**: Secure filename handling with werkzeug

### Scalability
- **Multi-Agent Parallelization**: Agents run in parallel using ThreadPoolExecutor
- **Database Optimization**: Prepared for PostgreSQL scaling
- **Real-time Communication**: WebSocket support for multiple concurrent users

The system is designed to be deployed on cloud platforms with environment-based configuration for production security and scalability.