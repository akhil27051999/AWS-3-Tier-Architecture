# Phase 3: ECS Cluster and Services

## ECS Cluster and Service Creation Video

https://github.com/user-attachments/assets/d425b4ec-db07-44b0-985d-7c5190b5d3c9

## Step 4: Create ECS Cluster

### Create Cluster:

#### Navigate to ECS Console:
**AWS Console** → Search "ECS" → **Elastic Container Service**

1. **Clusters** → **Create Cluster**
2. **Configure**:
   - Cluster name: `demo`
   - Infrastructure: AWS Fargate (serverless)
   - Container Insights: Enable
3. **Create**

## Step 5: Create Task Definition

### Create Task Definition:
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

## Step 6: Create Application Load Balancer

### Configure Load Balancer:

#### Navigate to EC2 Console:
1. **Load Balancers** → **Create Load Balancer**
2. **Application Load Balancer** → **Create**
   
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

### Create Target Group:

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

## Step 7: Create ECS Service

### Create Service:

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
