# Music Analysis DevSecOps Application

A full-stack web application that analyzes uploaded songs and generates intelligent arrangement suggestions based on structure, timing, and advanced musical analysis.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Tailwind CSS (Port 3000)
- **Backend**: Express.js + MongoDB (Port 8000)  
- **Audio Analysis**: FastAPI + Librosa (Port 8001)
- **Database**: MongoDB
- **DevSecOps**: Jenkins, SonarQube, Trivy, OWASP Dependency Check

## 🚀 Features

- 🎧 Advanced audio analysis using Librosa
- 🧠 AI-generated arrangement suggestions
- ⏱️ Timeline breakdown with song structure visualization
- 👤 User authentication and arrangement management
- 💾 MongoDB integration for data persistence
- 🔒 Comprehensive security practices
- 🐳 Containerized deployment with Kubernetes

## 🛠️ Local Development

### Prerequisites
- Node.js 16+
- Python 3.9+
- MongoDB
- Docker & Docker Compose

### Quick Start
```bash
# Clone and setup
git clone <repo-url>
cd music-analysis-devsecops

# Start all services with Docker Compose
docker-compose up -d

# Or run services individually:

# 1. Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# 2. Start Audio Analysis Service
cd audio-analysis-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001

# 3. Start Backend
cd ../backend
npm install
npm run dev

# 4. Start Frontend
cd ../frontend
npm install
npm run dev
```

## 🔐 Security Features

- SonarQube code quality analysis
- Trivy vulnerability scanning
- OWASP dependency checking
- Container security best practices
- Secure inter-service communication
- Input validation and sanitization
- Rate limiting and CORS protection

## 📁 Project Structure

```
music-analysis-devsecops/
├── frontend/                 # React application
├── backend/                  # Express.js API
├── audio-analysis-service/   # FastAPI microservice
├── infrastructure/           # Kubernetes manifests
├── docs/                    # Documentation
├── docker-compose.yml       # Local development
└── Jenkinsfile             # CI/CD pipeline
```

## 🧪 Testing

```bash
# Run all tests
npm run test:all

# Security scans
npm run security:scan
```

## 🚢 Deployment

The application is deployed using Kubernetes with comprehensive DevSecOps practices.

See [deployment documentation](./docs/deployment.md) for details.
