# Complete AWS Console Deployment Guide - Book Application

## Project Overview

This guide provides step-by-step instructions to deploy your containerized book application using the **AWS Management Console** instead of CLI commands. You'll learn to navigate through each AWS service console to build the complete three-tier architecture.

## Application Files

Your project contains:
- **Dockerfile**: `FROM public.ecr.aws/nginx/nginx` + `COPY index.html /usr/share/nginx/html`
- **index.html**: Book recommendation website with Tailwind CSS
- **appspec.yaml**: Blue/Green deployment configuration
- **taskdef.json**: ECS task definition template

## Prerequisites

- AWS Account with administrative access
- Local machine with Docker installed
- GitHub repository for your application code
- Application files ready on your local machine

## Phase 1: Infrastructure Setup via Console

### Step 1: Create VPC and Networking

**Navigate to VPC Console:**
1. **AWS Console** → Search "VPC" → **VPC Dashboard**

**Create VPC:**
1. **Your VPCs** → **Create VPC**
2. **Configure**:
   - Name tag: `demo-vpc`
   - IPv4 CIDR block: `10.0.0.0/16`
   - IPv6 CIDR block: No IPv6 CIDR block
   - Tenancy: Default
   - Enable DNS resolution: ✅
   - Enable DNS hostnames: ✅
3. **Create VPC**

**Create Internet Gateway:**
1. **Internet Gateways** → **Create internet gateway**
2. **Name tag**: `demo-igw`
3. **Create internet gateway**
4. **Actions** → **Attach to VPC** → Select `demo-vpc` → **Attach internet gateway**

**Create Subnets:**
1. **Subnets** → **Create subnet**
2. **Select VPC**: `demo-vpc`
3. **Create 4 subnets**:

   **Public Subnet 1:**
   - Subnet name: `public-subnet-1`
   - Availability Zone: `us-east-1a`
   - IPv4 CIDR block: `10.0.0.0/24`

   **Public Subnet 2:**
   - Subnet name: `public-subnet-2`
   - Availability Zone: `us-east-1b`
   - IPv4 CIDR block: `10.0.2.0/24`

   **Private Subnet 1:**
   - Subnet name: `private-subnet-1`
   - Availability Zone: `us-east-1a`
   - IPv4 CIDR block: `10.0.1.0/24`

   **Private Subnet 2:**
   - Subnet name: `private-subnet-2`
   - Availability Zone: `us-east-1b`
   - IPv4 CIDR block: `10.0.3.0/24`

4. **Create subnet**

**Create NAT Gateway:**
1. **NAT Gateways** → **Create NAT gateway**
2. **Configure**:
   - Name: `demo-nat-gateway`
   - Subnet: `public-subnet-1`
   - Connectivity type: Public
   - Elastic IP allocation: **Allocate Elastic IP**
3. **Create NAT gateway**

**Create Route Tables:**

**Public Route Table:**
1. **Route Tables** → **Create route table**
2. **Configure**:
   - Name: `public-route-table`
   - VPC: `demo-vpc`
3. **Create route table**
4. **Select route table** → **Actions** → **Edit routes**
5. **Add route**: Destination `0.0.0.0/0`, Target: Internet Gateway `demo-igw`
6. **Save changes**
7. **Actions** → **Edit subnet associations**
8. **Select**: `public-subnet-1` and `public-subnet-2`
9. **Save associations**

**Private Route Table:**
1. **Create route table**:
   - Name: `private-route-table`
   - VPC: `demo-vpc`
2. **Edit routes** → **Add route**: Destination `0.0.0.0/0`, Target: NAT Gateway `demo-nat-gateway`
3. **Edit subnet associations** → Select: `private-subnet-1` and `private-subnet-2`

### Step 2: Create Security Groups

**Navigate to EC2 Console:**
1. **AWS Console** → Search "EC2" → **EC2 Dashboard**

**ALB Security Group:**
1. **Security Groups** → **Create security group**
2. **Configure**:
   - Security group name: `alb-security-group`
   - Description: `Security group for Application Load Balancer`
   - VPC: `demo-vpc`
