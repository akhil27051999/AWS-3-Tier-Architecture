# AWS Three-Tier Architecture - Manual Setup Guide
## Project Overview
This guide walks you through creating a **production-ready, containerized three-tier web architecture** on AWS **manually through the AWS Console**. You'll build the same infrastructure as the CloudFormation templates but gain hands-on experience with each AWS service.
## Architecture You'll Build
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                AWS CLOUD                                        │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         VPC (10.0.0.0/16)                               │    │
│  │                                                                         │    │
│  │  ┌──────────────────┐                    ┌──────────────────┐           │    │
│  │  │   AZ-1 (us-*-1a) │                    │   AZ-2 (us-*-1b) │           │    │
│  │  │                  │                    │                  │           │    │
│  │  │ ┌──────────────┐ │                    │ ┌──────────────┐ │           │    │
│  │  │ │Public Subnet │ │                    │ │Public Subnet │ │           │    │
│  │  │ │10.0.0.0/24   │ │                    │ │10.0.2.0/24   │ │           │    │ 
│  │  │ │              │ │                    │ │              │ │           │    │
│  │  │ │ NAT Gateway  │ │                    │ │              │ │           │    │
│  │  │ │ Standard ALB │ │                    │ │ Blue/Green   │ │           │    │
│  │  │ └──────────────┘ │                    │ │ ALB          │ │           │    │ 
│  │  │                  │                    │ └──────────────┘ │           │    │
│  │  │ ┌──────────────┐ │                    │ ┌──────────────┐ │           │    │
│  │  │ │Private Subnet│ │                    │ │Private Subnet│ │           │    │
│  │  │ │10.0.1.0/24   │ │                    │ │10.0.3.0/24   │ │           │    │
│  │  │ │              │ │                    │ │              │ │           │    │
│  │  │ │ ECS Tasks    │ │                    │ │ ECS Tasks    │ │           │    │
│  │  │ │ (Fargate)    │ │                    │ │ (Fargate)    │ │           │    │
│  │  │ └──────────────┘ │                    │ └──────────────┘ │           │    │
│  │  └──────────────────┘                    └──────────────────┘           │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
```
## Prerequisites
- AWS Account with administrative access
- GitHub repository with your application code
- Basic understanding of AWS services
- Docker application with Dockerfile

## Application Files

Your project contains:
- **Dockerfile**: `FROM public.ecr.aws/nginx/nginx` + `COPY index.html /usr/share/nginx/html`
- **index.html**: Book recommendation website with Tailwind CSS
- **appspec.yaml**: Blue/Green deployment configuration
- **taskdef.json**: ECS task definition template
