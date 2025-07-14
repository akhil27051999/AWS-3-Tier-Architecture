# 🌐 AWS Load Balancer + Target Group Setup Guide

This guide walks you through the process of creating an **Application Load Balancer (ALB)** and **Target Group** in AWS to route traffic to your EC2 instances (or other supported targets) securely and efficiently.

## Video of Load Balancer and Target Group Setup

https://github.com/user-attachments/assets/eda1352c-1e56-4cab-b21c-d5801d660a9c

## 📋 Prerequisites

- A **VPC** with at least **2 public subnets** in different Availability Zones
- Running **EC2 instances** (can be in private or public subnets)
- Properly configured **security groups**:
  - ALB security group should allow port `80` or `443`
  - EC2 security group should allow traffic from ALB security group on app port (e.g., `80`, `3000`)

## ✅ Steps to Setup Load Balancer and Target Group 

### Step 1: Create a Target Group

1. Open the **EC2 Dashboard** → **Target Groups**
2. Click **“Create target group”**
3. Choose **Target type**: `Instance`
4. Configure:
   - **Name**: `my-app-tg`
   - **Protocol**: `HTTP`
   - **Port**: `80` (or your app port, e.g., `3000`)
   - **VPC**: Select your VPC
   - **Health check protocol**: `HTTP`
   - **Health check path**: `/` (or `/health` if your app has one)
5. Click **Next**
6. **Register targets**: Select the EC2 instances you want to include
7. Click **“Create target group”**


### Step 2: Create an Application Load Balancer (ALB)

1. Go to **EC2 Dashboard** → **Load Balancers**
2. Click **“Create Load Balancer”** → **Application Load Balancer**
3. Configure:
   - **Name**: `my-app-alb`
   - **Scheme**: `Internet-facing` (for public access)
   - **IP address type**: `IPv4` (or `dualstack` if needed)
4. **Network Mapping**:
   - Select **2 public subnets** in different Availability Zones
5. **Security Group**:
   - Create or select one that allows inbound traffic on port `80` or `443`



### Step 3: Configure Listeners and Routing

1. **Listener**:
   - Protocol: `HTTP`
   - Port: `80`
2. **Default Action**: Forward to your previously created **Target Group**



### Step 4: Review and Create

1. Review your settings
2. Click **“Create Load Balancer”**
3. Wait a few minutes until the ALB status is **Active**



### Step 5: Test Your Load Balancer

1. Go to **Load Balancers** in EC2 Console
2. Copy the **DNS name** of the ALB (e.g., `my-app-alb-123456.elb.amazonaws.com`)
3. Paste it in a browser:
