# Deployment Guide

## Overview

This document provides comprehensive instructions for deploying the Music Analysis DevSecOps application across different environments.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React         │    │   Express.js    │    │   FastAPI       │
│   Frontend      │────│   Backend       │────│   Audio Service │
│   (Port 3000)   │    │   (Port 8000)   │    │   (Port 8001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                │
                       ┌─────────────────┐
                       │   MongoDB       │
                       │   (Port 27017)  │
                       └─────────────────┘
```

## Prerequisites

### Local Development
- Node.js 16+
- Python 3.9+
- MongoDB 5.0+
- Docker & Docker Compose

### Production Deployment
- Kubernetes cluster (1.24+)
- kubectl configured
- Docker registry access
- TLS certificates
- Monitoring stack (Prometheus/Grafana)

## Local Development Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd music-analysis-devsecops
```

### 2. Environment Configuration
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your configuration
```

### 3. Start with Docker Compose
```bash
docker-compose up -d
```

### 4. Manual Service Startup

#### MongoDB
```bash
docker run -d -p 27017:27017 --name mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  mongo:latest
```

#### Audio Analysis Service
```bash
cd audio-analysis-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Production Deployment

### 1. Build Docker Images

```bash
# Frontend
cd frontend
docker build -t your-registry.com/music-analysis-frontend:latest .

# Backend
cd ../backend
docker build -t your-registry.com/music-analysis-backend:latest .

# Audio Service
cd ../audio-analysis-service
docker build -t your-registry.com/music-analysis-audio:latest .
```

### 2. Push to Registry
```bash
docker push your-registry.com/music-analysis-frontend:latest
docker push your-registry.com/music-analysis-backend:latest
docker push your-registry.com/music-analysis-audio:latest
```

### 3. Deploy to Kubernetes

#### Create Namespace
```bash
kubectl apply -f infrastructure/namespace.yml
```

#### Deploy MongoDB
```bash
kubectl apply -f infrastructure/mongodb-deployment.yml
```

#### Deploy Application Services
```bash
kubectl apply -f infrastructure/audio-service-deployment.yml
kubectl apply -f infrastructure/backend-deployment.yml
kubectl apply -f infrastructure/frontend-deployment.yml
```

#### Configure Ingress
```bash
kubectl apply -f infrastructure/ingress.yml
```

#### Apply Network Policies
```bash
kubectl apply -f infrastructure/network-policy.yml
```

### 4. Verify Deployment
```bash
kubectl get pods -n music-analysis-dev
kubectl get services -n music-analysis-dev
kubectl get ingress -n music-analysis-dev
```

## Environment Configuration

### Development Environment
```yaml
# Values for development
replicas: 1
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "200m"
```

### Production Environment
```yaml
# Values for production
replicas: 3
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

## Security Configuration

### 1. Secrets Management
```bash
# Create secrets
kubectl create secret generic app-secrets \
  --from-literal=mongodb-url="mongodb://admin:password@mongodb-service:27017/music_analysis?authSource=admin" \
  --from-literal=jwt-secret="your-super-secure-jwt-secret" \
  -n music-analysis-dev
```

### 2. TLS Configuration
```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create cluster issuer
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@company.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

## Monitoring Setup

### 1. Prometheus Configuration
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'music-analysis-backend'
      static_configs:
      - targets: ['backend-service:8000']
    - job_name: 'music-analysis-audio'
      static_configs:
      - targets: ['audio-analysis-service:8001']
```

### 2. Grafana Dashboards
- Application metrics dashboard
- Infrastructure monitoring dashboard
- Security events dashboard

## Backup and Recovery

### 1. MongoDB Backup
```bash
# Create backup
kubectl exec -it mongodb-pod -- mongodump --uri="mongodb://admin:password@localhost:27017/music_analysis?authSource=admin" --out=/backup

# Restore backup
kubectl exec -it mongodb-pod -- mongorestore --uri="mongodb://admin:password@localhost:27017/music_analysis?authSource=admin" /backup/music_analysis
```

### 2. Application Data Backup
```bash
# Backup user uploads and arrangements
kubectl exec -it backend-pod -- tar -czf /tmp/app-data.tar.gz /app/uploads
kubectl cp backend-pod:/tmp/app-data.tar.gz ./app-data-backup.tar.gz
```

## Scaling

### 1. Horizontal Pod Autoscaler
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 2. Manual Scaling
```bash
# Scale backend
kubectl scale deployment backend --replicas=5 -n music-analysis-dev

# Scale audio service
kubectl scale deployment audio-analysis-service --replicas=3 -n music-analysis-dev
```

## Troubleshooting

### 1. Common Issues

#### Pod Not Starting
```bash
kubectl describe pod <pod-name> -n music-analysis-dev
kubectl logs <pod-name> -n music-analysis-dev
```

#### Service Connection Issues
```bash
kubectl get endpoints -n music-analysis-dev
kubectl exec -it <pod-name> -- nslookup <service-name>
```

#### Database Connection Issues
```bash
kubectl exec -it mongodb-pod -- mongo --eval "db.adminCommand('ismaster')"
```

### 2. Health Checks
```bash
# Check application health
curl -k https://music-analysis-dev.company.com/api/health
curl -k https://music-analysis-dev.company.com/health

# Check internal services
kubectl exec -it backend-pod -- curl http://audio-analysis-service:8001/health
```

### 3. Log Analysis
```bash
# View application logs
kubectl logs -f deployment/backend -n music-analysis-dev
kubectl logs -f deployment/audio-analysis-service -n music-analysis-dev

# View ingress logs
kubectl logs -f -n ingress-nginx deployment/ingress-nginx-controller
```

## Performance Optimization

### 1. Resource Tuning
- Monitor CPU and memory usage
- Adjust resource requests and limits
- Optimize database queries
- Implement caching strategies

### 2. Database Optimization
```javascript
// Create indexes for better performance
db.songs.createIndex({ "uploadedBy": 1, "createdAt": -1 })
db.arrangements.createIndex({ "createdBy": 1, "updatedAt": -1 })
db.users.createIndex({ "email": 1 }, { unique: true })
```

## Security Hardening

### 1. Network Policies
- Restrict inter-pod communication
- Block unnecessary egress traffic
- Implement micro-segmentation

### 2. Pod Security Standards
```yaml
apiVersion: v1
kind: Pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1001
    fsGroup: 1001
  containers:
  - name: app
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
```

## Maintenance

### 1. Regular Updates
- Update base images monthly
- Apply security patches immediately
- Update dependencies regularly
- Review and update configurations

### 2. Health Monitoring
- Set up alerting for critical metrics
- Monitor application performance
- Track security events
- Review logs regularly

## Support

For deployment issues:
- DevOps Team: devops@company.com
- Documentation: https://docs.company.com/music-analysis
- Support Portal: https://support.company.com
