# Complete ECS Book Application Deployment Guide

## Project Overview

This guide provides step-by-step instructions to deploy a containerized book application on AWS ECS with complete CI/CD pipeline, monitoring, and both standard and Blue/Green deployment strategies.

## Application Files

Your project contains:
- **Dockerfile**: Nginx-based container serving static HTML
- **index.html**: Book recommendation website with Tailwind CSS
- **appspec.yaml**: Blue/Green deployment configuration
- **taskdef.json**: ECS task definition template

## Prerequisites

- AWS Account with administrative access
- GitHub repository for your application code
- Basic understanding of Docker and AWS services

## Phase 1: Environment Setup

### Step 1: Install Required Tools

**Linux/macOS:**
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install Docker
sudo apt update
sudo apt install docker.io
sudo systemctl start docker
sudo usermod -aG docker $USER

# Install Session Manager Plugin
curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb" -o "session-manager-plugin.deb"
sudo dpkg -i session-manager-plugin.deb
```

**Windows:**
```powershell
# Download and install AWS CLI from: https://awscli.amazonaws.com/AWSCLIV2.msi
# Download and install Docker Desktop from: https://www.docker.com/products/docker-desktop
# Download and install Session Manager Plugin from AWS documentation
```

### Step 2: Configure AWS CLI
```bash
aws configure
# AWS Access Key ID: [Your Access Key]
# AWS Secret Access Key: [Your Secret Key]
# Default region name: us-east-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity
```

### Step 3: Verify Installation
```bash
aws --version
docker --version
session-manager-plugin
```

## Phase 2: Application Preparation

### Step 4: Create Project Directory
```bash
mkdir book-app-deployment
cd book-app-deployment
```

### Step 5: Create Application Files

**Dockerfile:**
```dockerfile
FROM public.ecr.aws/nginx/nginx
COPY index.html /usr/share/nginx/html
```

**index.html:**
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://d2cvlmmg8c0xrp.cloudfront.net/web-css/review-book.css" rel="stylesheet" />
  </head>
  <body class="bg-gray-100">
    <div class="bg-green-400 py-3">
      <nav class="flex mx-auto max-w-5xl justify-between">
        <a href="#" class="font-bold text-2xl"> Book Store </a>
        <ul class="hidden md:flex gap-x-3">
          <li class="bg-white hover:bg-green-600 hover:text-white px-3 py-1 rounded-sm">
            <a href="#" target="_blank">About</a>
          </li>
        </ul>
      </nav>
    </div>
    <div class="mx-auto max-w-5xl pt-20 pb-48 text-center">
      <h1 class="text-4xl font-bold mb-8">AWS Cloud Computing Books</h1>
      <p class="text-xl">Discover the best books for learning AWS and cloud technologies</p>
    </div>
  </body>
</html>
```

**appspec.yaml:**
```yaml
version: 0.0
Resources:
  - TargetService:
      Type: AWS::ECS::Service
      Properties:
        TaskDefinition: <TASK_DEFINITION>
        LoadBalancerInfo:
          ContainerName: 'book-app'
          ContainerPort: 80 
        PlatformVersion: 'LATEST'
```

**taskdef.json:**
```json
{
  "containerDefinitions": [
    {
      "name": "book-app",
      "image": "<IMAGE1_NAME>",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [
        {
          "name": "ENV",
          "value": "DEPLOY"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/book-app",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "book-app"
        }
      }
    }
  ],
  "family": "book-app",
  "taskRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/cfn-task-def-book-TaskRole",
  "executionRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/cfn-task-def-book-TaskExecutionRole",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "runtimePlatform": {
    "cpuArchitecture": "X86_64",
    "operatingSystemFamily": "LINUX"
  }
}
```

## Phase 3: Infrastructure Deployment

### Step 6: Deploy CloudFormation Stacks