3. **Inbound rules** → **Add rule**:
   - Type: HTTP
   - Port range: 80
   - Source: Anywhere-IPv4 (0.0.0.0/0)
4. **Create security group**

**ECS Security Group:**
1. **Create security group**:
   - Security group name: `ecs-security-group`
   - Description: `Security group for ECS Fargate tasks`
   - VPC: `demo-vpc`
2. **Inbound rules** → **Add rule**:
   - Type: HTTP
   - Port range: 80
   - Source: Custom → Select `alb-security-group`
3. **Create security group**

## Phase 2: Container Registry Setup

### Step 3: Create ECR Repository

**Navigate to ECR Console:**
1. **AWS Console** → Search "ECR" → **Elastic Container Registry**

**Create Repository:**
1. **Repositories** → **Create repository**
2. **Configure**:
   - Visibility settings: Private
   - Repository name: `book-app`
   - Tag immutability: Disabled
   - Scan on push: Disabled
   - Encryption configuration: AES-256
3. **Create repository**

**Push Your Docker Image:**
1. **Select repository** → **View push commands**
2. **Follow the 4 commands** in your local terminal:
   ```bash
   # 1. Retrieve authentication token
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [account-id].dkr.ecr.us-east-1.amazonaws.com
   
   # 2. Build your Docker image
   docker build -t book-app .
   
   # 3. Tag your image
   docker tag book-app:latest [account-id].dkr.ecr.us-east-1.amazonaws.com/book-app:latest
   
   # 4. Push image to repository
   docker push [account-id].dkr.ecr.us-east-1.amazonaws.com/book-app:latest
   ```

## Phase 3: ECS Cluster and Services

### Step 4: Create ECS Cluster

**Navigate to ECS Console:**
1. **AWS Console** → Search "ECS" → **Elastic Container Service**

**Create Cluster:**
1. **Clusters** → **Create Cluster**
2. **Configure**:
   - Cluster name: `demo`
   - Infrastructure: AWS Fargate (serverless)
   - Container Insights: Enable
3. **Create**

### Step 5: Create Task Definition

**Create Task Definition:**
1. **Task Definitions** → **Create new Task Definition**
2. **Configure task definition**:
   - Task definition family: `book-app`
   - Launch type: AWS Fargate
   - Operating system/Architecture: Linux/X86_64
   - Task size:
     - CPU: 0.25 vCPU (256)
     - Memory: 0.5 GB (512)

3. **Container - 1**:
   - Container name: `book-app`
   - Image URI: `[account-id].dkr.ecr.us-east-1.amazonaws.com/book-app:latest`
   - Port mappings: Container port `80`, Protocol `TCP`

4. **Environment variables** (optional):
   - Name: `ENV`, Value: `DEPLOY`

5. **Logging**:
   - Log driver: awslogs
   - awslogs-group: `/ecs/book-app`
   - awslogs-region: `us-east-1`
   - awslogs-stream-prefix: `book-app`

6. **Task roles**:
   - Task execution role: Create new role
   - Task role: Create new role

7. **Create**

### Step 6: Create Application Load Balancer

**Navigate to EC2 Console:**
1. **Load Balancers** → **Create Load Balancer**
2. **Application Load Balancer** → **Create**

**Configure Load Balancer:**
1. **Basic configuration**:
   - Load balancer name: `standard-alb`
   - Scheme: Internet-facing
   - IP address type: IPv4

2. **Network mapping**:
   - VPC: `demo-vpc`
   - Mappings: Select `public-subnet-1` and `public-subnet-2`

3. **Security groups**: Select `alb-security-group`

4. **Listeners and routing**:
   - Protocol: HTTP, Port: 80
   - Default action: **Create target group**

**Create Target Group:**
1. **Target type**: IP addresses
2. **Target group name**: `standard-target-group`
3. **Protocol**: HTTP, **Port**: 80
4. **VPC**: `demo-vpc`
5. **Health check**:
   - Health check path: `/`
   - Health check protocol: HTTP
