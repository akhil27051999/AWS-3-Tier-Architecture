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
