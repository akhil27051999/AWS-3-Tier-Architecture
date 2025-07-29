# AWS Hosted Apps and Websites Summary

This repository contains three distinct AWS hosting solutions, each demonstrating different levels of complexity and infrastructure management approaches.


# AWS Projects Portfolio

## Project 1: Static Website Hosting

**Goal**: Deploy a static website using AWS managed services

**Implementation**: 
- S3 bucket for file storage with static website hosting
- CloudFront CDN for global content delivery
- Route 53 for custom domain (optional)

**Outcome**: Fast, scalable static website with global reach and SSL support

![Static Website](https://github.com/user-attachments/assets/b8f5903e-525e-4b3e-ba1a-3082600a7ea3)

---

## Project 2: Manual Web Application Deployment

**Goal**: Build a web application infrastructure manually through AWS Console

**Implementation**:
- Custom VPC with public/private subnets across multiple AZs
- Application Load Balancer for traffic distribution
- EC2 instances with Auto Scaling for high availability
- RDS database with Multi-AZ deployment

**Outcome**: Fully functional, scalable web application with manual infrastructure control

![Manual Deployment](https://github.com/user-attachments/assets/dd9bef27-0db5-4852-a40f-92103664182c)

---

## Project 3: Three-Tier Architecture with CloudFormation

**Goal**: Automate infrastructure deployment using Infrastructure as Code

**Implementation**:
- CloudFormation templates for VPC, database, and application tiers
- Aurora MySQL cluster with Secrets Manager integration
- Automated deployment with stack dependencies
- Version-controlled infrastructure

**Outcome**: Repeatable, consistent three-tier architecture deployments

![CloudFormation Architecture](https://github.com/user-attachments/assets/01a5a360-e550-4b76-82c7-8a27800ec777)

---

## Project 4: ECS with CI/CD Pipelines

**Goal**: Deploy containerized applications with automated deployment pipelines

**Implementation**:

### Manual Deployment
- VPC setup with public/private subnets and security groups
- Application Load Balancer with target groups
- ECS Fargate cluster with task definitions and services
- ECR repository for container images

### Standard CI/CD Pipeline
- CodeCommit repository for source control
- CodeBuild for Docker image building
- CodeDeploy for rolling updates to ECS service

### Blue-Green Deployment
- Separate load balancer for zero-downtime deployments
- CodeDeploy creates new task sets and gradually shifts traffic
- Automated rollback on deployment failures

**Outcome**: Production-ready containerized application with multiple deployment strategies

---

*Each project includes detailed implementation guides, troubleshooting tips, and cleanup procedures. Explore individual project folders for complete documentation and video tutorials.*
