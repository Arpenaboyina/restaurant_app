# Jenkins CI/CD Setup Guide

This guide will help you set up Jenkins CI/CD pipeline for the Restaurant application after pushing to GitHub.

## Prerequisites

1. **GitHub Repository**: Your code should be pushed to GitHub
2. **Jenkins Server**: Jenkins should be installed and running
3. **Docker**: Docker should be installed on Jenkins server
4. **Kubernetes Access**: Jenkins should have kubectl configured with access to your cluster
5. **Docker Registry**: (Optional) Docker Hub or other registry for storing images

## Step 1: Push Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Restaurant application with Jenkins CI/CD"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Install Required Jenkins Plugins

In Jenkins, go to **Manage Jenkins** → **Plugins** and install:

- **Git Plugin** (usually pre-installed)
- **Docker Pipeline Plugin**
- **Kubernetes Plugin** (if deploying to K8s)
- **Pipeline Plugin**
- **Blue Ocean** (optional, for better UI)

## Step 3: Configure Jenkins Credentials

### 3.1 Docker Registry Credentials (Optional)

If you want to push images to Docker Hub:

1. Go to **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
2. Click **Add Credentials**
3. Select **Username with password**
4. Enter:
   - **Username**: Your Docker Hub username
   - **Password**: Your Docker Hub password/token
   - **ID**: `docker-registry-creds` (must match Jenkinsfile)
   - **Description**: Docker Hub credentials

### 3.2 Kubernetes Credentials (If needed)

If Jenkins needs to authenticate to Kubernetes:

1. Create a service account in Kubernetes:
```bash
kubectl create serviceaccount jenkins -n kube-system
kubectl create clusterrolebinding jenkins --clusterrole=cluster-admin --serviceaccount=kube-system:jenkins
kubectl get secret -n kube-system | grep jenkins
kubectl get secret <secret-name> -n kube-system -o jsonpath='{.data.token}' | base64 -d
```

2. Add the token as a secret in Jenkins credentials

## Step 4: Configure Jenkins Environment Variables

Go to **Manage Jenkins** → **Configure System** → **Global Properties** → **Environment Variables**:

Add these variables (or configure in Jenkins job):

- `DOCKER_REGISTRY`: `docker.io` (default) or your registry URL
- `DOCKERHUB_USER`: Your Docker Hub username (if using Docker Hub)
- `IMAGE_BACKEND`: `restaurant/backend` (default)
- `IMAGE_FRONTEND`: `restaurant/frontend` (default)
- `K8S_NAMESPACE`: `restaurant` (default)
- `K8S_CONTEXT`: Your Kubernetes context name (if multiple contexts)

## Step 5: Create Jenkins Pipeline Job

### Option A: Using Jenkins UI

1. Click **New Item** in Jenkins
2. Enter job name (e.g., `restaurant-pipeline`)
3. Select **Pipeline** and click **OK**
4. In **Pipeline** section:
   - **Definition**: Select **Pipeline script from SCM**
   - **SCM**: Select **Git**
   - **Repository URL**: `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git`
   - **Credentials**: (if private repo) Add GitHub credentials
   - **Branches to build**: `*/main` or `*/master`
   - **Script Path**: `Jenkinsfile`
5. Click **Save**

### Option B: Using Blue Ocean

1. Click **Open Blue Ocean** in Jenkins sidebar
2. Click **New Pipeline**
3. Select **GitHub** or **Git**
4. Enter repository URL
5. Jenkins will automatically detect the `Jenkinsfile`

## Step 6: Configure Pipeline Settings

### For Local Development (No Docker Registry)

If you're not pushing to a registry, the pipeline will:
- Build images locally
- Deploy directly to Kubernetes (if on same machine)
- Skip the "Tag & Push" stage

### For Production (With Docker Registry)

1. Ensure `docker-registry-creds` credentials are configured
2. Set `DOCKERHUB_USER` environment variable
3. Pipeline will tag and push images to registry
4. Update Kubernetes deployments to pull from registry

## Step 7: Update Kubernetes Deployments (If Using Registry)

If you're pushing images to a registry, update the deployment files:

