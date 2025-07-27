# IaC Generator for AWS Three-Tier Architecture

This guide covers using Infrastructure as Code (IaC) generators to create CloudFormation templates for the three-tier architecture.

## Overview

IaC generators help create infrastructure templates programmatically, reducing manual template writing and ensuring consistency across deployments.

## Supported IaC Generators

### AWS CDK (Cloud Development Kit)
Generate CloudFormation from code:

```bash
# Install CDK
npm install -g aws-cdk

# Initialize project
cdk init app --language typescript
cdk bootstrap

# Deploy
cdk deploy
```

### Terraform with CDK for Terraform (CDKTF)
```bash
# Install CDKTF
npm install -g cdktf-cli

# Initialize
cdktf init --template typescript --providers aws

# Generate and deploy
cdktf synth
cdktf deploy
```

### Pulumi
```bash
# Install Pulumi
curl -fsSL https://get.pulumi.com | sh

# Create project
pulumi new aws-typescript

# Deploy
pulumi up
```

## CDK Implementation Example

### Project Structure
```
cdk-three-tier/
├── lib/
│   ├── vpc-stack.ts
│   ├── database-stack.ts
│   ├── app-tier-stack.ts
│   └── web-tier-stack.ts
├── bin/
│   └── app.ts
└── package.json
```

### VPC Stack (CDK)
```typescript
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Stack, StackProps } from 'aws-cdk-lib';

export class VpcStack extends Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'ThreeTierVpc', {
      cidr: '10.0.0.0/16',
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: 'Database',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });
  }
}
```

## Generator Benefits

### Advantages
- **Type Safety**: Compile-time error checking
- **Code Reuse**: Modular, reusable components
- **IDE Support**: IntelliSense and auto-completion
- **Testing**: Unit tests for infrastructure
- **Version Control**: Standard code practices

### Use Cases
- **Complex Architectures**: Multi-tier applications
- **Repeated Deployments**: Multiple environments
- **Team Collaboration**: Shared infrastructure patterns
- **CI/CD Integration**: Automated deployments

## Conversion Process

### From CloudFormation to CDK
```bash
# Install CDK migration tool
npm install -g @aws-cdk/cloudformation-include

# Convert existing template
cdk init app --language typescript
# Import CloudFormation template in CDK code
```

### From Manual Resources to IaC
1. **Inventory**: List existing resources
2. **Import**: Use `cdk import` or `terraform import`
3. **Generate**: Create IaC templates
4. **Validate**: Compare with existing resources
5. **Deploy**: Switch to IaC management

## Best Practices

### Code Organization
- **Separate Stacks**: One stack per tier
- **Shared Resources**: Common VPC, security groups
- **Environment Config**: Dev, staging, prod parameters
- **Modular Design**: Reusable constructs

### Development Workflow
```bash
# Development cycle
cdk diff          # Preview changes
cdk synth         # Generate CloudFormation
cdk deploy        # Deploy to AWS
cdk destroy       # Clean up resources
```

### Testing Strategy
```typescript
// Unit test example
import { Template } from 'aws-cdk-lib/assertions';
import { VpcStack } from '../lib/vpc-stack';

test('VPC Created', () => {
  const template = Template.fromStack(new VpcStack(app, 'TestStack'));
  template.hasResourceProperties('AWS::EC2::VPC', {
    CidrBlock: '10.0.0.0/16'
  });
});
```

## Deployment Commands

### CDK Deployment
```bash
# Deploy all stacks
cdk deploy --all

# Deploy specific stack
cdk deploy VpcStack

# Deploy with parameters
cdk deploy --parameters EnvironmentName=Production
```

### Terraform Deployment
```bash
# Initialize and plan
terraform init
terraform plan

# Apply changes
terraform apply

# Destroy resources
terraform destroy
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Deploy Infrastructure
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install -g aws-cdk
      - run: cdk deploy --require-approval never
```

## Troubleshooting

### Common Issues
- **Bootstrap Required**: Run `cdk bootstrap` first
- **Permission Errors**: Check IAM policies
- **Resource Conflicts**: Use unique naming
- **Stack Dependencies**: Deploy in correct order

### Debugging Commands
```bash
# View generated CloudFormation
cdk synth

# Compare with deployed stack
cdk diff

# View stack events
aws cloudformation describe-stack-events --stack-name StackName
```

## Migration Strategy

### Phased Approach
1. **Start Small**: Convert simple resources first
2. **Test Thoroughly**: Validate each conversion
3. **Gradual Migration**: Move tier by tier
4. **Monitor**: Watch for issues during transition
5. **Document**: Update procedures and runbooks

This approach ensures reliable infrastructure management through code while maintaining the flexibility to adapt to changing requirements.
