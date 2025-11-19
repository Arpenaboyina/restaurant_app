# Jenkins Credentials Setup

## Fixed Issues

✅ **Fixed empty `post` blocks** - Added echo statements to prevent Groovy syntax errors  
✅ **Updated credential IDs** - Changed to `dockerhub` and `kubeconfig` as requested  
✅ **Made credentials optional** - Pipeline will work even without credentials configured  

## Required Credentials Setup

### 1. Docker Hub Credentials (ID: `dockerhub`)

**Purpose**: Push Docker images to Docker Hub

**Setup Steps**:
1. Go to **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
2. Click **Add Credentials**
3. Select **Username with password**
4. Configure:
   - **Username**: Your Docker Hub username
   - **Password**: Your Docker Hub password or access token
   - **ID**: `dockerhub` (must match exactly)
   - **Description**: Docker Hub credentials for restaurant app
5. Click **OK**

**Note**: If not configured, pipeline will skip registry login and push stages. Images will be built locally only.

### 2. Kubernetes Config Credentials (ID: `kubeconfig`)

**Purpose**: Provide Kubernetes cluster access for deployment

**Setup Steps**:

#### Option A: Using kubeconfig File
1. Get your kubeconfig file:
   ```bash
   cat ~/.kube/config
   ```
2. In Jenkins: **Manage Jenkins** → **Credentials** → **Add Credentials**
3. Select **Secret file**
4. Upload your kubeconfig file
5. **ID**: `kubeconfig` (must match exactly)
6. **Description**: Kubernetes kubeconfig for restaurant deployment
7. Click **OK**

#### Option B: Using Service Account Token
1. Create service account in Kubernetes:
   ```bash
   kubectl create serviceaccount jenkins -n kube-system
   kubectl create clusterrolebinding jenkins --clusterrole=cluster-admin --serviceaccount=kube-system:jenkins
   ```
2. Get the token:
   ```bash
   kubectl get secret -n kube-system | grep jenkins
   kubectl get secret <secret-name> -n kube-system -o jsonpath='{.data.token}' | base64 -d
   ```
3. Create kubeconfig file with the token
4. Upload as Secret file in Jenkins

**Note**: If not configured, Jenkins will use the default kubectl config on the Jenkins server.

## Environment Variables (Optional)

You can set these in Jenkins job configuration or as global environment variables:

- `DOCKER_REGISTRY`: `docker.io` (default) or your registry URL
- `DOCKERHUB_USER`: Your Docker Hub username (required if pushing to registry)
- `K8S_NAMESPACE`: `restaurant` (default)
- `K8S_CONTEXT`: Kubernetes context name (if multiple contexts)

## Testing the Pipeline

### Without Credentials (Local Build Only)
The pipeline will:
- ✅ Checkout code
- ✅ Run tests
- ✅ Build Docker images locally
- ⚠️ Skip registry login (warning message)
- ⚠️ Skip image push (warning message)
- ✅ Deploy to Kubernetes (if kubectl is configured on Jenkins server)

### With Credentials (Full CI/CD)
The pipeline will:
- ✅ Checkout code
- ✅ Run tests
- ✅ Build Docker images
- ✅ Login to Docker Hub
- ✅ Tag and push images to registry
- ✅ Deploy to Kubernetes using kubeconfig credentials

## Troubleshooting

### Error: "Credentials 'dockerhub' not found"
**Solution**: This is expected if credentials are not configured. Pipeline will continue with local builds only.

### Error: "Credentials 'kubeconfig' not found"
**Solution**: This is expected if credentials are not configured. Pipeline will use default kubectl config.

### Error: "No steps specified for branch"
**Solution**: ✅ Fixed - Added echo statements to `post` blocks

### Error: Docker login fails
**Solution**: 
- Verify Docker Hub username and password are correct
- Check if using access token instead of password (recommended)
- Ensure credentials ID is exactly `dockerhub`

### Error: kubectl not found
**Solution**: Install kubectl on Jenkins server:
```bash
# On Jenkins server
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

## Current Pipeline Behavior

The pipeline is now **resilient** and will:
- Work without any credentials (local builds only)
- Work with just Docker Hub credentials (build + push)
- Work with just Kubernetes credentials (deploy)
- Work with both credentials (full CI/CD)

All credentials are **optional** and the pipeline will gracefully handle missing credentials with warning messages.