**Deploy in this order:**
```bash
# 1. Network Infrastructure
aws cloudformation create-stack \
  --stack-name cfn-network \
  --template-body file://1-network.yaml \
  --capabilities CAPABILITY_IAM

# 2. Load Balancer
aws cloudformation create-stack \
  --stack-name cfn-load-balancer \
  --template-body file://2-load-balancer.yaml

# 3. ECS Cluster
aws cloudformation create-stack \
  --stack-name cfn-ecs-cluster \
  --template-body file://3-ecs-cluster.yaml

# 4. Task Definition
aws cloudformation create-stack \
  --stack-name cfn-task-def-book \
  --template-body file://4-task-def-book.yaml

# 5. ECS Service
aws cloudformation create-stack \
  --stack-name cfn-service-book \
  --template-body file://5-service-book.yaml

# 6. ECR and S3
aws cloudformation create-stack \
  --stack-name cfn-codecommit-ecr-stack \
  --template-body file://23-s3-ecr.yaml

# Wait for all stacks to complete
aws cloudformation wait stack-create-complete --stack-name cfn-network
aws cloudformation wait stack-create-complete --stack-name cfn-load-balancer
aws cloudformation wait stack-create-complete --stack-name cfn-ecs-cluster
aws cloudformation wait stack-create-complete --stack-name cfn-task-def-book
aws cloudformation wait stack-create-complete --stack-name cfn-service-book
aws cloudformation wait stack-create-complete --stack-name cfn-codecommit-ecr-stack
```

## Phase 4: Manual Application Deployment

### Step 7: Build and Test Locally
```bash
# Build Docker image
docker build -t book-app .

# Test locally
docker run -p 8080:80 book-app

# Test in browser: http://localhost:8080
# Press Ctrl+C to stop
```

### Step 8: Deploy to ECR and ECS
```bash
# Set variables
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="us-east-1"
ECR_REPO="book-app"

echo "Account ID: $ACCOUNT_ID"

# Login to ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Tag and push image
docker tag book-app:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest

# Deploy to ECS
aws ecs update-service --cluster demo --service service-book --force-new-deployment

# Monitor deployment
watch -n 5 'aws ecs describe-services --cluster demo --services service-book --query "services[0].deployments"'
```

### Step 9: Verify Deployment
```bash
# Get ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers --names standard-alb --query 'LoadBalancers[0].DNSName' --output text)
echo "Application URL: http://$ALB_DNS"

# Test application
curl -I http://$ALB_DNS
```

## Phase 5: ECS Container Access

### Step 10: Enable ECS Exec
```bash
# Enable execute command on service
aws ecs update-service \
  --cluster demo \
  --service service-book \
  --enable-execute-command

# Wait for service to update
aws ecs wait services-stable --cluster demo --services service-book
```

### Step 11: Connect to Running Container
```bash
# Get running task ARN
TASK_ARN=$(aws ecs list-tasks --cluster demo --service-name service-book --query 'taskArns[0]' --output text)

# Connect to container
aws ecs execute-command \
  --cluster demo \
  --task $TASK_ARN \
  --container book-app \
  --interactive \
  --command "/bin/sh"

# Inside container commands:
# ls /usr/share/nginx/html/
# cat /usr/share/nginx/html/index.html
# ps aux
# exit
```

## Phase 6: CI/CD Pipeline Setup

### Step 12: Setup GitHub Repository
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial book app deployment"

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/book-app.git
git branch -M main
git push -u origin main
```

### Step 13: Create GitHub Connection
```bash
# Create CodeStar connection
aws codestar-connections create-connection \
  --provider-type GitHub \
  --connection-name book-app-github-connection

# Note the ConnectionArn from output
# Complete connection in AWS Console: CodePipeline > Settings > Connections
```

### Step 14: Deploy Standard CI/CD Pipeline
```bash
# Update taskdef.json with your account ID
sed -i "s/<ACCOUNT_ID>/$ACCOUNT_ID/g" taskdef.json

# Deploy standard pipeline
aws cloudformation create-stack \
  --stack-name cfn-codepipeline \
  --template-body file://6-codepipeline.yaml \
  --parameters \
    ParameterKey=GitHubConnectionId,ParameterValue=your-connection-id \
    ParameterKey=GitHubRepoOwner,ParameterValue=yourusername \
    ParameterKey=GitHubRepoName,ParameterValue=book-app \
  --capabilities CAPABILITY_IAM

# Wait for completion
aws cloudformation wait stack-create-complete --stack-name cfn-codepipeline
```

### Step 15: Deploy Blue/Green Pipeline
```bash
# Deploy Blue/Green infrastructure
aws cloudformation create-stack \
  --stack-name cfn-alb-blue-green \
  --template-body file://22-load-balancer-blue-green.yaml

aws cloudformation create-stack \
  --stack-name cfn-service-book-blue-green \
  --template-body file://25-service-book-blue-green.yaml

aws cloudformation create-stack \
  --stack-name cfn-pipeline-blue-green \
  --template-body file://26-codepipeline-blue-green.yaml \
  --parameters \
    ParameterKey=GitHubConnectionId,ParameterValue=your-connection-id \
    ParameterKey=GitHubRepoOwner,ParameterValue=yourusername \
    ParameterKey=GitHubRepoName,ParameterValue=book-app \
  --capabilities CAPABILITY_IAM

