pipeline {
    agent any
    
    tools {
        jdk 'jdk17'
        nodejs 'node16'
    }
    
    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        DOCKER_REGISTRY = 'your-registry.com'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }
        
        stage('Checkout from Git') {
            steps {
                git branch: 'main', url: 'https://github.com/your-org/music-analysis-devsecops.git'
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Audio Service Dependencies') {
                    steps {
                        dir('audio-analysis-service') {
                            sh 'pip install -r requirements.txt'
                        }
                    }
                }
            }
        }
        
        stage('Code Quality Analysis') {
            parallel {
                stage('SonarQube Analysis - Frontend') {
                    steps {
                        dir('frontend') {
                            withSonarQubeEnv('sonar-server') {
                                sh '''
                                    $SCANNER_HOME/bin/sonar-scanner \
                                    -Dsonar.projectName=MusicAnalysis-Frontend \
                                    -Dsonar.projectKey=music-analysis-frontend \
                                    -Dsonar.sources=src \
                                    -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info
                                '''
                            }
                        }
                    }
                }
                stage('SonarQube Analysis - Backend') {
                    steps {
                        dir('backend') {
                            withSonarQubeEnv('sonar-server') {
                                sh '''
                                    $SCANNER_HOME/bin/sonar-scanner \
                                    -Dsonar.projectName=MusicAnalysis-Backend \
                                    -Dsonar.projectKey=music-analysis-backend \
                                    -Dsonar.sources=. \
                                    -Dsonar.exclusions=node_modules/**
                                '''
                            }
                        }
                    }
                }
                stage('SonarQube Analysis - Audio Service') {
                    steps {
                        dir('audio-analysis-service') {
                            withSonarQubeEnv('sonar-server') {
                                sh '''
                                    $SCANNER_HOME/bin/sonar-scanner \
                                    -Dsonar.projectName=MusicAnalysis-AudioService \
                                    -Dsonar.projectKey=music-analysis-audio-service \
                                    -Dsonar.sources=. \
                                    -Dsonar.python.coverage.reportPaths=coverage.xml
                                '''
                            }
                        }
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                script {
                    waitForQualityGate abortPipeline: false, credentialsId: 'Sonar-token'
                }
            }
        }
        
        stage('Security Scans') {
            parallel {
                stage('OWASP Dependency Check') {
                    steps {
                        dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit', odcInstallation: 'DP-Check'
                        dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
                    }
                }
                stage('Trivy Filesystem Scan') {
                    steps {
                        sh 'trivy fs . --format table -o trivy-fs-report.txt'
                    }
                }
                stage('NPM Audit') {
                    steps {
                        script {
                            dir('frontend') {
                                sh 'npm audit --audit-level high || true'
                            }
                            dir('backend') {
                                sh 'npm audit --audit-level high || true'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Build Applications') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm run build'
                        }
                    }
                }
                stage('Test Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm test || true'
                        }
                    }
                }
                stage('Test Audio Service') {
                    steps {
                        dir('audio-analysis-service') {
                            sh 'python -m pytest || true'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Frontend Image') {
                    steps {
                        script {
                            dir('frontend') {
                                sh "docker build -t ${DOCKER_REGISTRY}/music-analysis-frontend:${IMAGE_TAG} ."
                            }
                        }
                    }
                }
                stage('Build Backend Image') {
                    steps {
                        script {
                            dir('backend') {
                                sh "docker build -t ${DOCKER_REGISTRY}/music-analysis-backend:${IMAGE_TAG} ."
                            }
                        }
                    }
                }
                stage('Build Audio Service Image') {
                    steps {
                        script {
                            dir('audio-analysis-service') {
                                sh "docker build -t ${DOCKER_REGISTRY}/music-analysis-audio:${IMAGE_TAG} ."
                            }
                        }
                    }
                }
            }
        }
        
        stage('Container Security Scan') {
            parallel {
                stage('Trivy Frontend Image Scan') {
                    steps {
                        sh "trivy image ${DOCKER_REGISTRY}/music-analysis-frontend:${IMAGE_TAG} --format table -o trivy-frontend-image.txt"
                    }
                }
                stage('Trivy Backend Image Scan') {
                    steps {
                        sh "trivy image ${DOCKER_REGISTRY}/music-analysis-backend:${IMAGE_TAG} --format table -o trivy-backend-image.txt"
                    }
                }
                stage('Trivy Audio Service Image Scan') {
                    steps {
                        sh "trivy image ${DOCKER_REGISTRY}/music-analysis-audio:${IMAGE_TAG} --format table -o trivy-audio-image.txt"
                    }
                }
            }
        }
        
        stage('Push Docker Images') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker-registry', toolName: 'docker') {
                        sh "docker push ${DOCKER_REGISTRY}/music-analysis-frontend:${IMAGE_TAG}"
                        sh "docker push ${DOCKER_REGISTRY}/music-analysis-backend:${IMAGE_TAG}"
                        sh "docker push ${DOCKER_REGISTRY}/music-analysis-audio:${IMAGE_TAG}"
                    }
                }
            }
        }
        
        stage('Deploy to Development') {
            steps {
                script {
                    dir('infrastructure') {
                        withKubeConfig(caCertificate: '', clusterName: '', contextName: '', credentialsId: 'k8s', namespace: 'music-analysis-dev', restrictKubeConfigAccess: false, serverUrl: '') {
                            sh "sed -i 's|IMAGE_TAG|${IMAGE_TAG}|g' *.yml"
                            sh 'kubectl apply -f namespace.yml'
                            sh 'kubectl apply -f mongodb-deployment.yml'
                            sh 'kubectl apply -f audio-service-deployment.yml'
                            sh 'kubectl apply -f backend-deployment.yml'
                            sh 'kubectl apply -f frontend-deployment.yml'
                            sh 'kubectl apply -f ingress.yml'
                        }
                    }
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    sleep(time: 60, unit: 'SECONDS')
                    sh '''
                        kubectl get pods -n music-analysis-dev
                        kubectl get services -n music-analysis-dev
                    '''
                }
            }
        }
    }
    
    post {
        always {
            emailext attachLog: true,
                subject: "'${currentBuild.result}' - Music Analysis DevSecOps Pipeline",
                body: """
                    Project: ${env.JOB_NAME}
                    Build Number: ${env.BUILD_NUMBER}
                    Build Status: ${currentBuild.result}
                    URL: ${env.BUILD_URL}
                    
                    Security Scan Results:
                    - SonarQube Quality Gate: Check Jenkins logs
                    - OWASP Dependency Check: See attached reports
                    - Trivy Vulnerability Scans: See attached reports
                    
                    Deployment Status:
                    - Development Environment: ${currentBuild.result}
                """,
                to: 'devops-team@company.com',
                attachmentsPattern: 'trivy-*.txt,dependency-check-report.xml'
        }
        success {
            slackSend channel: '#devops',
                color: 'good',
                message: "✅ Music Analysis Pipeline SUCCESS - Build #${env.BUILD_NUMBER} deployed to development"
        }
        failure {
            slackSend channel: '#devops',
                color: 'danger',
                message: "❌ Music Analysis Pipeline FAILED - Build #${env.BUILD_NUMBER} - Check logs: ${env.BUILD_URL}"
        }
    }
}
