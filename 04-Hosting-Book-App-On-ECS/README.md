
# AWS Three-Tier Containerized Web Architecture
## Project Overview
This project demonstrates a **production-ready, containerized three-tier web architecture** on AWS with **dual CI/CD deployment strategies**. It showcases modern cloud-native practices including Infrastructure as Code, containerization, auto-scaling, and zero-downtime deployments.
## Architecture Diagram
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
│  │  │ │ Standard ALB │ │                    │ │ Blue/Green   │ │           │    │
│  │  │ │ NAT Gateway  │ │                    │ │ ALB          │ │           │    │
│  │  │ └──────────────┘ │                    │ └──────────────┘ │           │    │
│  │  │                  │                    │                  │           │    │
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
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CI/CD PIPELINES                                    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                        Standard Pipeline                                │    │
│  │  GitHub → CodeBuild → ECR → ECS (Rolling Update)                        │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                       Blue/Green Pipeline                               │    │
│  │  GitHub → CodeBuild → ECR → CodeDeploy → ECS (Zero Downtime)            │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
```
## Three-Tier Architecture Components

### **Tier 1: Presentation Layer (Web Tier)**
**Purpose**: Handle incoming user requests and distribute traffic
- **Application Load Balancers**: Route traffic to healthy application instances
- **Public Subnets**: Internet-facing components across multiple AZs
- **Internet Gateway**: Provides internet connectivity
- **Security Groups**: Control inbound traffic (HTTP/HTTPS only)
**Use Case**: Load balancing, SSL termination, health checks
### **Tier 2: Application Layer (Logic Tier)**
**Purpose**: Process business logic and application functionality
- **ECS Fargate Cluster**: Serverless container orchestration
- **ECS Services**: Manage container lifecycle and scaling
- **Private Subnets**: Isolated from direct internet access
- **Auto Scaling**: Automatically adjust capacity based on demand
**Use Case**: Run containerized applications, process requests, scale dynamically
### **Tier 3: Data Layer (Database Tier)**
**Purpose**: Store and manage application data
- **Aurora MySQL Cluster**: Managed database with high availability
- **Primary & Replica Instances**: Read/write separation and failover
- **Secrets Manager**: Secure credential storage
- **Database Subnets**: Isolated network for database access
**Use Case**: Data persistence, backup, disaster recovery
## Deployment Strategies
### **1. Standard Pipeline (Rolling Updates)**
**Purpose**: Traditional deployment approach for development/staging
**Flow**:
1. **Source**: Developer pushes code to GitHub
2. **Build**: CodeBuild creates Docker image and pushes to ECR
3. **Deploy**: ECS performs rolling update (gradual task replacement)
**Characteristics**:
- ✅ Simple and straightforward
- ✅ Good for non-critical environments
- ❌ Brief downtime during updates
- ❌ Manual rollback process
**Use Cases**: Development, testing, staging environments
### **2. Blue/Green Pipeline (Zero Downtime)**
**Purpose**: Production-grade deployment with zero downtime
**Flow**:
1. **Source**: Developer pushes code to GitHub
2. **Build**: CodeBuild creates Docker image and deployment artifacts
3. **Deploy**: CodeDeploy creates new environment (Green) and switches traffic
**Characteristics**:
- ✅ Zero downtime deployments
- ✅ Instant rollback capability
- ✅ Production-ready
- ❌ More complex setup
- ❌ Higher resource usage during deployment
**Use Cases**: Production environments, critical applications
## Traffic Flow Journey
### **End-to-End Request Path**
```
1. User Request (Browser/Mobile App)
   ↓
2. Internet Gateway (Entry point to AWS)
   ↓
3. Application Load Balancer (Public Subnets)
   ├── Health Check: Verify target availability
   ├── Load Distribution: Round-robin across healthy targets
   └── SSL Termination: Handle HTTPS encryption
   ↓
4. ECS Fargate Tasks (Private Subnets)
   ├── Container Processing: Execute business logic
   ├── Auto Scaling: Add/remove tasks based on CPU
   └── Database Connection: Query/update data
   ↓
5. Aurora Database (Database Subnets)
   ├── Primary Instance: Handle writes
   ├── Replica Instance: Handle reads
   └── Return data to application
   ↓
