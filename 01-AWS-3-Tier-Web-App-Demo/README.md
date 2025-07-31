# AWS Three-Tier Architecture Overview

This document provides a comprehensive overview of the AWS three-tier web architecture implementation using CloudFormation.

## Architecture Diagram

<img width="1160" height="810" alt="Three-Tier-WebApp-Demo drawio" src="https://github.com/user-attachments/assets/09a67a51-81d3-4184-bfdc-f5633ae1135e" />

## Table of Contents

- [Architecture Diagram](#architecture-diagram)
- [Architecture Goal](#architecture-goal)
- [AWS Services Used](#aws-services-used)
- [Network Architecture](#network-architecture)
- [Security Groups](#security-groups)
- [Traffic Flow](#traffic-flow)
- [Resource Summary](#resource-summary)
- [Deployment Components](#deployment-components)
- [Security Implementation](#security-implementation)
- [Deployment Order](#deployment-order)
- [Monitoring and Logging](#monitoring-and-logging)
- [Cost Optimization](#cost-optimization)
- [Best Practices Implemented](#best-practices-implemented)


## Architecture Goal

Build a highly available, secure 3-tier web application with:
- **Web Tier**: Frontend in public subnets
- **App Tier**: Backend in private subnets  
- **Database Tier**: Database in private subnets
- **High Availability**: Deployed across two Availability Zones
- **Security**: Controlled routing and communication between tiers

## AWS Services Used

This project implements a classic high-availability three-tier web application architecture using a combination of EC2, load balancing, and managed database services. Below is the categorized list of AWS services utilized:

| Category                  | AWS Service                   | Purpose                                                                 |
|---------------------------|-------------------------------|-------------------------------------------------------------------------|
| Infrastructure & Networking | **Amazon VPC**                | Isolated network environment for all tiers                            |
|                           | **Subnets (Public & Private)** | Separates Web, App, and DB tiers across multiple AZs                   |
|                           | **Internet Gateway**          | Provides internet access to public subnets                              |
|                           | **NAT Gateways**              | Enables private subnets to access the internet                          |
|                           | **Elastic IPs**              | Used with NAT Gateways for static outbound IPs                           |
|                           | **Route Tables**              | Controls traffic routing within the VPC                                 |
|                           | **Security Groups**           | Manages access control between tiers and from internet                  |
|                           | **DB Subnet Group**           | Required for multi-AZ Aurora deployments                                |
| Compute & Hosting         | **Amazon EC2**                | Hosts Web (React + Nginx) and App (Node.js) tiers                       |
|                           | **Auto Scaling Groups**       | Automatically adjusts EC2 instances based on traffic                    |
| Load Balancing            | **Application Load Balancer (ALB)** | External ALB for web tier, internal ALB for app tier              |
| Database                  | **Amazon Aurora MySQL**       | Managed, scalable MySQL-compatible relational database                  |
|                           | **Aurora Read Replica**        | Provides high availability and performance for read operations         |
| Security & Secrets        | **AWS IAM**                   | Defines access permissions for EC2 and Secrets Manager                  |
|                           | **AWS Secrets Manager**        | Stores Aurora credentials securely                                     |
| Orchestration & Automation | **AWS CloudFormation**         | Automates provisioning of all infrastructure components               |


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
