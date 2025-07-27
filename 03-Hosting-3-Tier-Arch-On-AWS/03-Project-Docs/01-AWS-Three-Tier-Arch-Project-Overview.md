# AWS Three-Tier Architecture Overview

This document provides a comprehensive overview of the AWS three-tier web architecture implementation using CloudFormation.

## Architecture Diagram

<img width="999" height="572" alt="WebPage1" src="https://github.com/user-attachments/assets/75441d47-4b84-4c21-9c48-c8299ca7efa4" />

## Architecture Goal

Build a highly available, secure 3-tier web application with:
- **Web Tier**: Frontend in public subnets
- **App Tier**: Backend in private subnets  
- **Database Tier**: Database in private subnets
- **High Availability**: Deployed across two Availability Zones
- **Security**: Controlled routing and communication between tiers

## Network Architecture

### VPC Configuration
- **CIDR Block**: 10.0.0.0/16 (65,536 IPs)
- **DNS Support**: Enabled for ALB and RDS functionality

### Subnet Layout (6 Total)

| Tier | Count | Availability Zones | CIDR Ranges |
|------|-------|-------------------|-------------|
| Public (Web) | 2 | AZ1, AZ2 | 10.0.1.0/24, 10.0.2.0/24 |
| Private (App) | 2 | AZ1, AZ2 | 10.0.3.0/24, 10.0.4.0/24 |
| Private (DB) | 2 | AZ1, AZ2 | 10.0.5.0/24, 10.0.6.0/24 |

### Internet Connectivity
- **Internet Gateway**: Direct internet access for public subnets
- **NAT Gateways**: 2 (one per AZ) for private subnet outbound internet access
- **Elastic IPs**: 2 (one per NAT Gateway)

### Routing Configuration

| Subnet Type | Route Table | Internet Access |
|-------------|-------------|-----------------|
| Public | PublicRouteTable | Direct via IGW |
| Private App (AZ1) | PrivateRouteTable1 | Outbound via NAT1 |
| Private App (AZ2) | PrivateRouteTable2 | Outbound via NAT2 |
| Private DB | Same as App tier | Outbound via NAT |

## Security Groups

| Security Group | Purpose | Ingress Rules |
|----------------|---------|---------------|
| WebTierSG | Web instances/ALB | HTTP(80)/HTTPS(443) from 0.0.0.0/0 |
| AppTierSG | App instances | TCP 4000 from WebTierSG only |
| DBTierSG | Database instances | MySQL(3306) from AppTierSG only |
| ExternalALBSG | External load balancer | HTTP/HTTPS from internet |
| InternalALBSG | Internal load balancer | HTTP(80) from WebTierSG only |

## Traffic Flow

```
Internet → External ALB (Public Subnet)
    ↓
Web EC2 Instances (Public Subnet)
    ↓
Internal ALB (Private Subnet)
    ↓
App EC2 Instances (Private Subnet)
    ↓
Aurora MySQL Database (Private Subnet)
```
## Resource Diagram

<img width="1592" height="859" alt="Screenshot 2025-07-27 111749" src="https://github.com/user-attachments/assets/4051a41f-3ede-4a96-b175-adeeb164aaa0" />

## Resource Summary

| Resource Type | Count | Purpose |
|---------------|-------|---------|
| VPC | 1 | Main network isolation |
| Subnets | 6 | Tier separation across AZs |
| Internet Gateway | 1 | Public internet access |
| NAT Gateways | 2 | Private subnet outbound access |
| Elastic IPs | 2 | NAT Gateway static IPs |
| Route Tables | 3 | Traffic routing control |
| Security Groups | 5 | Network access control |
| DB Subnet Group | 1 | RDS multi-AZ deployment |

## Deployment Components

### Minimum EC2 Setup
- **Web Tier**: 1-2 instances (React + Nginx)
- **App Tier**: 1-2 instances (Node.js backend)
- **Database**: Aurora MySQL cluster (primary + replica)

### Load Balancers
- **External ALB**: Routes internet traffic to web tier
- **Internal ALB**: Routes web tier traffic to app tier

### High Availability Features
- Multi-AZ deployment across 2 availability zones
- Auto Scaling Groups for web and app tiers
- Aurora MySQL with read replica
- NAT Gateway redundancy

## Security Implementation

### Network Isolation
- Public subnets for web tier only
- Private subnets for app and database tiers
- No direct internet access to private resources

### Access Control
- Security groups enforce least privilege access
- Inter-tier communication on specific ports only
- Database accessible only from app tier

### Secrets Management
- Aurora credentials stored in AWS Secrets Manager
- IAM roles for secure service access
- No hardcoded credentials in applications

## Deployment Order

1. **VPC Infrastructure** (`three-tier-vpc.yaml`)
   - VPC, subnets, gateways, routing, security groups

2. **Database Tier** (`database.yaml`)
   - Aurora MySQL cluster with Secrets Manager

3. **App Tier** (`app-tier.yaml`)
   - EC2 instances, Auto Scaling, Internal ALB

4. **Web Tier** (`web-tier.yaml`)
   - EC2 instances, Auto Scaling, External ALB

## Monitoring and Logging

- **CloudWatch**: EC2 and RDS metrics
- **ALB Access Logs**: Request tracking
- **VPC Flow Logs**: Network traffic analysis
- **Application Logs**: Custom application monitoring

## Cost Optimization

- **Instance Types**: Right-sized for workload
- **NAT Gateways**: Shared across multiple subnets
- **Aurora**: Serverless option for variable workloads
- **Auto Scaling**: Automatic capacity adjustment

## Best Practices Implemented

- Infrastructure as Code with CloudFormation
- Multi-AZ deployment for high availability
- Least privilege security model
- Automated backup and recovery
- Monitoring and alerting setup
- Scalable architecture design