6. **Create target group**
7. **Return to load balancer** → Select created target group
8. **Create load balancer**

### Step 7: Create ECS Service

**Create Service:**
1. **ECS Console** → **Clusters** → `demo` → **Services** → **Create**

2. **Environment**:
   - Compute options: Launch type
   - Launch type: FARGATE

3. **Deployment configuration**:
   - Application type: Service
   - Task definition: `book-app:1`
   - Service name: `service-book`
   - Desired tasks: 1

4. **Networking**:
   - VPC: `demo-vpc`
   - Subnets: Select `private-subnet-1` and `private-subnet-2`
   - Security groups: Select `ecs-security-group`
   - Public IP: Disabled

5. **Load balancing**:
   - Load balancer type: Application Load Balancer
   - Load balancer: `standard-alb`
   - Listener: Use an existing listener (Port 80 : HTTP)
   - Target group: Use an existing target group → `standard-target-group`

6. **Service auto scaling**:
   - Use service auto scaling: Yes
   - Minimum number of tasks: 1
   - Maximum number of tasks: 4
   - Policy name: `cpu-scaling`
   - ECS service metric: ECSServiceAverageCPUUtilization
   - Target value: 80

7. **Create**

## Phase 4: Test Your Application

### Step 8: Verify Deployment

**Check Service Status:**
1. **ECS Console** → **Clusters** → `demo` → **Services** → `service-book`
2. **Tasks tab** → Verify tasks are **RUNNING**
3. **Events tab** → Check for any deployment issues

**Get Application URL:**
1. **EC2 Console** → **Load Balancers** → `standard-alb`
2. **Copy DNS name** (e.g., `standard-alb-123456789.us-east-1.elb.amazonaws.com`)
3. **Open in browser**: `http://[dns-name]`

**Check Target Health:**
1. **Target Groups** → `standard-target-group`
2. **Targets tab** → Verify targets are **healthy**

## Phase 5: CI/CD Pipeline Setup

### Step 9: Create S3 Bucket for Artifacts

**Navigate to S3 Console:**
1. **AWS Console** → Search "S3" → **S3**
2. **Create bucket**:
   - Bucket name: `codepipeline-artifacts-[account-id]-us-east-1`
   - Region: US East (N. Virginia) us-east-1
   - Block all public access: ✅
3. **Create bucket**

### Step 10: Setup GitHub Connection

**Navigate to CodePipeline Console:**
1. **AWS Console** → Search "CodePipeline" → **CodePipeline**
2. **Settings** → **Connections** → **Create connection**
3. **Configure**:
   - Provider: GitHub
   - Connection name: `github-connection`
4. **Connect to GitHub** → **Authorize AWS Connector for GitHub**
5. **Create connection**

### Step 11: Create CodeBuild Project

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

### Step 12: Create CodePipeline

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

## Phase 6: Blue/Green Deployment Setup

### Step 13: Create Blue/Green Load Balancer

**Create Second ALB:**
1. **EC2 Console** → **Load Balancers** → **Create Load Balancer**
2. **Application Load Balancer**:
   - Name: `blue-green-alb`
   - Same configuration as standard ALB

**Create Blue and Green Target Groups:**
1. **Target Groups** → **Create target group**:
   - **Blue Target Group**: `blue-target-group`
   - **Green Target Group**: `green-target-group`
   - Same configuration as standard target group

2. **Configure ALB Listener**:
   - Forward to `blue-target-group` initially

### Step 14: Create Blue/Green ECS Service

**Create Service:**
1. **ECS Console** → **Clusters** → `demo` → **Services** → **Create**
2. **Configure**:
   - Service name: `service-book-blue-green`
   - Deployment controller: AWS CodeDeploy
   - Load balancer: `blue-green-alb`
   - Target group: `blue-target-group`
   - Same other configurations as standard service

### Step 15: Create CodeDeploy Application

**Navigate to CodeDeploy Console:**
1. **AWS Console** → Search "CodeDeploy" → **CodeDeploy**

