#!/bin/bash

# Kubernetes deployment script for Restaurant application
# Usage: ./deploy.sh [namespace]

set -e

NAMESPACE=${1:-restaurant}

echo "Deploying Restaurant application to namespace: $NAMESPACE"

# Create namespace
echo "Creating namespace..."
kubectl apply -f namespace.yaml

# Wait for namespace to be ready
kubectl wait --for=condition=Active namespace/$NAMESPACE --timeout=60s || true

# Deploy MongoDB
echo "Deploying MongoDB..."
kubectl apply -f mongo-statefulset.yaml

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
kubectl wait --for=condition=ready pod -l app=mongo -n $NAMESPACE --timeout=300s

# Deploy Backend
echo "Deploying Backend..."
kubectl apply -f backend-deployment.yaml

# Deploy Frontend
echo "Deploying Frontend..."
kubectl apply -f frontend-deployment.yaml

# Deploy Ingress (optional)
if [ -f ingress.yaml ]; then
    echo "Deploying Ingress..."
    kubectl apply -f ingress.yaml
fi

# Deploy HPA (optional)
if [ -f hpa.yaml ]; then
    echo "Deploying HorizontalPodAutoscalers..."
    kubectl apply -f hpa.yaml
fi

# Wait for deployments to be ready
echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=available deployment/backend -n $NAMESPACE --timeout=300s
kubectl wait --for=condition=available deployment/frontend -n $NAMESPACE --timeout=300s

echo "Deployment completed successfully!"
echo ""
echo "To check status:"
echo "  kubectl get all -n $NAMESPACE"
echo ""
echo "To view logs:"
echo "  kubectl logs -f deployment/backend -n $NAMESPACE"
echo "  kubectl logs -f deployment/frontend -n $NAMESPACE"

