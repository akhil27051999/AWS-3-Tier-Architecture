# AWS Hosted Apps and Websites Summary

This repository contains three distinct AWS hosting solutions, each demonstrating different levels of complexity and infrastructure management approaches.

## Project 1: Static Website Hosting

### Method-1: AWS Amplify Static Website Deployment Overview


#### 1. Git Repository Integration (Recommended)
- Connect GitHub/GitLab/Bitbucket repository
- Automatic CI/CD pipeline with branch deployments
- Real-time updates on code commits

#### 2. Manual Upload
- Drag-and-drop files in Amplify Console
- No Git integration required

### Key Features
- Built-in SSL certificates
- Global CDN distribution
- Custom domain support
- Branch-based environments
- Atomic deployments with rollback
- Performance monitoring

### Use Cases
- React/Vue/Angular SPAs
- Static HTML/CSS/JS websites
- Documentation sites
- Portfolio websites

### Benefits
- Zero server management
- Automatic scaling
- Fast global delivery
- Integrated CI/CD
- Cost-effective for static content

### Method-2: AWS CloudFront Static Website Deployment Overview

### S3 + CloudFront (Recommended)
- Create S3 bucket for static website hosting
- Configure CloudFront distribution with S3 as origin
- Enable Origin Access Control (OAC) for security

### Architecture Components

#### S3 Bucket
- Static website hosting enabled
- Public read access via bucket policy
- Versioning for file management

#### CloudFront Distribution
- Global edge locations for low latency
- SSL/TLS certificate integration
- Custom error pages and caching rules
- Origin Access Control for S3 security

#### Route 53 (Optional)
- Custom domain configuration
- DNS management and routing
- Health checks and failover

### Key Features
- Global content delivery network
- SSL certificates via AWS Certificate Manager
- Custom domain support
- Cache invalidation capabilities
- Real-time metrics and logging
- DDoS protection via AWS Shield

### Use Cases
- Corporate websites
- Marketing landing pages
- Documentation sites
- Single Page Applications (SPAs)
- Media and asset distribution

### Benefits
- High performance with edge caching
- Cost-effective for high traffic
- Scalable to global audience
- Integrated with AWS ecosystem
- Advanced security features
- Detailed analytics and monitoring


## Project 2: Manual Web Application Infrastructure

**Objective**: Deploy a web application with manually configured AWS networking and security components

### Architecture Components
- **VPC**: Custom virtual private cloud with public/private subnets
- **Subnets**: Multi-AZ deployment across 2 availability zones
- **NAT Gateway**: Outbound internet access for private subnets
- **Route Tables**: Traffic routing configuration
- **Security Groups**: Firewall rules for EC2 instances
- **Application Load Balancer**: Traffic distribution and health checks
- **Target Groups**: Backend server registration
- **EC2 Instances**: Application servers with Auto Scaling
- **IAM Roles**: Secure access permissions

### How It Works

**Network Setup**
- Create VPC with public/private subnets across multiple AZs
- Configure Internet Gateway for public access and NAT Gateway for private subnet internet access
- Set up route tables to direct traffic flow

**Security Configuration**
- Create security groups acting as virtual firewalls for each tier
- Configure IAM roles for secure AWS service access
- Implement network isolation between tiers

**Application Deployment**
- Launch EC2 instances in private subnets with application code
- Set up Application Load Balancer in public subnets to distribute traffic
- Configure Auto Scaling Group for high availability and scaling

**Database Setup**
- Deploy RDS database in isolated database subnets
- Configure Multi-AZ deployment for redundancy
- Set up automated backups and security

**Traffic Flow**
```
Internet → Load Balancer → EC2 Instances → Database
```

### Key Steps
1. Build network infrastructure (VPC, subnets, gateways)
2. Configure security (security groups, IAM roles)
3. Deploy compute resources (EC2, Auto Scaling)
4. Set up load balancing and routing
5. Configure database and storage
6. Enable monitoring and logging

### Result
- Scalable, highly available web application
- Secure multi-tier architecture
- Manual control over all infrastructure components
- Time-intensive setup requiring AWS expertise

## Project 3: Three-Tier Architecture with CloudFormation

**Objective**: Deploy a scalable three-tier web architecture using Infrastructure as Code

### How It Works

**Infrastructure as Code Approach**
- Define AWS resources in YAML/JSON templates
- Automated deployment and management of infrastructure
- Version-controlled and repeatable deployments

**Template Structure**
- VPC template creates network foundation (subnets, gateways, security groups)
- Database template deploys Aurora MySQL cluster with Secrets Manager
- Application and web tier templates deploy compute resources

**Deployment Process**
- Templates deployed in sequence with dependencies
- CloudFormation manages resource creation and updates
- Stack outputs provide resource references between templates

### Architecture Components

**VPC Template (three-tier-vpc.yaml)**
- Creates VPC with public/private/database subnets across 2 AZs
- Configures Internet Gateway and NAT Gateways
- Sets up route tables and security groups for each tier
- Outputs VPC and subnet IDs for other templates

**Database Template (database.yaml)**
- Deploys Aurora MySQL cluster in database subnets
- Integrates with AWS Secrets Manager for credentials
- Configures Multi-AZ deployment for high availability
- Sets up database security groups and parameter groups

**Application Tier (Planned)**
- Auto Scaling Group with EC2 instances in private subnets
- Internal Application Load Balancer for traffic distribution
- IAM roles for secure AWS service access

**Web Tier (Planned)**
- Auto Scaling Group with web servers in private subnets
- External Application Load Balancer in public subnets
- SSL certificate integration and custom domain support

### Traffic Flow
```
Internet → Web Load Balancer → Web Servers → App Load Balancer → App Servers → Database
```

### Deployment Sequence
1. Deploy VPC and network infrastructure
2. Deploy database cluster
3. Deploy application tier
4. Deploy web tier

### Key Benefits
- **Consistency**: Same infrastructure across environments
- **Automation**: Reduces manual errors and deployment time
- **Version Control**: Infrastructure changes tracked in Git
- **Rollback**: Easy to revert to previous versions
- **Documentation**: Templates serve as infrastructure documentation

### CloudFormation Features Used
- Parameters for customizable deployments
- Outputs for cross-stack references
- Conditions for environment-specific resources
- Mappings for region-specific configurations
- Stack dependencies and nested stacks

### Result
- Fully automated 3-tier architecture deployment
- Scalable and highly available infrastructure
- Secure network isolation between tiers
- Consistent deployments across environments
- Infrastructure managed as code with version controlry and backup strategies