6. Response Journey (Reverse path back to user)
```
### **Security Flow**
- **Public Subnets**: Only load balancers exposed to internet
- **Private Subnets**: Applications isolated from direct internet access
- **Database Subnets**: Only accessible from application tier
- **NAT Gateway**: Enables outbound internet for private resources
## Project Components
### **Infrastructure Templates**
1. **1-network.yaml**: VPC, subnets, security groups, routing
2. **2-load-balancer.yaml**: Standard ALB for rolling deployments
3. **3-ecs-cluster.yaml**: ECS Fargate cluster with cost optimization
4. **4-task-def-book.yaml**: Container specification and logging
5. **5-service-book.yaml**: ECS service with auto scaling
### **CI/CD Templates**
6. **23-s3-ecr.yaml**: Container registry and artifact storage
7. **6-codepipeline.yaml**: Standard deployment pipeline
8. **22-load-balancer-blue-green.yaml**: Blue/Green ALB setup
9. **25-service-book-blue-green.yaml**: Blue/Green ECS service
10. **26-codepipeline-blue-green.yaml**: Zero-downtime pipeline
### **Database Template**
11. **database.yaml**: Aurora MySQL cluster with high availability
## Key Features & Benefits
### **High Availability**
- **Multi-AZ Deployment**: Resources distributed across availability zones
- **Auto Scaling**: Automatic capacity adjustment (1-4 tasks)
- **Health Checks**: Continuous monitoring and automatic recovery
- **Database Replication**: Primary-replica setup with automatic failover
### **Security**
- **Network Isolation**: Three-tier security with private subnets
- **Security Groups**: Least privilege access controls
- **IAM Roles**: Service-specific permissions
- **Secrets Management**: Encrypted credential storage
### **Cost Optimization**
- **Fargate Spot**: 20% of capacity on Spot instances (70% cost savings)
- **Single NAT Gateway**: Shared across private subnets
- **Auto Scaling**: Scale down during low traffic periods
- **Log Retention**: 7-day CloudWatch log retention
### **Operational Excellence**
- **Infrastructure as Code**: All resources defined in CloudFormation
- **Container Insights**: Built-in monitoring and logging
- **Automated Deployments**: CI/CD pipelines with GitHub integration
- **Zero Downtime**: Blue/Green deployment capability
## Use Cases
### **Development Teams**
- **Standard Pipeline**: Quick iterations and testing
- **Container-based**: Consistent environments across dev/prod
- **Auto Scaling**: Handle varying development loads
### **Production Applications**
- **Blue/Green Pipeline**: Zero-downtime deployments
- **High Availability**: Multi-AZ resilience
- **Security**: Network isolation and access controls
### **Enterprise Applications**
- **Compliance**: Infrastructure as Code for audit trails
- **Scalability**: Automatic capacity management
- **Monitoring**: Comprehensive logging and metrics
## Monitoring & Observability
### **Application Monitoring**
- **Container Insights**: ECS cluster and service metrics
- **CloudWatch Logs**: Centralized application logging
- **Custom Metrics**: CPU, memory, request metrics
- **Health Checks**: ALB monitors application availability
### **Pipeline Monitoring**
- **Build Metrics**: Success rates and build times
- **Deployment Tracking**: Pipeline execution history
- **Error Alerting**: Failed deployment notifications
## Prerequisites
- AWS Account with appropriate permissions
- GitHub repository with application code
- Docker application with Dockerfile
- Basic understanding of containerization concepts
## Getting Started
1. **Clone Repository**: Get the CloudFormation templates
2. **Setup GitHub Connection**: Configure CodeStar connection
3. **Deploy Infrastructure**: Run CloudFormation stacks in sequence
4. **Test Application**: Verify load balancer endpoints
5. **Trigger Pipeline**: Push code to test CI/CD automation
## Best Practices Demonstrated
1. **Infrastructure as Code**: Repeatable, version-controlled infrastructure
2. **Immutable Deployments**: Container-based deployments
3. **Zero Downtime**: Blue/Green deployment strategy
4. **Auto Scaling**: Responsive to traffic patterns
5. **Security**: Network isolation and least privilege access
6. **Monitoring**: Comprehensive logging and metrics
7. **Cost Optimization**: Spot instances and resource right-sizing
This architecture provides a robust foundation for modern web applications with enterprise-grade reliability, security, and operational excellence.
