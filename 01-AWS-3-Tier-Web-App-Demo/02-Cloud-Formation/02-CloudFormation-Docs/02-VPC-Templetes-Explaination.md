# Three-Tier VPC CloudFormation Template

This CloudFormation template creates the foundational network infrastructure for a three-tier web architecture on AWS.

https://github.com/user-attachments/assets/08d84885-8089-4fb1-8390-54b58016633c

## Architecture Overview

Creates a highly available VPC with:
- **Public Subnets**: For load balancers and NAT gateways
- **Private App Subnets**: For application servers
- **Private DB Subnets**: For database instances


## Resources Created

<img width="3470" height="1750" alt="infrastructure-composer-three-tier-arch-vpc yaml" src="https://github.com/user-attachments/assets/9b1c53e7-6830-4d70-8351-b36480fbd851" />

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
