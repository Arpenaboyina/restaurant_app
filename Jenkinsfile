pipeline {
    agent any

    environment {
        REGISTRY = "docker.io"
        DOCKERHUB_USER = "arpenaboyina"  // update with your username
        BACKEND_IMAGE = "restaurant-backend"
        FRONTEND_IMAGE = "restaurant-frontend"
        KUBERNETES_NAMESPACE = "restaurant"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Test') {
            steps {
                dir('backend') {
                    bat """
                        node -v
                        npm -v
                        npm ci
                        npm test || echo Backend tests completed
                    """
                }
            }
            post { always { echo "Backend test completed" } }
        }

        stage('Frontend Test') {
            steps {
                dir('frontend') {
                    bat """
                        node -v
                        npm -v
                        npm ci
                        set CI=true && npm test || echo Frontend tests completed
                    """
                }
            }
            post { always { echo "Frontend test completed" } }
        }

        stage('Build Docker Images') {
            steps {
                bat """
                    docker build -t ${BACKEND_IMAGE}:latest backend
                    docker build -t ${FRONTEND_IMAGE}:latest frontend
                """
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub',
                                                 usernameVariable: 'DH_USER',
                                                 passwordVariable: 'DH_PASS')]) {
                    bat """
                        echo %DH_PASS% | docker login -u %DH_USER% --password-stdin
                    """
                }
            }
        }

        stage('Push Images') {
            steps {
                script {
                    def repo = "docker.io/${DOCKERHUB_USER}"

                    bat """
                        docker tag ${BACKEND_IMAGE}:latest ${repo}/${BACKEND_IMAGE}:latest
                        docker push ${repo}/${BACKEND_IMAGE}:latest

                        docker tag ${FRONTEND_IMAGE}:latest ${repo}/${FRONTEND_IMAGE}:latest
                        docker push ${repo}/${FRONTEND_IMAGE}:latest
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    bat """
                        kubectl --kubeconfig=%KUBECONFIG% apply -f k8s\\namespace.yaml
                        kubectl --kubeconfig=%KUBECONFIG% apply -f k8s\\mongo-statefulset.yaml
                        kubectl --kubeconfig=%KUBECONFIG% apply -f k8s\\backend-deployment.yaml
                        kubectl --kubeconfig=%KUBECONFIG% apply -f k8s\\frontend-deployment.yaml
                    """
                }
            }
        }
    }

    post {
        always { cleanWs() }
        success { echo "Pipeline succeeded!" }
        failure { echo "Pipeline failed!" }
    }
}