# Wait for completion
aws cloudformation wait stack-create-complete --stack-name cfn-alb-blue-green
aws cloudformation wait stack-create-complete --stack-name cfn-service-book-blue-green
aws cloudformation wait stack-create-complete --stack-name cfn-pipeline-blue-green
```

## Phase 7: Comprehensive Monitoring

### Step 16: Create CloudWatch Dashboard
```bash
aws cloudwatch put-dashboard \
  --dashboard-name "BookApp-Dashboard" \
  --dashboard-body '{
    "widgets": [
      {
        "type": "metric",
        "properties": {
          "metrics": [
            ["AWS/ECS", "CPUUtilization", "ServiceName", "service-book", "ClusterName", "demo"],
            [".", "MemoryUtilization", ".", ".", ".", "."]
          ],
          "period": 300,
          "stat": "Average",
          "region": "us-east-1",
          "title": "ECS Service Metrics",
          "yAxis": {"left": {"min": 0, "max": 100}}
        }
      },
      {
        "type": "metric",
        "properties": {
          "metrics": [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", "app/standard-alb"],
            [".", "TargetResponseTime", ".", "."]
          ],
          "period": 300,
          "stat": "Sum",
          "region": "us-east-1",
          "title": "ALB Metrics"
        }
      }
    ]
  }'
```

### Step 17: Setup CloudWatch Alarms
```bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "BookApp-HighCPU" \
  --alarm-description "Book App High CPU Usage" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ServiceName,Value=service-book Name=ClusterName,Value=demo \
  --evaluation-periods 2

# High response time alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "BookApp-HighResponseTime" \
  --alarm-description "Book App High Response Time" \
  --metric-name TargetResponseTime \
  --namespace AWS/ApplicationELB \
  --statistic Average \
  --period 300 \
  --threshold 2 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

### Step 18: Monitor Application Logs
```bash
# View real-time logs
aws logs tail /ecs/book-app --follow

# Query for errors
aws logs start-query \
  --log-group-name "/ecs/book-app" \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, @message | filter @message like /error|ERROR/ | sort @timestamp desc'

# Query for access patterns
aws logs start-query \
  --log-group-name "/ecs/book-app" \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, @message | filter @message like /GET|POST/ | stats count() by bin(5m)'
```

## Phase 8: Testing and Validation

### Step 19: Load Testing
```bash
# Get ALB DNS
ALB_DNS=$(aws elbv2 describe-load-balancers --names standard-alb --query 'LoadBalancers[0].DNSName' --output text)

# Simple load test
for i in {1..50}; do
  curl -s http://$ALB_DNS > /dev/null &
done
wait

# Monitor auto scaling
watch -n 10 'aws ecs describe-services --cluster demo --services service-book --query "services[0].{Running:runningCount,Desired:desiredCount,Pending:pendingCount}"'
```

### Step 20: Test Standard CI/CD Pipeline
```bash
# Make a change to your app
echo "<!-- Updated $(date) -->" >> index.html

# Commit and push
git add .
git commit -m "Update book app - $(date)"
git push origin main

# Monitor pipeline
aws codepipeline get-pipeline-state --name pipeline-standard

# Check pipeline execution
aws codepipeline list-pipeline-executions --pipeline-name pipeline-standard
```

### Step 21: Test Blue/Green Deployment
```bash
# Create feature branch
git checkout -b feature-update
echo "<!-- Blue/Green test $(date) -->" >> index.html
git add .
git commit -m "Blue/Green deployment test"
git push origin feature-update

# Merge to main
git checkout main
git merge feature-update
git push origin main

# Monitor Blue/Green deployment
aws codedeploy list-deployments --application-name blue-green-deploy-app
```

## Phase 9: Complete Automation Script

### Step 22: Create Deployment Script

