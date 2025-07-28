# Phase 3: Load Balancers

## Step 10: Create Application Load Balancer (Standard)
1. **Navigate**: EC2 → Load Balancers
2. **Click**: Create Load Balancer → Application Load Balancer
3. **Configure**:
   - Name: `standard-alb`
   - Scheme: Internet-facing
   - IP address type: IPv4
   - VPC: `demo-vpc`
   - Mappings: Select `public-subnet-1` and `public-subnet-2`
   - Security groups: `alb-security-group`
4. **Create Target Group**:
   - Target type: IP addresses
   - Target group name: `standard-target-group`
   - Protocol: HTTP, Port: 80
   - VPC: `demo-vpc`
   - Health check path: `/`
5. **Create Load Balancer**

## Step 11: Create Blue/Green Load Balancer
1. **Create second ALB**:
   - Name: `blue-green-alb`
   - Same configuration as standard ALB
2. **Create Blue Target Group**:
   - Name: `blue-target-group`
   - Same configuration as standard
3. **Create Green Target Group**:
   - Name: `green-target-group`
   - Same configuration as standard
4. **Configure Listener**: Forward to `blue-target-group` initially
