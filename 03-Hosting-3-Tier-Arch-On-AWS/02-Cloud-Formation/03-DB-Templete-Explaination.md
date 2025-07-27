# Three-Tier Database CloudFormation Template

This CloudFormation template creates the database tier using Amazon Aurora MySQL for a three-tier web architecture.

https://github.com/user-attachments/assets/5f0d18ca-6e09-432d-b6eb-45a291e977ec

## Architecture Overview

Creates a highly available Aurora MySQL cluster with:
- **Primary Instance**: Read/write operations
- **Replica Instance**: Read-only operations for load distribution
- **Secrets Manager**: Secure credential storage

## Resources Created

 <img width="1742" height="1254" alt="infrastructure-composer-three-tier-arch-db yaml" src="https://github.com/user-attachments/assets/07d00d96-07b8-46cb-9d8d-3561ed6ae20c" />

### Database Infrastructure
- Aurora MySQL cluster (v8.0) with encryption enabled
- Primary DB instance
- Read replica instance
- Secrets Manager secret for credentials

### Features
- Automated backups (configurable retention)
- Storage encryption
- Multi-AZ deployment
- Private subnet placement

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| EnvironmentName | ThreeTierDemo | Prefix for resource names |
| DBInstanceClass | db.t3.small | Database instance size |
| DBName | webappdb | Database name |
| DBUsername | - | Database admin username (required) |
| DBPassword | - | Database admin password (required, 8+ chars) |
| DBBackupRetentionPeriod | 7 | Backup retention days (1-35) |

## Dependencies

Requires the VPC stack to be deployed first. Imports:
- DB subnet group
- Database security group

## Deployment

```bash
aws cloudformation create-stack \
  --stack-name three-tier-database \
  --template-body file://database.yaml \
  --parameters ParameterKey=EnvironmentName,ParameterValue=MyApp \
               ParameterKey=DBUsername,ParameterValue=admin \
               ParameterKey=DBPassword,ParameterValue=SecurePassword123 \
  --capabilities CAPABILITY_IAM
```

## Outputs

Exports for use by application tier:
- Aurora cluster endpoint (write operations)
- Aurora read endpoint (read operations)
- Secrets Manager ARN

## Security

- Database instances in private subnets only
- Security group restricts access to app tier
- Credentials stored in Secrets Manager
- Storage encryption enabled