**Create Application:**
1. **Applications** → **Create application**
2. **Configure**:
   - Application name: `book-app-blue-green`
   - Compute platform: Amazon ECS

**Create Deployment Group:**
1. **Deployment groups** → **Create deployment group**
2. **Configure**:
   - Deployment group name: `book-app-deployment-group`
   - Service role: Create new role with CodeDeploy permissions
   - ECS cluster name: `demo`
   - ECS service name: `service-book-blue-green`
   - Load balancer: `blue-green-alb`
   - Production listener port: 80
   - Target group 1 name: `blue-target-group`
   - Target group 2 name: `green-target-group`

### Step 16: Create Blue/Green Pipeline

**Create Pipeline:**
1. **CodePipeline Console** → **Create pipeline**
2. **Configure**:
   - Pipeline name: `book-app-pipeline-blue-green`
   - Source: Same GitHub configuration
   - Build: Modified CodeBuild project for Blue/Green
   - Deploy: 
     - Provider: AWS CodeDeploy
     - Application name: `book-app-blue-green`
     - Deployment group: `book-app-deployment-group`

## Phase 7: Monitoring Setup

### Step 17: Create CloudWatch Dashboard

**Navigate to CloudWatch Console:**
1. **AWS Console** → Search "CloudWatch" → **CloudWatch**

**Create Dashboard:**
1. **Dashboards** → **Create dashboard**
2. **Dashboard name**: `BookApp-Dashboard`
3. **Add widgets**:

   **ECS Metrics Widget:**
   - Widget type: Line
   - Metrics: 
     - AWS/ECS → CPUUtilization → ServiceName: service-book, ClusterName: demo
     - AWS/ECS → MemoryUtilization → ServiceName: service-book, ClusterName: demo
   - Period: 5 minutes

   **ALB Metrics Widget:**
   - Widget type: Line
   - Metrics:
     - AWS/ApplicationELB → RequestCount → LoadBalancer: app/standard-alb/...
     - AWS/ApplicationELB → TargetResponseTime → LoadBalancer: app/standard-alb/...

4. **Save dashboard**

### Step 18: Create CloudWatch Alarms

**Create CPU Alarm:**
1. **CloudWatch Console** → **Alarms** → **Create alarm**
2. **Select metric**: AWS/ECS → CPUUtilization → ServiceName: service-book, ClusterName: demo
3. **Configure**:
   - Statistic: Average
   - Period: 5 minutes
   - Threshold: Greater than 80
   - Evaluation periods: 2
4. **Alarm name**: `BookApp-HighCPU`
5. **Create alarm**

**Create Response Time Alarm:**
1. **Create alarm** for AWS/ApplicationELB → TargetResponseTime
2. **Threshold**: Greater than 2 seconds
3. **Alarm name**: `BookApp-HighResponseTime`

### Step 19: View Application Logs

**Access Logs:**
1. **CloudWatch Console** → **Log groups**
2. **Select**: `/ecs/book-app`
3. **View log streams** to see application logs
4. **Create log insights queries** for error analysis

## Phase 8: Testing Your Setup

### Step 20: Test Application

**Access Application:**
1. **Get ALB DNS name** from EC2 Console → Load Balancers
2. **Open in browser**: `http://[alb-dns-name]`
3. **Verify**: Your book application loads correctly

**Load Testing:**
1. **Use browser developer tools** → Network tab
2. **Refresh page multiple times** to generate traffic
3. **Monitor**: CloudWatch metrics for scaling

### Step 21: Test CI/CD Pipeline

**Test Standard Pipeline:**
1. **Make changes** to your `index.html` file
2. **Commit and push** to GitHub main branch
3. **Monitor**: CodePipeline Console → Pipeline execution
4. **Verify**: Changes deployed to application

**Test Blue/Green Pipeline:**
1. **Make changes** to application
2. **Push to main branch**
3. **Monitor**: CodeDeploy Console → Deployment progress
4. **Verify**: Zero-downtime deployment

## Phase 9: Connect to ECS Container

### Step 22: Enable ECS Exec

