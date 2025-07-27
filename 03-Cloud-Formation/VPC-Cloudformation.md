# AWS CloudFormation – Core Concepts

AWS CloudFormation is an Infrastructure as Code (IaC) service that allows you to define and manage AWS infrastructure using YAML or JSON templates. This ensures safe, repeatable, and automated deployments of cloud resources.

## How It Works

### 1. Write a CloudFormation Template
Define infrastructure as code using YAML or JSON.

A template typically includes:

- **Resources**: AWS services like VPCs, EC2 instances, RDS, etc.
- **Parameters** *(optional)*: Dynamic input values.
- **Outputs** *(optional)*: Useful information after stack creation.
- **Mappings** *(optional)*: Lookup tables for configuration.
- **Conditions** *(optional)*: Conditionally create resources.

### 2. Deploy a Stack
A **stack** is a collection of AWS resources created and managed together as a single unit.

- CloudFormation handles **dependency resolution** (e.g., IGW before route table).
- Stack creation is **idempotent**: same template = same infra.

### 3. Update Infrastructure Using Change Sets
You can update resources by modifying the template and submitting a **Change Set**:

- Preview the proposed changes.
- Apply only if the changes look safe.
- Avoids unexpected downtime or data loss.

---

## Benefits of CloudFormation

| Feature             | Description                                                |
|---------------------|------------------------------------------------------------|
| Version Control   | Templates are files, perfect for Git or CI/CD integration |
| Safe Deployments  | Rollbacks on failure; Change Sets for previewing changes  |
| Drift Detection   | Detects if resources were changed outside CloudFormation  |
| Reusability       | Use **nested stacks** and **modules** for DRY templates    |
| AWS Integration   | Works natively with IAM, CloudTrail, CodePipeline, etc.   |




# Three-Tier VPC CloudFormation Template

This CloudFormation template creates the foundational network infrastructure for a three-tier web architecture on AWS.

## Architecture Overview

Creates a highly available VPC with:
- **Public Subnets**: For load balancers and NAT gateways
- **Private App Subnets**: For application servers
- **Private DB Subnets**: For database instances

## Resources Created

### Network Infrastructure
- VPC with DNS support enabled
- Internet Gateway
- 2 Public subnets (across 2 AZs)
- 2 Private application subnets (across 2 AZs)
- 2 Private database subnets (across 2 AZs)
- 2 NAT Gateways with Elastic IPs
- Route tables and associations

### Security Groups
- **WebTierSG**: HTTP/HTTPS access from internet
- **AppTierSG**: Port 4000 access from web tier only
- **DBTierSG**: MySQL access from app tier only
- **ExternalALBSG**: HTTP/HTTPS for external load balancer
- **InternalALBSG**: HTTP access from web tier

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| EnvironmentName | ThreeTierDemo | Prefix for resource names |
| VpcCIDR | 10.0.0.0/16 | VPC CIDR block |
| PublicSubnet1CIDR | 10.0.1.0/24 | Public subnet 1 CIDR |
| PublicSubnet2CIDR | 10.0.2.0/24 | Public subnet 2 CIDR |
| PrivateAppSubnet1CIDR | 10.0.3.0/24 | App subnet 1 CIDR |
| PrivateAppSubnet2CIDR | 10.0.4.0/24 | App subnet 2 CIDR |
| PrivateDBSubnet1CIDR | 10.0.5.0/24 | DB subnet 1 CIDR |
| PrivateDBSubnet2CIDR | 10.0.6.0/24 | DB subnet 2 CIDR |

## Deployment

```bash
aws cloudformation create-stack \
  --stack-name three-tier-vpc \
  --template-body file://three-tier-vpc.yaml \
  --parameters ParameterKey=EnvironmentName,ParameterValue=MyApp
```

## Outputs

The template exports key resource IDs for use by other stacks:
- VPC ID
- Subnet IDs
- Security Group IDs

## Dependencies

This template has no dependencies and should be deployed first in the three-tier architecture.
