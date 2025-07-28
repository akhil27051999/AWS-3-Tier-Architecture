# Phase 1: Network Infrastructure (Foundation)

## Step 1: Create VPC

1. **Navigate**: AWS Console → VPC → Your VPCs
2. **Click**: Create VPC
3. **Configure**:
   - Name: `demo-vpc`
   - IPv4 CIDR: `10.0.0.0/16`
   - IPv6 CIDR: No IPv6 CIDR block
   - Tenancy: Default
   - Enable DNS hostnames: ✅
   - Enable DNS resolution: ✅
4. **Create VPC**

## Step 2: Create Internet Gateway

1. **Navigate**: VPC → Internet Gateways
2. **Click**: Create internet gateway
3. **Configure**:
   - Name: `demo-igw`
4. **Create** → **Actions** → **Attach to VPC** → Select `demo-vpc`

## Step 3: Create Subnets (4 Total)
1. **Navigate**: VPC → Subnets → Create subnet
2. **Select VPC**: `demo-vpc`

#### Create each subnet:

**Public Subnet 1:**
- Name: `public-subnet-1`
- AZ: `us-east-1a` (or your region's first AZ)
- IPv4 CIDR: `10.0.0.0/24`

**Public Subnet 2:**
- Name: `public-subnet-2`
- AZ: `us-east-1b` (or your region's second AZ)
- IPv4 CIDR: `10.0.2.0/24`

**Private Subnet 1:**
- Name: `private-subnet-1`
- AZ: `us-east-1a`
- IPv4 CIDR: `10.0.1.0/24`

**Private Subnet 2:**
- Name: `private-subnet-2`
- AZ: `us-east-1b`
- IPv4 CIDR: `10.0.3.0/24`

## Step 4: Create NAT Gateway
1. **Navigate**: VPC → NAT Gateways
2. **Click**: Create NAT gateway
3. **Configure**:
   - Name: `demo-nat-gateway`
   - Subnet: `public-subnet-1`
   - Connectivity type: Public
   - Elastic IP allocation: Allocate Elastic IP
4. **Create NAT gateway**

## Step 5: Create Route Tables
**Public Route Table:**
1. **Navigate**: VPC → Route Tables → Create route table
2. **Configure**:
   - Name: `public-route-table`
   - VPC: `demo-vpc`
3. **Create** → **Actions** → **Edit routes**
4. **Add route**: `0.0.0.0/0` → Target: Internet Gateway (`demo-igw`)
5. **Actions** → **Edit subnet associations**
6. **Associate**: `public-subnet-1` and `public-subnet-2`
**Private Route Table:**
1. **Create route table**:
   - Name: `private-route-table`
   - VPC: `demo-vpc`
2. **Add route**: `0.0.0.0/0` → Target: NAT Gateway (`demo-nat-gateway`)
3. **Associate**: `private-subnet-1` and `private-subnet-2`

## Step 6: Create Security Groups
**ALB Security Group:**
1. **Navigate**: EC2 → Security Groups → Create security group
2. **Configure**:
   - Name: `alb-security-group`
   - Description: `Security group for Application Load Balancer`
   - VPC: `demo-vpc`
3. **Inbound rules**:
   - Type: HTTP, Port: 80, Source: `0.0.0.0/0`
4. **Outbound rules**: All traffic (default)
**ECS Security Group:**
1. **Create security group**:
   - Name: `ecs-security-group`
   - Description: `Security group for ECS Fargate tasks`
   - VPC: `demo-vpc`
2. **Inbound rules**:
   - Type: HTTP, Port: 80, Source: `alb-security-group`
3. **Outbound rules**: All traffic (default)