Create `deploy-book-app.sh`:
```bash
#!/bin/bash
set -e

# Configuration
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="us-east-1"
ECR_REPO="book-app"
CLUSTER="demo"
SERVICE="service-book"

echo "🚀 Deploying Book Application..."
echo "Account ID: $ACCOUNT_ID"

# Build and push
echo "📦 Building Docker image..."
docker build -t $ECR_REPO .

echo "🔐 Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

echo "📤 Pushing image to ECR..."
docker tag $ECR_REPO:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest

echo "🔄 Updating ECS service..."
aws ecs update-service --cluster $CLUSTER --service $SERVICE --force-new-deployment

echo "⏳ Waiting for deployment..."
aws ecs wait services-stable --cluster $CLUSTER --services $SERVICE

# Get URLs
ALB_DNS=$(aws elbv2 describe-load-balancers --names standard-alb --query 'LoadBalancers[0].DNSName' --output text)
BG_ALB_DNS=$(aws elbv2 describe-load-balancers --names blue-green-alb --query 'LoadBalancers[0].DNSName' --output text 2>/dev/null || echo "Not deployed")

echo "✅ Deployment complete!"
echo "🌐 Standard App URL: http://$ALB_DNS"
echo "🔄 Blue/Green App URL: http://$BG_ALB_DNS"
echo ""
echo "📊 Monitoring Commands:"
echo "  Logs: aws logs tail /ecs/book-app --follow"
echo "  Service: aws ecs describe-services --cluster $CLUSTER --services $SERVICE"
echo "  Dashboard: https://console.aws.amazon.com/cloudwatch/home?region=$REGION#dashboards:name=BookApp-Dashboard"
echo "  Pipeline: https://console.aws.amazon.com/codesuite/codepipeline/pipelines/pipeline-standard/view"
```

Make executable and run:
```bash
chmod +x deploy-book-app.sh
./deploy-book-app.sh
```

## Monitoring Commands

### Real-time Monitoring
```bash
# Monitor ECS service
watch -n 10 'aws ecs describe-services --cluster demo --services service-book --query "services[0].{RunningCount:runningCount,PendingCount:pendingCount,DesiredCount:desiredCount}"'

# Monitor ALB targets
watch -n 10 'aws elbv2 describe-target-health --target-group-arn $(aws elbv2 describe-target-groups --names standard-target-group --query "TargetGroups[0].TargetGroupArn" --output text)'

# Monitor logs
aws logs tail /ecs/book-app --follow

# Monitor pipeline executions
aws codepipeline list-pipeline-executions --pipeline-name pipeline-standard
```

### Performance Metrics
```bash
# Get ECS metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=service-book Name=ClusterName,Value=demo \
  --start-time $(date -d '1 hour ago' --iso-8601) \
  --end-time $(date --iso-8601) \
  --period 300 \
  --statistics Average

# Get ALB metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name RequestCount \
  --dimensions Name=LoadBalancer,Value=app/standard-alb \
  --start-time $(date -d '1 hour ago' --iso-8601) \
  --end-time $(date --iso-8601) \
  --period 300 \
  --statistics Sum
```

## Troubleshooting

### Common Issues
1. **Service won't start**: Check security groups and subnet routing
2. **Health check failures**: Verify app responds on port 80
3. **Pipeline failures**: Check IAM permissions and GitHub connection
4. **Container crashes**: Check logs with `aws logs tail /ecs/book-app`

### Debugging Commands
```bash
# Check ECS service status
aws ecs describe-services --cluster demo --services service-book

# Check task details
aws ecs describe-tasks --cluster demo --tasks $(aws ecs list-tasks --cluster demo --service-name service-book --query 'taskArns[0]' --output text)

# Check ALB target health
aws elbv2 describe-target-health --target-group-arn $(aws elbv2 describe-target-groups --names standard-target-group --query "TargetGroups[0].TargetGroupArn" --output text)

# Check pipeline status
aws codepipeline get-pipeline-state --name pipeline-standard
```

## Cleanup

To avoid ongoing charges, delete resources in reverse order:
```bash
aws cloudformation delete-stack --stack-name cfn-pipeline-blue-green
aws cloudformation delete-stack --stack-name cfn-service-book-blue-green
aws cloudformation delete-stack --stack-name cfn-alb-blue-green
aws cloudformation delete-stack --stack-name cfn-codepipeline
aws cloudformation delete-stack --stack-name cfn-codecommit-ecr-stack
aws cloudformation delete-stack --stack-name cfn-service-book
aws cloudformation delete-stack --stack-name cfn-task-def-book
aws cloudformation delete-stack --stack-name cfn-ecs-cluster
aws cloudformation delete-stack --stack-name cfn-load-balancer
aws cloudformation delete-stack --stack-name cfn-network
```

## Success Criteria

✅ **Application deployed and accessible via ALB**  
✅ **Container accessible via ECS Exec**  
✅ **CI/CD pipeline automatically deploys on code changes**  
✅ **Blue/Green deployment working with zero downtime**  
✅ **CloudWatch monitoring and alarms configured**  
✅ **Auto-scaling working based on CPU metrics**  
✅ **Logs centralized in CloudWatch**  

Your book application is now fully deployed with enterprise-grade reliability, security, and operational excellence!
