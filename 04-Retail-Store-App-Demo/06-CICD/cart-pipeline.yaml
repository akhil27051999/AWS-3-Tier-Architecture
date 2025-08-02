# GitHub Actions CI/CD Pipeline - Retail Store Services

Complete CI/CD pipeline for building, testing, and deploying retail store microservices to Amazon ECR using GitHub Actions.

## Pipeline Overview

This pipeline automates the entire process from code commit to production-ready container images:

```
Code Push → Tests → Build → Docker Image → ECR Push → Security Scan → Notify
```

## Pipeline Features

### **🔄 Smart Triggering**
- **Path-based filtering**: Only runs when service-specific files change
- **Branch protection**: Runs on `main` and `develop` branches
- **Pull request validation**: Tests PRs before merge

### **🏗️ Build Optimization**
- **Dependency caching**: Maven dependencies cached for faster builds
- **Multi-stage process**: Test → Build → Package → Deploy
- **Parallel execution**: Multiple jobs run simultaneously when possible

### **🐳 Container Management**
- **Multi-tag strategy**: Both commit SHA and `latest` tags
- **ECR integration**: Direct push to Amazon Elastic Container Registry
- **Image optimization**: Uses multi-stage Dockerfiles for minimal size

### **🔒 Security & Quality**
- **Automated testing**: Runs unit tests before building
- **Vulnerability scanning**: Trivy scans for security issues
- **SARIF integration**: Security results in GitHub Security tab
- **Credential management**: AWS credentials via GitHub Secrets

## Pipeline Configuration

### **File Structure**
```
.github/
└── workflows/
    ├── cart-service.yml
    ├── catalog-service.yml
    ├── checkout-service.yml
    ├── orders-service.yml
    └── ui-service.yml
```

### **Environment Variables**
```yaml
env:
  AWS_REGION: ap-south-1                    # AWS region for ECR
  ECR_REPOSITORY: retail-store/cart-service # ECR repository name
  SERVICE_NAME: cart-service                # Service identifier
```

## Pipeline Stages Explained

### **Stage 1: Code Checkout & Setup**
```yaml
- name: Checkout code
  uses: actions/checkout@v4
  
- name: Set up JDK 21
  uses: actions/setup-java@v4
  with:
    java-version: '21'
    distribution: 'corretto'
```
**Purpose**: Downloads source code and sets up build environment
**Duration**: ~30 seconds

### **Stage 2: Dependency Management**
```yaml
- name: Cache Maven dependencies
  uses: actions/cache@v4
  with:
    path: ~/.m2
    key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
```
**Purpose**: Caches Maven dependencies to speed up subsequent builds
**Benefit**: Reduces build time from 3-5 minutes to 30-60 seconds

### **Stage 3: Testing**
```yaml
- name: Run tests
  working-directory: ./src/cart
  run: ./mvnw test
```
**Purpose**: Executes unit tests to ensure code quality
**Failure Action**: Pipeline stops if tests fail

### **Stage 4: Application Build**
```yaml
- name: Build application
  working-directory: ./src/cart
  run: ./mvnw clean package -DskipTests
```
**Purpose**: Compiles source code into deployable JAR file
**Output**: `target/cart-0.0.1-SNAPSHOT.jar`

### **Stage 5: AWS Authentication**
```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```
**Purpose**: Authenticates with AWS for ECR access
**Security**: Uses GitHub Secrets for credential management

### **Stage 6: Container Operations**
```yaml
- name: Build, tag, and push image to Amazon ECR
  env:
    ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
    IMAGE_TAG: ${{ github.sha }}
  run: |
    docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
    docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:latest .
    docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
    docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
```
**Purpose**: Creates and pushes Docker images to ECR
**Tags**: 
- `latest` - Always points to most recent build
- `<commit-sha>` - Specific version for rollbacks

### **Stage 7: Security Scanning**
```yaml
- name: Security scan with Trivy
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY }}:${{ github.sha }}
    format: 'sarif'
```
**Purpose**: Scans container image for vulnerabilities
**Integration**: Results appear in GitHub Security tab

## Setup Instructions

### **1. GitHub Secrets Configuration**
Navigate to: `Repository → Settings → Secrets and variables → Actions`

Add these secrets:
```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

### **2. AWS IAM Policy**
Create IAM user with this policy:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload",
                "ecr:PutImage"
            ],
            "Resource": "*"
        }
    ]
}
```