**k8s/backend-deployment.yaml**:
```yaml
image: YOUR_DOCKERHUB_USER/restaurant/backend:latest
imagePullPolicy: Always
```

**k8s/frontend-deployment.yaml**:
```yaml
image: YOUR_DOCKERHUB_USER/restaurant/frontend:latest
imagePullPolicy: Always
```

## Step 8: Run the Pipeline

1. Go to your Jenkins job
2. Click **Build Now**
3. Monitor the build progress in **Console Output**

## Pipeline Stages Explained

1. **Checkout**: Clones code from GitHub
2. **Backend Test**: Runs backend tests (if configured)
3. **Frontend Test**: Runs frontend tests (if configured)
4. **Build Images**: Builds Docker images for backend and frontend
5. **Login Registry**: Logs into Docker registry (if credentials configured)
6. **Tag & Push**: Tags and pushes images to registry (if credentials configured)
7. **Deploy to Kubernetes**: Deploys to K8s (only on main/master/production branches)

## Troubleshooting

### Issue: "docker: command not found"
**Solution**: Install Docker on Jenkins server and add Jenkins user to docker group:
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Issue: "kubectl: command not found"
**Solution**: Install kubectl on Jenkins server and configure kubeconfig:
```bash
# Install kubectl
# Copy kubeconfig to Jenkins home
sudo mkdir -p /var/lib/jenkins/.kube
sudo cp ~/.kube/config /var/lib/jenkins/.kube/
sudo chown -R jenkins:jenkins /var/lib/jenkins/.kube
```

### Issue: "Permission denied" errors
**Solution**: Ensure Jenkins user has proper permissions:
```bash
sudo chown -R jenkins:jenkins /var/lib/jenkins
```

### Issue: Tests failing
**Solution**: The pipeline is configured to continue even if tests fail. You can:
- Add actual tests to your application
- Remove test stages if not needed
- Make tests optional

### Issue: Kubernetes deployment fails
**Solution**: 
- Check if kubectl is configured correctly
- Verify namespace exists: `kubectl get namespace restaurant`
- Check if Jenkins has RBAC permissions in Kubernetes

## Manual Deployment Alternative

If Jenkins is not set up, you can deploy manually using the deploy script:

```bash
cd k8s
chmod +x deploy.sh
./deploy.sh restaurant
```

## Next Steps

1. **Add Webhooks**: Configure GitHub webhooks to trigger builds on push
2. **Add Notifications**: Configure email/Slack notifications for build status
3. **Add Tests**: Write actual tests for backend and frontend
4. **Add Security Scanning**: Add vulnerability scanning for Docker images
5. **Add Rollback**: Implement rollback strategy for failed deployments

## GitHub Webhook Setup (Optional)

To automatically trigger builds on git push:

1. In GitHub repo: **Settings** → **Webhooks** → **Add webhook**
2. **Payload URL**: `http://YOUR_JENKINS_URL/github-webhook/`
3. **Content type**: `application/json`
4. **Events**: Select **Just the push event**
5. Click **Add webhook**

Then in Jenkins job:
- **Build Triggers** → Check **GitHub hook trigger for GITScm polling**

## Environment-Specific Deployments

To deploy to different environments, you can:

1. Create separate branches (dev, staging, production)
2. Update Jenkinsfile to deploy based on branch
3. Use different namespaces or clusters per environment

Example:
```groovy
stage('Deploy to Kubernetes') {
  when {
    anyOf {
      branch 'main'     // Production
      branch 'staging'   // Staging
      branch 'dev'       // Development
    }
  }
  steps {
    script {
      def namespace = env.BRANCH_NAME == 'main' ? 'restaurant-prod' : 
                     env.BRANCH_NAME == 'staging' ? 'restaurant-staging' : 
                     'restaurant-dev'
      // Deploy to appropriate namespace
    }
  }
}
```

## Support

For issues or questions:
- Check Jenkins console output for detailed error messages
- Review Kubernetes events: `kubectl get events -n restaurant`
- Check pod logs: `kubectl logs -n restaurant deployment/frontend`

