# Phase 5: CI/CD Pipeline Setup

## Step 9: Create S3 Bucket for Artifacts

**Navigate to S3 Console:**
1. **AWS Console** → Search "S3" → **S3**
2. **Create bucket**:
   - Bucket name: `codepipeline-artifacts-[account-id]-us-east-1`
   - Region: US East (N. Virginia) us-east-1
   - Block all public access: ✅
3. **Create bucket**

## Step 10: Setup GitHub Connection

**Navigate to CodePipeline Console:**
1. **AWS Console** → Search "CodePipeline" → **CodePipeline**
2. **Settings** → **Connections** → **Create connection**
3. **Configure**:
   - Provider: GitHub
   - Connection name: `github-connection`
4. **Connect to GitHub** → **Authorize AWS Connector for GitHub**
5. **Create connection**

## Step 11: Create CodeBuild Project

**Navigate to CodeBuild Console:**
1. **AWS Console** → Search "CodeBuild" → **CodeBuild**
2. **Build projects** → **Create build project**

**Configure Project:**
1. **Project configuration**:
   - Project name: `book-app-build`
   - Description: `Build project for book application`

2. **Source**:
   - Source provider: No source
   - (CodePipeline will provide source)

3. **Environment**:
   - Environment image: Managed image
   - Operating system: Amazon Linux 2
   - Runtime(s): Standard
   - Image: aws/codebuild/amazonlinux2-x86_64-standard:5.0
   - Environment type: Linux
   - Privileged: ✅ (for Docker commands)

4. **Service role**: New service role

5. **Buildspec**:
   - Build specifications: Insert build commands
   - Build commands:
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

6. **Create build project**

## Step 12: Create CodePipeline

**Create Pipeline:**
1. **CodePipeline Console** → **Pipelines** → **Create pipeline**

2. **Pipeline settings**:
   - Pipeline name: `book-app-pipeline`
   - Service role: New service role
   - Artifact store: Default location (S3 bucket created earlier)

3. **Source stage**:
   - Source provider: GitHub (Version 2)
   - Connection: Select your GitHub connection
   - Repository name: `yourusername/book-app`
   - Branch name: `main`
   - Output artifact format: CodePipeline default

4. **Build stage**:
   - Build provider: AWS CodeBuild
   - Project name: `book-app-build`

5. **Deploy stage**:
   - Deploy provider: Amazon ECS
   - Cluster name: `demo`
   - Service name: `service-book`
   - Image definitions file: `imagedefinitions.json`

6. **Create pipeline**
