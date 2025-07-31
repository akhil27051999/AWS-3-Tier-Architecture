# Phase 1: Infrastructure Setup via Console

## VPC Setup Video

https://github.com/user-attachments/assets/b90d3b2e-0fc2-403d-b99c-fd46c74e7370

## Step 1: Create VPC and Networking

### Create VPC:

**Navigate to VPC Console:**
1. **AWS Console** → Search "VPC" → **VPC Dashboard**
   
1. **Your VPCs** → **Create VPC**
2. **Configure**:
   - Name tag: `demo-vpc`
   - IPv4 CIDR block: `10.0.0.0/16`
   - IPv6 CIDR block: No IPv6 CIDR block
   - Tenancy: Default
   - Enable DNS resolution: ✅
   - Enable DNS hostnames: ✅
3. **Create VPC**
---

### Create Internet Gateway:
1. **Internet Gateways** → **Create internet gateway**
2. **Name tag**: `demo-igw`
3. **Create internet gateway**
4. **Actions** → **Attach to VPC** → Select `demo-vpc` → **Attach internet gateway**
---

### Create Subnets:
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
---

### Create NAT Gateway:
1. **NAT Gateways** → **Create NAT gateway**
2. **Configure**:
   - Name: `demo-nat-gateway`
   - Subnet: `public-subnet-1`
   - Connectivity type: Public
   - Elastic IP allocation: **Allocate Elastic IP**
3. **Create NAT gateway**
---

### Create Route Tables:

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

## Step 2: Create Security Groups

**Navigate to EC2 Console:**
1. **AWS Console** → Search "EC2" → **EC2 Dashboard**

### ALB Security Group:
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

### ECS Security Group:
1. **Create security group**:
   - Security group name: `ecs-security-group`
   - Description: `Security group for ECS Fargate tasks`
   - VPC: `demo-vpc`
2. **Inbound rules** → **Add rule**:
   - Type: HTTP
   - Port range: 80
   - Source: Custom → Select `alb-security-group`
3. **Create security group**
