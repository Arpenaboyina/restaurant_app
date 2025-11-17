# Quick Start: Jenkins CI/CD Setup

## After Pushing to GitHub

### 1. Push Your Code to GitHub

```bash
git add .
git commit -m "Add Jenkins CI/CD pipeline"
git push origin main
```

### 2. Jenkins Setup Checklist

- [ ] Jenkins is installed and running
- [ ] Docker is installed on Jenkins server
- [ ] kubectl is configured on Jenkins server
- [ ] GitHub repository is accessible from Jenkins

### 3. Create Jenkins Pipeline Job

1. **Jenkins Dashboard** → **New Item**
2. Name: `restaurant-pipeline`
3. Type: **Pipeline** → **OK**
4. **Pipeline** section:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: Your GitHub repo URL
   - **Branch**: `*/main`
   - **Script Path**: `Jenkinsfile`
5. **Save**

### 4. Configure Credentials (Optional)

**For Docker Hub** (if pushing images):
- **Manage Jenkins** → **Credentials** → **Add Credentials**
- Type: Username with password
- ID: `docker-registry-creds`
- Username: Your Docker Hub username
- Password: Your Docker Hub password

### 5. Run Your First Build

1. Go to your pipeline job
2. Click **Build Now**
3. Watch the build progress

### 6. What the Pipeline Does

✅ Checks out code from GitHub  
✅ Runs tests (if configured)  
✅ Builds Docker images  
✅ Pushes to registry (if credentials configured)  
✅ Deploys to Kubernetes (on main/master branch)  

## Quick Commands

```bash
# Check Jenkins is running
sudo systemctl status jenkins

# View Jenkins logs
sudo tail -f /var/log/jenkins/jenkins.log

# Test kubectl from Jenkins user
sudo -u jenkins kubectl get nodes

# Test docker from Jenkins user
sudo -u jenkins docker ps
```

## Common Issues

**"docker: command not found"**
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

**"kubectl: command not found"**
```bash
# Install kubectl and copy config
sudo mkdir -p /var/lib/jenkins/.kube
sudo cp ~/.kube/config /var/lib/jenkins/.kube/
sudo chown -R jenkins:jenkins /var/lib/jenkins/.kube
```

**Build fails on tests**
- The pipeline is configured to continue even if tests fail
- You can add real tests later or remove test stages

## Next Steps

1. Set up GitHub webhook for automatic builds
2. Configure notifications (email/Slack)
3. Add actual tests to your application
4. Set up different environments (dev/staging/prod)

For detailed setup, see [JENKINS_SETUP.md](JENKINS_SETUP.md)

