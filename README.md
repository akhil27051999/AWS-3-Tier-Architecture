# AWS Three Tier Web Architecture

## Description:

This project is a hands-on walkthrough of a three-tier web architecture in AWS. We will be creating the necessary network, security, app, and database components and configurations to run this architecture in an available and scalable manner. The project includes both manual setup instructions and Infrastructure as Code (IaC) options.

## Audience:

This demo is intended for those with technical roles, particularly Scaler Learners who want to understand AWS architecture patterns. The assumption is that you have at least some foundational AWS knowledge around VPC, EC2, RDS, S3, ELB, and the AWS Console.

## Pre-requisites:

1. An AWS account. If you don't have an AWS account, follow the instructions [here](https://aws.amazon.com/console/) and click on "Create an AWS Account" button in the top right corner to create one.
2. IDE or text editor of your choice.
3. Basic understanding of web applications and databases.

## Architecture Overview

<img width="2221" height="1500" alt="3TierArch" src="https://github.com/user-attachments/assets/dfff0107-b134-43a9-a231-f07c2847c086" />


In this architecture, a public-facing Application Load Balancer forwards client traffic to our web tier EC2 instances. The web tier is running Nginx webservers that are configured to serve a React.js website and redirects our API calls to the application tier's internal facing load balancer. The internal facing load balancer then forwards that traffic to the application tier, which is written in Node.js. The application tier manipulates data in an Aurora MySQL multi-AZ database and returns it to our web tier. Load balancing, health checks and autoscaling groups are created at each layer to maintain the availability of this architecture.

## Implementation Options

This project provides three implementation approaches:

1. **Manual Setup**: Follow the step-by-step instructions in the [original walkthrough](MANUAL_SETUP.md) to manually create and configure all resources.
2. **Infrastructure as Code**: Use the CloudFormation templates in the `/cloudformation` directory to automate the deployment.
3. **AWS CLI Deployment**: Use the AWS CLI commands in the [AWS CLI Deployment Guide](AWS_CLI_DEPLOYMENT.md) for a scripted deployment.

## Key Components

### Network Layer
- VPC with public and private subnets across two availability zones
- Internet Gateway for public internet access
- NAT Gateways for private subnet internet access
- Route tables and security groups for network isolation and security

<img width="1438" height="767" alt="FillVPCSettings" src="https://github.com/user-attachments/assets/c394f92f-ac80-4aa9-9fc9-2a78591d9663" />

### Database Layer
- Aurora MySQL cluster with multi-AZ deployment
- Private subnet placement for enhanced security
- Database subnet group for proper subnet association

<img width="1457" height="767" alt="DBConfig1" src="https://github.com/user-attachments/assets/68445ac7-ecb1-46e9-a247-d1c6dd8f235f" />

### Application Layer
- Node.js application running on EC2 instances
- Auto Scaling Group for high availability and scalability
- Internal Application Load Balancer for traffic distribution
- Connection to Aurora MySQL database for data persistence
  
<img width="1440" height="764" alt="ConfigureInstanceDetails" src="https://github.com/user-attachments/assets/e034cb70-2aca-49ba-9f79-3ccdeb799e2e" />

### Web Layer
- Nginx web server serving a React.js application
- Auto Scaling Group for high availability and scalability
- Public Application Load Balancer for internet traffic distribution
- API proxying to the application layer

<img width="1553" height="918" alt="WebPage1" src="https://github.com/user-attachments/assets/a662c8c9-94f1-4878-99ee-1d1b471641d7" />

## Security Enhancements

The project includes several security best practices:

1. **Secure Credential Management**: Using AWS Secrets Manager for database credentials
2. **Network Isolation**: Proper subnet configuration and security groups
3. **SQL Injection Prevention**: Parameterized queries in the application code
4. **Least Privilege Access**: IAM roles with minimal required permissions
5. **HTTPS Support**: Configuration options for SSL/TLS

<img width="1438" height="767" alt="WebTierSG" src="https://github.com/user-attachments/assets/d2fe1e64-cd44-4607-9a70-7d5615a03462" />

## Modernization Options

The project can be extended with these modern AWS services:

1. **Containerization**: Deploy using Amazon ECS or EKS
2. **Serverless**: Migrate the application tier to AWS Lambda and API Gateway
3. **CI/CD**: Implement automated deployment with AWS CodePipeline
4. **Monitoring**: Add observability with CloudWatch and X-Ray
5. **Edge Optimization**: Integrate with CloudFront for content delivery

## Getting Started

Choose your preferred implementation method:

- For manual setup, follow the detailed instructions in the [original walkthrough](MANUAL_SETUP.md).
- For automated deployment using CloudFormation, see the [CloudFormation README](cloudformation/README.md).
- For AWS CLI deployment, follow the [AWS CLI Deployment Guide](AWS_CLI_DEPLOYMENT.md).

<img width="1391" height="909" alt="FinalLBDNS" src="https://github.com/user-attachments/assets/0db56dac-5669-4de1-8ad8-c0c85466269e" />

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
