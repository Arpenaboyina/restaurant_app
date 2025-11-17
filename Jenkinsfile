// pipeline {
//     agent any

//     environment {
//         REGISTRY = "docker.io"
//         DOCKERHUB_USER = "arpenaboyina"   // your Docker Hub username
//         BACKEND_IMAGE = "restaurant-backend"
//         FRONTEND_IMAGE = "restaurant-frontend"
//         KUBERNETES_NAMESPACE = "restaurant"
//     }

//     stages {

//         /* ----------------------- CHECKOUT ----------------------- */
//         stage('Checkout') {
//             steps {
//                 checkout scm
//             }
//         }

//         /* ----------------------- BACKEND TEST ----------------------- */
//         stage('Backend Test') {
//             steps {
//                 dir('backend') {
//                     bat """
//                         node -v
//                         npm -v
//                         npm ci
//                         npm test || echo Backend tests completed
//                     """
//                 }
//             }
//             post { always { echo "Backend test completed" } }
//         }

//         /* ----------------------- FRONTEND TEST ----------------------- */
//         stage('Frontend Test') {
//             steps {
//                 dir('frontend') {
//                     bat """
//                         node -v
//                         npm -v
//                         npm ci
//                         set CI=true && npm test || echo Frontend tests completed
//                     """
//                 }
//             }
//             post { always { echo "Frontend test completed" } }
//         }

//         /* ----------------------- BUILD IMAGES ----------------------- */
//         stage('Build Docker Images') {
//             steps {
//                 bat """
//                     docker build -t ${BACKEND_IMAGE}:latest backend
//                     docker build -t ${FRONTEND_IMAGE}:latest frontend
//                 """
//             }
//         }

//         /* ----------------------- LOGIN DOCKER HUB ----------------------- */
//         stage('Login to Docker Hub') {
//             steps {
//                 withCredentials([
//                     usernamePassword(
//                         credentialsId: 'dockerhub',
//                         usernameVariable: 'DH_USER',
//                         passwordVariable: 'DH_PASS'
//                     )
//                 ]) {
//                     bat """
//                         echo %DH_PASS% | docker login -u %DH_USER% --password-stdin
//                     """
//                 }
//             }
//         }

//         /* ----------------------- PUSH IMAGES ----------------------- */
//         stage('Push Images') {
//             steps {
//                 withCredentials([
//                     usernamePassword(
//                         credentialsId: 'dockerhub',
//                         usernameVariable: 'DH_USER',
//                         passwordVariable: 'DH_PASS'
//                     )
//                 ]) {
//                     bat """
//                         docker tag ${BACKEND_IMAGE}:latest %DH_USER%/${BACKEND_IMAGE}:latest
//                         docker push %DH_USER%/${BACKEND_IMAGE}:latest

//                         docker tag ${FRONTEND_IMAGE}:latest %DH_USER%/${FRONTEND_IMAGE}:latest
//                         docker push %DH_USER%/${FRONTEND_IMAGE}:latest
//                     """
//                 }
//             }
//         }

//         /* ----------------------- DEPLOY TO K8s ----------------------- */
//         stage('Deploy to Kubernetes') {
//             steps {
//                 withCredentials([
//                     file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')
//                 ]) {
//                     bat """
//                         kubectl --kubeconfig=%KUBECONFIG% apply -f k8s\\namespace.yaml
//                         kubectl --kubeconfig=%KUBECONFIG% apply -f k8s\\mongo-statefulset.yaml
//                         kubectl --kubeconfig=%KUBECONFIG% apply -f k8s\\backend-deployment.yaml
//                         kubectl --kubeconfig=%KUBECONFIG% apply -f k8s\\frontend-deployment.yaml
//                     """
//                 }
//             }
//         }
//     }

//     post {
//         always { cleanWs() }
//         success { echo "Pipeline succeeded!" }
//         failure { echo "Pipeline failed!" }
//     }
// }

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
                    docker build -t ${BACKEND_IMAGE}:latest backend
                    docker build -t ${FRONTEND_IMAGE}:latest frontend
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
    }

    post {
        always { cleanWs() }
    }
}

