# AWS Projects Portfolio

## Project 1: Static Website Hosting with AWS Amplify

**Goal**: Deploy a static website using AWS Amplify for simplified hosting

**Implementation**: 
- Upload static website files (HTML, CSS, JS) directly to S3 bucket
- Deploy website using AWS Amplify console
- Amplify automatically generates DNS name for public access
- Built-in CDN and SSL certificate provisioning

**Outcome**: Live static website accessible via Amplify-generated URL with automatic HTTPS

![Static Website](https://github.com/user-attachments/assets/b8f5903e-525e-4b3e-ba1a-3082600a7ea3)

---

## Project 2: Grafana Hosting in Private Subnet

**Goal**: Host Grafana application in a secure private subnet with internet access

**Implementation**:
- Custom VPC with public and private subnets
- NAT Gateway in public subnet for outbound internet access
- Grafana deployed on EC2 instance in private subnet (app-tier)
- Security groups configured for secure access
- Internet access via NAT Gateway for downloading applications and updates

**Outcome**: Secure Grafana deployment accessible from private subnet with controlled internet connectivity

![Manual Deployment](https://github.com/user-attachments/assets/dd9bef27-0db5-4852-a40f-92103664182c)

---

## Project 3: Hybrid CloudFormation and Manual Deployment

**Goal**: Combine Infrastructure as Code with manual provisioning for flexible deployment

**Implementation**:
- CloudFormation templates deployed for network infrastructure (VPC, subnets, security groups)
- CloudFormation template for Aurora MySQL database setup
- Manual EC2 instance provisioning within the CloudFormation-created VPC
- Frontend and backend services deployed and tested on EC2 instances
- Database connectivity verified between application and Aurora cluster

**Outcome**: Hybrid approach demonstrating both automated infrastructure and manual application deployment

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
