# AWS CloudFormation

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

## Benefits of CloudFormation

| Feature             | Description                                                |
|---------------------|------------------------------------------------------------|
| Version Control   | Templates are files, perfect for Git or CI/CD integration |
| Safe Deployments  | Rollbacks on failure; Change Sets for previewing changes  |
| Drift Detection   | Detects if resources were changed outside CloudFormation  |
| Reusability       | Use **nested stacks** and **modules** for DRY templates    |
| AWS Integration   | Works natively with IAM, CloudTrail, CodePipeline, etc.   |

# AWS Infrastructure Composer – Visual Tool for IaC

**AWS Infrastructure Composer** is a **visual design tool** for creating and managing AWS CloudFormation templates. It is part of **AWS Application Composer**, accessible directly from the AWS Management Console.

Ideal for quickly prototyping, visualizing, and building infrastructure as code — without manually writing YAML/JSON.


## How It Works

### 1. Drag and Drop AWS Resources
- Choose from common AWS services like:
  - EC2, Lambda, S3, API Gateway, DynamoDB, SNS, etc.
- Arrange them visually on the canvas.
- Create logical connections between services (e.g., API Gateway → Lambda → DynamoDB).


### 2. Behind the Scenes
- Composer automatically **generates a CloudFormation YAML template** based on the visual layout.
- You can:
  - Download the generated template
  - Deploy directly from the Composer interface
  - Copy-paste into your CI/CD pipeline or IaC project


### 3. Bidirectional Editing
- Modify the infrastructure **visually or via code editor**.
- Both views stay **synchronized** in real time.
- Visual edits reflect in YAML, and code edits reflect in the UI instantly.


## Benefits

| Feature                    | Description                                               |
|----------------------------|-----------------------------------------------------------|
| No YAML Expertise Needed | Great for beginners or teams starting with IaC            |
| Rapid Prototyping        | Visually design and validate infrastructure quickly       |
| Sync with Code          | Visual & YAML editors are always in sync                  |
| CloudFormation Export   | Fully compatible with standard CloudFormation workflows   |
| Learning Tool          | Helps developers understand relationships between services |




