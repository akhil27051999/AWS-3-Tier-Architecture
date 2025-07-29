# 📦 EC2 Instance Setup with IAM Role

This guide sets up an EC2 instance to host **Grafana** in a **private subnet** of your VPC. It includes role-based access, secure inbound connections, and auto-installation of Grafana via user data.

## Video of EC2 Setup with IAM Role 

https://github.com/user-attachments/assets/dc8f7823-42b9-43d1-90c9-6d36bc46d438

## 🧱 Prerequisites

- VPC with:
  - Private subnet
  - NAT Gateway
- IAM role for EC2
- Security Group for Grafana access
- (Optional) ALB with listener on port 80 forwarding to port 3000


## ✅ Steps to Launch EC2 Server with IAM Role

### Step 1: Create IAM Role

- Go to IAM → Roles → Create Role
- Trusted Entity: EC2
- Attach Policies:
  - `AdministratorAccess`
- Name: `GrafanaRole`


### Step 2: Create Security Group

- Inbound rule:
  - Type: **HTTP**
  - Source: Anywhere IPv4
- Outbound: Allow all


### Step 3: Launch EC2 Instance

- **AMI**: Amazon Linux 2 / Ubuntu
- **Type**: `t2.micro` or higher
- **Subnet**: Private subnet
- **Auto-assign Public IP**: No
- **Security Group**: `grafana-sg`
- **IAM Role**: `GrafanaRole`





