pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "restaurant-backend"
        FRONTEND_IMAGE = "restaurant-frontend"
    }

    stages {

        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Backend Test') {
            steps {
                dir('backend') {
                    bat """
                        node -v
                        npm -v
                        npm ci
                    """
                }
            }
        }

        stage('Frontend Test') {
            steps {
                dir('frontend') {
                    bat """
                        node -v
                        npm -v
                        npm ci
                    """
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                bat """
                    docker build --no-cache -t ${BACKEND_IMAGE}:latest backend
                    docker build --no-cache -t ${FRONTEND_IMAGE}:latest frontend
                """
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DH_USER',
                    passwordVariable: 'DH_PASS'
                )]) {
                    bat """
                        echo %DH_PASS% | docker login -u %DH_USER% --password-stdin
                    """
                }
            }
        }

        stage('Push Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DH_USER',
                    passwordVariable: 'DH_PASS'
                )]) {
                    bat """
                        docker tag restaurant-backend:latest %DH_USER%/restaurant-backend:latest
                        docker push %DH_USER%/restaurant-backend:latest

                        docker tag restaurant-frontend:latest %DH_USER%/restaurant-frontend:latest
                        docker push %DH_USER%/restaurant-frontend:latest
                    """
                }
            }
        }

    //     stage('Deploy to Kubernetes') {
    //         steps {
    //             withCredentials([
    //                 file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE'),
    //                 usernamePassword(
    //                     credentialsId: 'dockerhub',
    //                     usernameVariable: 'DH_USER',
    //                     passwordVariable: 'DH_PASS'
    //                 )
    //             ]) {

    //                 bat """
    //                     set KUBECONFIG=%KUBECONFIG_FILE%

    //                     echo Applying Kubernetes Manifests...

    //                     kubectl apply -f k8s\\namespace.yaml
    //                     kubectl apply -f k8s\\mongo-statefulset.yaml
    //                     kubectl apply -f k8s\\backend-deployment.yaml
    //                     kubectl apply -f k8s\\frontend-deployment.yaml
    //                     kubectl apply -f k8s\\ingress.yaml

    //                     echo Updating deployment images to Docker Hub...

    //                     kubectl set image deployment/backend backend=%DH_USER%/restaurant-backend:latest -n restaurant
    //                     kubectl set image deployment/frontend frontend=%DH_USER%/restaurant-frontend:latest -n restaurant

    //                     echo Waiting for rollout...
    //                     kubectl rollout status deployment/backend -n restaurant --timeout=300s
    //                     kubectl rollout status deployment/frontend -n restaurant --timeout=300s
    //                 """
    //             }
    //         }
    //     }
    // }

        stage('Deploy to Kubernetes') {
    steps {
        withCredentials([
            file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE'),
            usernamePassword(
                credentialsId: 'dockerhub',
                usernameVariable: 'DH_USER',
                passwordVariable: 'DH_PASS'
            )
        ]) {

            bat """
                set KUBECONFIG=%KUBECONFIG_FILE%

                echo Applying Kubernetes Manifests...

                kubectl apply -f k8s\\namespace.yaml
                kubectl apply -f k8s\\mongo-statefulset.yaml
                kubectl apply -f k8s\\backend-deployment.yaml
                kubectl apply -f k8s\\frontend-deployment.yaml
                kubectl apply -f k8s\\ingress.yaml

                echo Updating deployment images to Docker Hub...

                kubectl set image deployment/backend backend=%DH_USER%/restaurant-backend:latest -n restaurant
                kubectl set image deployment/frontend frontend=%DH_USER%/restaurant-frontend:latest -n restaurant

                echo Restarting pods so they pull latest images...
                kubectl rollout restart deployment/backend -n restaurant
                kubectl rollout restart deployment/frontend -n restaurant

                echo Waiting for rollout...
                kubectl rollout status deployment/backend -n restaurant --timeout=300s
                kubectl rollout status deployment/frontend -n restaurant --timeout=300s
            """
        }
    }
}


    post {
        always { cleanWs() }
        success { echo "Pipeline succeeded!" }
        failure { echo "Pipeline failed!" }
    }
}


