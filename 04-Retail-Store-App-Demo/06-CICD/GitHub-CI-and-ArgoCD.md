# CI/CD with GitHub Actions + ArgoCD Integration

Complete setup for Continuous Integration with GitHub Actions and Continuous Deployment with ArgoCD for the retail store application.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │    │  GitHub Actions │    │   Amazon ECR    │
│                 │───▶│       (CI)      │───▶│                 │
│  Source Code    │    │  Build + Test   │    │ Container Images│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   EKS Cluster   │◀───│     ArgoCD      │◀───│   Config Repo   │
│                 │    │      (CD)       │    │                 │
│ Running Pods    │    │ GitOps Deploy  │    │ K8s Manifests   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Separation of Concerns

### **GitHub Actions (CI Only)**
- ✅ Code checkout and testing
- ✅ Build application artifacts
- ✅ Create and push Docker images to ECR
- ✅ Security scanning
- ✅ Update Kubernetes manifests with new image tags
- ❌ No direct deployment to Kubernetes

### **ArgoCD (CD Only)**
- ✅ Monitor Git repository for manifest changes
- ✅ Automatically sync changes to Kubernetes cluster
- ✅ Health monitoring and rollback capabilities
- ✅ Multi-environment deployments
- ❌ No building or testing

## Updated CI Pipeline (GitHub Actions)

### **Simplified CI Pipeline**
```yaml
name: Cart Service CI Pipeline

on:
  push:
    branches: [ main, develop ]
    paths: [ 'src/cart/**' ]

env:
  AWS_REGION: ap-south-1
  ECR_REPOSITORY: retail-store/cart-service
  CONFIG_REPO: retail-store-k8s-config

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout source code
      uses: actions/checkout@v4
      
    - name: Set up JDK 21
      uses: actions/setup-java@v4
      with:
        java-version: '21'
        distribution: 'corretto'
        
    - name: Cache Maven dependencies
      uses: actions/cache@v4
      with:
        path: ~/.m2
        key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
        
    - name: Run tests
      working-directory: ./src/cart
      run: ./mvnw test
      
    - name: Build application
      working-directory: ./src/cart
      run: ./mvnw clean package -DskipTests
      
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v2
      
    - name: Build and push Docker image
      working-directory: ./src/cart
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        echo "IMAGE_URI=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT
      id: build
        
    - name: Update Kubernetes manifests
      env:
        IMAGE_URI: ${{ steps.build.outputs.IMAGE_URI }}
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      run: |
        # Clone config repository
        git clone https://github.com/your-org/$CONFIG_REPO.git
        cd $CONFIG_REPO
        
        # Update image tag in manifest
        sed -i "s|image: .*cart-service.*|image: $IMAGE_URI|g" environments/*/cart-service.yaml
        
        # Commit and push changes
        git config user.name "github-actions[bot]"
        git config user.email "github-actions[bot]@users.noreply.github.com"
        git add .
        git commit -m "Update cart-service image to ${{ github.sha }}"
        git push
```

## ArgoCD Setup

### **1. Install ArgoCD on EKS**
```bash
# Create ArgoCD namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods to be ready
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd
```

### **2. Access ArgoCD UI**
```bash
# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Port forward to access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Access at: https://localhost:8080
# Username: admin
# Password: <from above command>
```

### **3. Configure ECR Access for ArgoCD**
```yaml
# ecr-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: ecr-secret
  namespace: argocd
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
stringData:
  type: helm
  name: ecr
  url: <your-account-id>.dkr.ecr.ap-south-1.amazonaws.com
  username: AWS
  password: <ecr-token>
```

## Repository Structure

### **Source Code Repository** (retail-store-sample-app)
```
retail-store-sample-app/
├── src/
│   ├── cart/
│   │   ├── Dockerfile
│   │   ├── pom.xml
│   │   └── src/
│   ├── catalog/
│   ├── checkout/
│   ├── orders/
│   └── ui/
└── .github/
    └── workflows/
        ├── cart-service.yml
        ├── catalog-service.yml
        └── ...
```

### **Config Repository** (retail-store-k8s-config)
```
retail-store-k8s-config/
├── applications/
│   ├── cart-service.yaml
│   ├── catalog-service.yaml
│   └── ...
├── environments/
│   ├── development/
│   │   ├── cart-service.yaml
│   │   ├── catalog-service.yaml
│   │   └── kustomization.yaml
│   ├── staging/
│   └── production/
└── base/
    ├── cart-service/
    │   ├── deployment.yaml
    │   ├── service.yaml
    │   └── kustomization.yaml
    └── ...
```

## ArgoCD Application Configuration

### **Cart Service Application**
```yaml
# applications/cart-service.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: cart-service
  namespace: argocd
spec:
  project: retail-store
  source:
    repoURL: https://github.com/your-org/retail-store-k8s-config
    targetRevision: main
    path: environments/production
    kustomize:
      namePrefix: cart-
  destination:
    server: https://kubernetes.default.svc
    namespace: retail-store
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

### **Kubernetes Manifest Example**
```yaml
# environments/production/cart-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cart-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cart-service
  template:
    metadata:
      labels:
        app: cart-service
    spec:
      containers:
      - name: cart
        image: 123456789.dkr.ecr.ap-south-1.amazonaws.com/retail-store/cart-service:abc123
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "production"
---
apiVersion: v1
kind: Service
metadata:
  name: cart-service