### **3. ECR Repository Creation**
```bash
# Create ECR repositories for all services
aws ecr create-repository --repository-name retail-store/cart-service --region ap-south-1
aws ecr create-repository --repository-name retail-store/catalog-service --region ap-south-1
aws ecr create-repository --repository-name retail-store/checkout-service --region ap-south-1
aws ecr create-repository --repository-name retail-store/orders-service --region ap-south-1
aws ecr create-repository --repository-name retail-store/ui-service --region ap-south-1
```

### **4. Pipeline File Placement**
Create workflow files in your repository:
```bash
mkdir -p .github/workflows
# Copy the pipeline YAML files to .github/workflows/
```

## Service-Specific Adaptations

### **Cart Service (Java/Maven)**
```yaml
- name: Set up JDK 21
  uses: actions/setup-java@v4
  with:
    java-version: '21'
    distribution: 'corretto'
    
- name: Run tests
  run: ./mvnw test
  
- name: Build application
  run: ./mvnw clean package -DskipTests
```

### **Catalog Service (Go)**
```yaml
- name: Set up Go
  uses: actions/setup-go@v4
  with:
    go-version: '1.21'
    
- name: Run tests
  run: go test ./...
  
- name: Build application
  run: go build -o main main.go
```

### **Checkout Service (Node.js)**
```yaml
- name: Set up Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'yarn'
    
- name: Install dependencies
  run: yarn install --frozen-lockfile
  
- name: Run tests
  run: yarn test
  
- name: Build application
  run: yarn build
```

## Pipeline Triggers

### **Push Triggers**
```yaml
on:
  push:
    branches: [ main, develop ]
    paths:
      - 'src/cart/**'              # Only cart service changes
      - '.github/workflows/cart-service.yml'  # Pipeline changes
```

### **Pull Request Triggers**
```yaml
on:
  pull_request:
    branches: [ main ]
    paths:
      - 'src/cart/**'
```

### **Manual Triggers** (Optional)
```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: 'staging'
        type: choice
        options:
        - staging
        - production
```

## Monitoring & Notifications

### **Build Status**
- **GitHub Actions tab**: Real-time build progress
- **Commit status checks**: Green/red indicators on commits
- **PR status**: Prevents merging if builds fail

### **Security Alerts**
- **GitHub Security tab**: Vulnerability scan results
- **Dependabot alerts**: Dependency security issues
- **Code scanning**: SARIF format integration

### **Slack Integration** (Optional)
```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Performance Optimization

### **Build Time Improvements**
- **Dependency caching**: 70% faster builds
- **Docker layer caching**: Reuses unchanged layers
- **Parallel jobs**: Multiple services build simultaneously
- **Path filtering**: Only builds changed services

### **Resource Usage**
- **Runner**: `ubuntu-latest` (2 CPU, 7GB RAM)
- **Build time**: 3-5 minutes per service
- **Concurrent builds**: Up to 20 jobs (GitHub Free tier)

## Troubleshooting

### **Common Issues**

#### **AWS Authentication Failed**
```
Error: Could not assume role with OIDC
```
**Solution**: Verify AWS credentials in GitHub Secrets

#### **ECR Repository Not Found**
```
Error: repository does not exist
```
**Solution**: Create ECR repository first
```bash
aws ecr create-repository --repository-name retail-store/cart-service
```

#### **Docker Build Failed**
```
Error: failed to solve: failed to read dockerfile
```
**Solution**: Ensure Dockerfile exists in service directory

#### **Tests Failed**
```
Error: Tests failed with exit code 1
```
**Solution**: Fix failing tests or temporarily skip with `-DskipTests`

### **Debug Commands**
```bash
# Check ECR repositories
aws ecr describe-repositories --region ap-south-1

# List images in repository
aws ecr list-images --repository-name retail-store/cart-service --region ap-south-1

# View pipeline logs
# GitHub → Actions → Select workflow run → View logs
```

## Best Practices

### **Security**
- ✅ Use GitHub Secrets for credentials
- ✅ Scan images for vulnerabilities
- ✅ Use specific action versions (@v4, not @main)
- ✅ Limit IAM permissions to minimum required

### **Performance**
- ✅ Cache dependencies between builds
- ✅ Use path filtering to avoid unnecessary builds
- ✅ Optimize Dockerfile for layer caching
- ✅ Run tests in parallel when possible

### **Reliability**
- ✅ Use stable action versions
- ✅ Add retry logic for flaky operations
- ✅ Set appropriate timeouts
- ✅ Monitor build success rates

### **Maintainability**
- ✅ Use consistent naming conventions
- ✅ Document pipeline changes
- ✅ Version control pipeline configurations
- ✅ Regular dependency updates

This CI/CD pipeline provides a robust, secure, and efficient way to deploy your retail store microservices to AWS ECR with full automation and monitoring capabilities.
