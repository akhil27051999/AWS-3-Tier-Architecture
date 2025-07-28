# Phase 5: CI/CD Pipeline Setup

## Step 14: Create S3 Bucket for Artifacts
1. **Navigate**: S3 → Buckets
2. **Click**: Create bucket
3. **Configure**:
   - Bucket name: `codepipeline-artifacts-{your-account-id}-{region}`
   - Region: Your region
   - Block all public access: ✅
4. **Create bucket**

## Step 15: Setup GitHub Connection
1. **Navigate**: CodePipeline → Settings → Connections
2. **Click**: Create connection
3. **Configure**:
   - Provider: GitHub
   - Connection name: `github-connection`
4. **Connect to GitHub** → Authorize AWS
5. **Create connection**

## Step 16: Create IAM Roles
**CodePipeline Service Role:**
1. **Navigate**: IAM → Roles → Create role
2. **Trusted entity**: AWS service → CodePipeline
3. **Permissions**: Attach policies:
   - `AWSCodePipelineServiceRole`
   - Custom policy for S3, ECR, ECS access
4. **Role name**: `CodePipelineServiceRole`
**CodeBuild Service Role:**
1. **Create role**: AWS service → CodeBuild
2. **Permissions**:
   - `CloudWatchLogsFullAccess`
   - `AmazonEC2ContainerRegistryPowerUser`
   - Custom S3 policy
3. **Role name**: `CodeBuildServiceRole`
**CodeDeploy Service Role:**
1. **Create role**: AWS service → CodeDeploy
2. **Permissions**: `AWSCodeDeployRoleForECS`
3. **Role name**: `CodeDeployServiceRole`

## Step 17: Create CodeBuild Project
1. **Navigate**: CodeBuild → Build projects
2. **Click**: Create build project
3. **Configure**:
   - Project name: `book-app-build`
   - Source provider: No source (CodePipeline will provide)
   - Environment: Managed image
   - Operating system: Amazon Linux 2
   - Runtime: Standard
   - Image: aws/codebuild/amazonlinux2-x86_64-standard:5.0
   - Service role: `CodeBuildServiceRole`
4. **Buildspec** (inline):

```yaml
version: 0.2
phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
      - REPOSITORY_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/book-app
      - COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)
      - IMAGE_TAG=${COMMIT_HASH:=latest}
  build:
    commands:
      - echo Build started on `date`
      - echo Building the Docker image...
      - docker build -t $REPOSITORY_URI:latest .
      - docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$IMAGE_TAG
  post_build:
    commands:
      - echo Build completed on `date`
      - echo Pushing the Docker images...
      - docker push $REPOSITORY_URI:latest
      - docker push $REPOSITORY_URI:$IMAGE_TAG
      - echo Writing image definitions file...
      - printf '[{"name":"book-app","imageUri":"%s"}]' $REPOSITORY_URI:$IMAGE_TAG > imagedefinitions.json
artifacts:
  files:
    - imagedefinitions.json
```

## Step 18: Create Standard CodePipeline
1. **Navigate**: CodePipeline → Pipelines
2. **Click**: Create pipeline
3. **Configure**:
   - Pipeline name: `book-app-pipeline-standard`
   - Service role: `CodePipelineServiceRole`
   - Artifact store: S3 bucket created earlier
4. **Source Stage**:
   - Source provider: GitHub (Version 2)
   - Connection: `github-connection`
   - Repository: Your repository
   - Branch: `main`
5. **Build Stage**:
   - Build provider: AWS CodeBuild
   - Project name: `book-app-build`
6. **Deploy Stage**:
   - Deploy provider: Amazon ECS
   - Cluster name: `demo`
   - Service name: `service-book`
   - Image definitions file: `imagedefinitions.json`
7. **Create pipeline**

## Step 19: Create CodeDeploy Application (Blue/Green)
1. **Navigate**: CodeDeploy → Applications
2. **Click**: Create application
3. **Configure**:
   - Application name: `book-app-blue-green`
   - Compute platform: Amazon ECS
4. **Create Deployment Group**:
   - Deployment group name: `book-app-deployment-group`
   - Service role: `CodeDeployServiceRole`
   - ECS cluster: `demo`
   - ECS service: `service-book-blue-green`
   - Load balancer: `blue-green-alb`
   - Production listener: Port 80
   - Target group 1: `blue-target-group`
   - Target group 2: `green-target-group`

## Step 20: Create Blue/Green CodePipeline
1. **Create pipeline**: `book-app-pipeline-blue-green`
2. **Source**: Same as standard pipeline
3. **Build**: Modified CodeBuild project for Blue/Green artifacts
4. **Deploy**: 
   - Provider: AWS CodeDeploy
   - Application: `book-app-blue-green`
   - Deployment group: `book-app-deployment-group`
