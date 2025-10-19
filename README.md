# Motorola-Radio-Group-Call-Management-API
Job task for Motorola Solutions

Versions:
Node: v20.9.0
Kind: kind v0.30.0 go1.24.6 windows/amd64
Docker: Docker version 28.5.1, build e180ab8

Step 1:
Clone Repository
git clone <Repo-url>

Step 2: 
Build docker image
docker build -t motorola-radio-group-call-management-api-api:latest .

Step 3:
Create Kind cluster with port configuration
kind create cluster --name my-cluster --config kind-config.yaml

Step 4:
Load docker Image into Kind cluster
kind load docker-image motorola-radio-group-call-management-api-api:latest --name my-cluster

Step 5:
Deploy application to Kubernetes
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

Optional check status for pod
kubectl get pods
kubectl get svc

Step 6:
Access API at http://localhost:30080