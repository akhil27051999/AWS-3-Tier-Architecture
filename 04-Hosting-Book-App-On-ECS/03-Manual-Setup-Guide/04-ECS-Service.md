# Phase 4: ECS Services

## Step 12: Create Standard ECS Service
1. **Navigate**: ECS → Clusters → `demo` → Services
2. **Click**: Create
3. **Configure**:
   - Launch type: Fargate
   - Task Definition: `book-app:1`
   - Service name: `service-book`
   - Number of tasks: 1
   - Deployment type: Rolling update
4. **Networking**:
   - VPC: `demo-vpc`
   - Subnets: `private-subnet-1`, `private-subnet-2`
   - Security groups: `ecs-security-group`
   - Auto-assign public IP: Disabled
5. **Load balancing**:
   - Load balancer type: Application Load Balancer
   - Load balancer: `standard-alb`
   - Target group: `standard-target-group`
   - Container to load balance: `book-app:80`
6. **Auto Scaling**:
   - Service auto scaling: Enable
   - Minimum: 1, Maximum: 4, Desired: 1
   - Scaling policy: Target tracking
   - Metric: Average CPU utilization
   - Target value: 80%
7. **Create Service**

## Step 13: Create Blue/Green ECS Service
1. **Create Service**:
   - Service name: `service-book-blue-green`
   - Deployment controller: AWS CodeDeploy
   - Load balancer: `blue-green-alb`
   - Target group: `blue-target-group`
   - Same auto scaling configuration
