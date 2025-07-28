# Phase 2: Container Infrastructure

## Step 7: Create ECR Repository
1. **Navigate**: ECR → Repositories
2. **Click**: Create repository
3. **Configure**:
   - Visibility: Private
   - Repository name: `book-app`
   - Tag immutability: Disabled
   - Scan on push: Disabled (for demo)
4. **Create repository**

## Step 8: Create ECS Cluster
1. **Navigate**: ECS → Clusters
2. **Click**: Create Cluster
3. **Configure**:
   - Cluster name: `demo`
   - Infrastructure: AWS Fargate (serverless)
   - Container Insights: Enable
4. **Create**

## Step 9: Create Task Definition
1. **Navigate**: ECS → Task Definitions
2. **Click**: Create new Task Definition
3. **Configure**:
   - Task definition family: `book-app`
   - Launch type: AWS Fargate
   - Operating system: Linux/X86_64
   - CPU: 0.25 vCPU (256)
   - Memory: 0.5 GB (512)
4. **Container Definition**:
   - Container name: `book-app`
   - Image URI: `public.ecr.aws/nginx/nginx`
   - Port mappings: Container port `80`, Protocol `TCP`
5. **Task roles**:
   - Task execution role: Create new role (ecsTaskExecutionRole)
   - Task role: Create new role with SSM permissions
6. **Logging**:
   - Log driver: awslogs
   - Log group: `/ecs/book-app`
   - Region: Your region
   - Stream prefix: `book-app`
7. **Create**
