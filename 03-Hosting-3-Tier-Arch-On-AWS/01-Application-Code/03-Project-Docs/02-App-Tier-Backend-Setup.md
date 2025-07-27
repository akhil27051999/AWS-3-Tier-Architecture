# App Tier (Backend) Setup Guide

This guide covers deploying the Node.js backend application on EC2 instances in the private subnet, connecting to Aurora MySQL database.

## App Tier Installation Video

https://github.com/user-attachments/assets/d59dd187-fafe-4c94-817b-3d44b434a8e0

## App Tier Implementation Video

https://github.com/user-attachments/assets/41811fd3-0e97-44b3-9279-6fe79359f9a7

## Architecture Overview

The app tier consists of:
- **EC2 Instances**: Running Node.js backend in private subnets
- **Database Connection**: Aurora MySQL via environment variables or Secrets Manager
- **Load Balancer**: Internal ALB for high availability (optional)

## Prerequisites

- VPC and database stacks deployed
- Aurora MySQL cluster running
- EC2 key pair for SSH access

## EC2 Configuration

### Instance Specifications
- **AMI**: Ubuntu 20.04/22.04/24.04 LTS
- **Instance Type**: t2.micro (or suitable for workload)
- **Subnet**: Private subnet (App tier)
- **Security Group**: 
  - Inbound: Port 4000 from Web Tier
  - Outbound: Port 3306 to Database

## Installation Steps

### 1. Connect to EC2
```bash
# Via SSH (if accessible)
ssh -i "your-key.pem" ubuntu@<App-EC2-Private-IP>

# Via Session Manager (recommended for private subnets)
aws ssm start-session --target <instance-id>
```

### 2. Install Dependencies
```bash
sudo apt update
sudo apt install -y nodejs npm git
```

### 3. Deploy Application
```bash
git clone https://github.com/your-org/sample-3-tier-arch.git
cd sample-3-tier-arch/application-code/app-tier
npm install
```

### 4. Configure Environment
Create `.env` file:
```ini
PORT=4000
DB_HOST=<aurora-cluster-endpoint>
DB_USER=<database-username>
DB_PWD=<database-password>
DB_DATABASE=webappdb
AWS_REGION=us-east-1

# Optional: For Secrets Manager
DB_SECRET_NAME=<secret-name>
```

### 5. Start Application
```bash
# Development
npm start

# Production (with PM2)
sudo npm install -g pm2
pm2 start index.js --name backend-app
pm2 startup
pm2 save
```

## Health Check

Test the application:
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{ "status": "ok", "db": true }
```

## Load Balancer Integration

For Internal ALB setup:
- **Target Group**: Port 4000
- **Health Check**: `/health`
- **Targets**: App tier EC2 instances

Web tier Nginx configuration:
```nginx
location /api/ {
    proxy_pass http://<internal-alb-dns>/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Application port | Yes (4000) |
| DB_HOST | Aurora cluster endpoint | Yes |
| DB_USER | Database username | Yes |
| DB_PWD | Database password | Yes |
| DB_DATABASE | Database name | Yes (webappdb) |
| AWS_REGION | AWS region | Yes |
| DB_SECRET_NAME | Secrets Manager secret | No |

## Security Best Practices

- Use IAM roles for Secrets Manager access
- Keep instances in private subnets
- Restrict security group rules
- Use Systems Manager for secure access
- Enable CloudWatch logging

## Troubleshooting

### Common Issues
- **Database connection**: Verify security groups and endpoints
- **Port access**: Check security group rules for port 4000
- **Dependencies**: Ensure Node.js and npm versions are compatible

### Logs
```bash
# PM2 logs
pm2 logs backend-app

# Application logs
tail -f /var/log/app.log
```
