# Web Tier (Frontend) Setup Guide

This guide covers deploying the React frontend application on EC2 instances with Nginx, proxying API calls to the app tier.

## Web Tier Installation Video

https://github.com/user-attachments/assets/3f14d8c8-bec2-4229-890a-594ac7af0fa7

## Web Tier Implementation Video

https://github.com/user-attachments/assets/dd98f319-b7fb-46b5-8881-02910b2910d7

## Architecture Overview

The web tier consists of:
- **EC2 Instances**: Running Nginx serving React app in public subnets
- **React Frontend**: Built static files served by Nginx
- **API Proxy**: Nginx forwards `/api/*` requests to app tier via Internal ALB

## Prerequisites

- VPC, database, and app tier stacks deployed
- Internal ALB for app tier configured
- EC2 key pair for SSH access

## EC2 Configuration

### Instance Specifications
- **AMI**: Ubuntu 20.04/22.04/24.04 LTS
- **Instance Type**: t2.micro (or suitable for workload)
- **Subnet**: Public subnet (Web tier)
- **Security Group**:
  - Inbound: Port 80 (HTTP) from 0.0.0.0/0
  - Inbound: Port 443 (HTTPS) from 0.0.0.0/0
  - Outbound: All traffic

## Installation Steps

### 1. Connect to EC2
```bash
ssh -i "your-key.pem" ubuntu@<Web-EC2-Public-IP>
```

### 2. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
```

### 4. Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 5. Deploy React Application
```bash
# Clone repository
git clone https://github.com/your-org/sample-3-tier-arch.git
cd sample-3-tier-arch/web-tier

# Build React app
npm install
npm run build

# Deploy to Nginx
sudo rm -rf /var/www/html/*
sudo cp -r build/* /var/www/html/
```

### 6. Configure Nginx
Edit the default site configuration:
```bash
sudo vi /etc/nginx/sites-available/default
```

Replace with:
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /var/www/html;
    index index.html;
    server_name _;
    
    # Serve React app
    location / {
        try_files $uri /index.html;
    }
    
    # Proxy API calls to app tier
    location /api/ {
        proxy_pass http://<INTERNAL-ALB-DNS>/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Note**: Replace `<INTERNAL-ALB-DNS>` with your app tier's Internal ALB DNS name.

### 7. Test and Restart Nginx
```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Access Application

Navigate to: `http://<Web-EC2-Public-IP>`

## Load Balancer Integration

For External ALB setup:
- **Target Group**: Port 80
- **Health Check**: `/`
- **Targets**: Web tier EC2 instances

## Configuration Files

### Environment Variables
Create `.env` file in React project:
```env
REACT_APP_API_URL=/api
REACT_APP_ENVIRONMENT=production
```

### Nginx Configuration Template
```nginx
# /etc/nginx/sites-available/default
server {
    listen 80;
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri /index.html;
    }
    
    location /api/ {
        proxy_pass http://internal-alb-dns/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Security Best Practices

- Use HTTPS with SSL certificates
- Implement security headers in Nginx
- Restrict API access through security groups
- Enable CloudWatch logging
- Use WAF for additional protection

## Troubleshooting

### Common Issues
- **502 Bad Gateway**: Check app tier connectivity
- **404 on refresh**: Ensure `try_files` directive is correct
- **API calls failing**: Verify Internal ALB DNS and security groups

### Useful Commands
```bash
# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Test Nginx configuration
sudo nginx -t

# Reload Nginx configuration
sudo systemctl reload nginx
```

## Monitoring

- **CloudWatch**: Monitor EC2 metrics
- **ALB Metrics**: Track request counts and latency
- **Nginx Logs**: Monitor access and error patterns