spec:
  selector:
    app: cart-service
  ports:
  - port: 80
    targetPort: 8080
```

## Workflow Process

### **1. Developer Workflow**
```bash
# 1. Developer pushes code
git add .
git commit -m "Fix cart service bug"
git push origin main

# 2. GitHub Actions CI pipeline triggers automatically
# 3. Tests run, image builds, pushes to ECR
# 4. CI updates Kubernetes manifests in config repo
# 5. ArgoCD detects manifest changes
# 6. ArgoCD deploys to Kubernetes automatically
```

### **2. Deployment Flow**
```
Code Push → CI Pipeline → ECR Image → Update Manifests → ArgoCD Sync → K8s Deploy
    ↓           ↓            ↓            ↓              ↓           ↓
  30sec       3min        30sec        10sec          30sec       1min
```

## Environment Management

### **Development Environment**
```yaml
# environments/development/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
- ../../base/cart-service

patchesStrategicMerge:
- cart-service.yaml

namePrefix: dev-
namespace: retail-store-dev

replicas:
- name: cart-service
  count: 1
```

### **Production Environment**
```yaml
# environments/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
- ../../base/cart-service

patchesStrategicMerge:
- cart-service.yaml

namePrefix: prod-
namespace: retail-store-prod

replicas:
- name: cart-service
  count: 3
```

## ArgoCD Benefits

### **GitOps Advantages**
- ✅ **Declarative**: Infrastructure as Code
- ✅ **Auditable**: All changes tracked in Git
- ✅ **Rollback**: Easy revert to previous versions
- ✅ **Multi-environment**: Consistent deployments across environments

### **Operational Benefits**
- ✅ **Automated sync**: No manual kubectl commands
- ✅ **Health monitoring**: Real-time application status
- ✅ **Drift detection**: Alerts when cluster state differs from Git
- ✅ **Progressive delivery**: Canary and blue-green deployments

## Monitoring & Observability

### **ArgoCD Dashboard**
- **Application health**: Green/Yellow/Red status
- **Sync status**: In-sync/Out-of-sync/Syncing
- **Resource tree**: Visual representation of K8s resources
- **Event history**: Deployment timeline and logs

### **Slack Notifications** (Optional)
```yaml
# argocd-notifications-cm.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-notifications-cm
  namespace: argocd
data:
  service.slack: |
    token: $slack-token
  template.app-deployed: |
    message: |
      {{if eq .serviceType "slack"}}:white_check_mark:{{end}} Application {{.app.metadata.name}} is now running new version.
  trigger.on-deployed: |
    - description: Application is synced and healthy
      send:
      - app-deployed
      when: app.status.operationState.phase in ['Succeeded'] and app.status.health.status == 'Healthy'
```

## Security Considerations

### **RBAC Configuration**
```yaml
# argocd-rbac-cm.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
data:
  policy.default: role:readonly
  policy.csv: |
    p, role:admin, applications, *, */*, allow
    p, role:admin, clusters, *, *, allow
    p, role:admin, repositories, *, *, allow
    g, retail-store-admins, role:admin
```

### **Repository Access**
```yaml
# Private repository access
apiVersion: v1
kind: Secret
metadata:
  name: private-repo
  namespace: argocd
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
stringData:
  type: git
  url: https://github.com/your-org/retail-store-k8s-config
  password: <github-token>
  username: <github-username>
```

## Troubleshooting

### **Common Issues**

#### **ArgoCD Can't Pull Images from ECR**
```bash
# Create ECR secret
kubectl create secret docker-registry ecr-secret \
  --docker-server=<account-id>.dkr.ecr.ap-south-1.amazonaws.com \
  --docker-username=AWS \
  --docker-password=$(aws ecr get-login-password --region ap-south-1) \
  --namespace=retail-store
```

#### **Application Stuck in Progressing State**
```bash
# Check application status
argocd app get cart-service

# Force refresh
argocd app sync cart-service --force

# Check pod logs
kubectl logs -f deployment/cart-service -n retail-store
```

#### **Manifest Update Not Triggering Sync**
```bash
# Check if ArgoCD detected changes
argocd app diff cart-service

# Manual sync
argocd app sync cart-service

# Check webhook configuration
argocd repo get https://github.com/your-org/retail-store-k8s-config
```

## Best Practices

### **Repository Management**
- ✅ Separate source code and config repositories
- ✅ Use semantic versioning for releases
- ✅ Implement branch protection rules
- ✅ Regular security scanning of manifests

### **Deployment Strategy**
- ✅ Use Kustomize for environment-specific configurations
- ✅ Implement health checks in all services
- ✅ Set resource limits and requests
- ✅ Use rolling updates for zero-downtime deployments

### **Security**
- ✅ Least privilege RBAC policies
- ✅ Encrypted secrets management
- ✅ Network policies for service isolation
- ✅ Regular ArgoCD updates

This setup provides a complete CI/CD solution where GitHub Actions handles the build and test phases, while ArgoCD manages the deployment and ongoing synchronization with your Kubernetes cluster.