**Enable Execute Command:**
1. **ECS Console** → **Clusters** → `demo` → **Services** → `service-book`
2. **Update service**
3. **Configuration** → **Enable Execute Command**: ✅
4. **Update**

**Connect to Container (via CloudShell):**
1. **AWS Console** → **CloudShell** (top right)
2. **Run command**:
   ```bash
   # Get task ARN
   TASK_ARN=$(aws ecs list-tasks --cluster demo --service-name service-book --query 'taskArns[0]' --output text)
   
   # Connect to container
   aws ecs execute-command \
     --cluster demo \
     --task $TASK_ARN \
     --container book-app \
     --interactive \
     --command "/bin/sh"
   ```

## Monitoring Your Application

### Real-time Monitoring Locations

**ECS Service Monitoring:**
- **ECS Console** → **Clusters** → `demo` → **Services** → `service-book`
- **Metrics tab**: CPU, Memory, Network utilization
- **Tasks tab**: Running task status
- **Events tab**: Service events and deployments

**Load Balancer Monitoring:**
- **EC2 Console** → **Load Balancers** → `standard-alb`
- **Monitoring tab**: Request count, response times
- **Target Groups** → `standard-target-group` → **Targets tab**: Health status

**Pipeline Monitoring:**
- **CodePipeline Console** → `book-app-pipeline`
- **Execution history**: Pipeline runs and status
- **CodeBuild Console** → `book-app-build` → **Build history**

**Application Logs:**
- **CloudWatch Console** → **Log groups** → `/ecs/book-app`
- **Real-time log streaming**
- **Log Insights** for advanced querying

**Metrics and Alarms:**
- **CloudWatch Console** → **Dashboards** → `BookApp-Dashboard`
- **Alarms**: Monitor CPU and response time thresholds

## Troubleshooting via Console

### Common Issues and Solutions

**Service Won't Start:**
1. **ECS Console** → **Services** → **Events tab** → Check error messages
2. **Tasks tab** → **Click task** → **Logs tab** → View container logs
3. **Verify**: Security groups allow ALB → ECS communication

**Health Check Failures:**
1. **EC2 Console** → **Target Groups** → **Targets tab** → Check health status
2. **Health check settings** → Verify path is `/`
3. **ECS Console** → **Task logs** → Check if app responds on port 80

**Pipeline Failures:**
1. **CodePipeline Console** → **Pipeline** → **Failed stage** → **Details**
2. **CodeBuild Console** → **Build project** → **Build history** → **Logs**
3. **Check**: IAM permissions, GitHub connection status

**Auto Scaling Issues:**
1. **ECS Console** → **Services** → **Auto Scaling tab** → **Scaling activities**
2. **CloudWatch Console** → **Metrics** → Check CPU utilization
3. **Verify**: Scaling policies and thresholds

## Success Verification Checklist

✅ **VPC and networking configured correctly**  
✅ **ECR repository contains your Docker image**  
✅ **ECS cluster running with healthy tasks**  
✅ **Load balancer showing healthy targets**  
✅ **Application accessible via ALB DNS name**  
✅ **CI/CD pipeline successfully deploying changes**  
✅ **Blue/Green deployment working (if configured)**  
✅ **CloudWatch monitoring and alarms active**  
✅ **Auto-scaling responding to load changes**  
✅ **Container accessible via ECS Exec**  

## Cleanup via Console

**Delete resources in this order to avoid charges:**

1. **CodePipeline Console** → Delete pipelines
2. **CodeDeploy Console** → Delete applications
3. **CodeBuild Console** → Delete build projects
4. **ECS Console** → Delete services → Delete cluster
5. **EC2 Console** → Delete load balancers → Delete target groups
6. **ECR Console** → Delete repository
7. **VPC Console** → Delete NAT gateway → Delete subnets → Delete VPC
8. **S3 Console** → Empty and delete buckets
9. **CloudWatch Console** → Delete dashboards and alarms
10. **IAM Console** → Delete created roles

Your book application is now fully deployed using the AWS Console with complete monitoring and CI/CD capabilities!
