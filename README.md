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

## Project 4: ECS Book App with Manual and Automated Deployments

**Goal**: Deploy containerized Book App using manual setup and CloudFormation-based CI/CD pipelines

**Implementation**:

### Manual Deployment
- Manual creation of VPC components (subnets, security groups, NAT gateway)
- ECR repository setup for container image storage
- ECS Fargate cluster and service configuration through AWS Console
- Application Load Balancer and target groups manual setup
- IAM roles creation for ECS task execution
- Local Docker image build and push to ECR using AWS CLI
- Book App deployed and accessible via ALB DNS name

### Standard CI/CD Pipeline
- CloudFormation templates for automated CodePipeline setup
- CodeCommit, CodeBuild, and CodeDeploy integration
- Automated rolling updates to existing ECS service
- Pipeline triggers on code commits for continuous deployment

### Blue-Green Deployment
- CloudFormation templates for blue-green deployment pipeline
- Separate load balancer configuration for zero-downtime deployments
- Automated traffic shifting between blue and green environments
- Safe rollback capabilities on deployment failures

**Outcome**: Containerized Book App with manual control and automated CI/CD options for different deployment strategies

---

*Each project includes detailed implementation guides, troubleshooting tips, and cleanup procedures. Explore individual project folders for complete documentation and video tutorials.*
