# Phase 6: Blue/Green Deployment Setup

## Step 13: Create Blue/Green Load Balancer

### Create Second ALB:

1. **EC2 Console** → **Load Balancers** → **Create Load Balancer**
2. **Application Load Balancer**:
   - Name: `blue-green-alb`
   - Same configuration as standard ALB

### Create Blue and Green Target Groups:

1. **Target Groups** → **Create target group**:
   - **Blue Target Group**: `blue-target-group`
   - **Green Target Group**: `green-target-group`
   - Same configuration as standard target group

2. **Configure ALB Listener**:
   - Forward to `blue-target-group` initially

## Step 14: Create Blue/Green ECS Service

### Create Service:
1. **ECS Console** → **Clusters** → `demo` → **Services** → **Create**
2. **Configure**:
   - Service name: `service-book-blue-green`
   - Deployment controller: AWS CodeDeploy
   - Load balancer: `blue-green-alb`
   - Target group: `blue-target-group`
   - Same other configurations as standard service

## Step 15: Create CodeDeploy Application

**Navigate to CodeDeploy Console:**
1. **AWS Console** → Search "CodeDeploy" → **CodeDeploy**

### Create Application:

1. **Applications** → **Create application**
2. **Configure**:
   - Application name: `book-app-blue-green`
   - Compute platform: Amazon ECS

### Create Deployment Group:

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

## Step 16: Create Blue/Green Pipeline

### Create Pipeline:

1. **CodePipeline Console** → **Create pipeline**
2. **Configure**:
   - Pipeline name: `book-app-pipeline-blue-green`
   - Source: Same GitHub configuration
   - Build: Modified CodeBuild project for Blue/Green
   - Deploy: 
     - Provider: AWS CodeDeploy
     - Application name: `book-app-blue-green`
     - Deployment group: `book-app-deployment-group`
