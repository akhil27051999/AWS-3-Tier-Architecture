# Hosting a Sample Book-App on Amazon ECS using CloudFormation and CICD with Blue-Green Deployment

This sample project shows how to getting started with developing on Amazon ECS using CloudFormation. It demonstrates the following features:

- Create an Amazon ECS cluster
- Deploy a simple service
- Implement a standard CI/CD pipeline
- Implement a blue green CI/CD pipeline

## Project Structure

The sample consists of CloudFormation templates and a simple web application. Below is detailed project structure:

```go
|--book-app
   |--appspec.yaml
   |--Dockerfile
   |--index.html
   |--taskdef.json
|--templates
   |--1-network.yaml
   |--2-load-balancer.yaml
   |--3-ecs-cluster.yaml
   |--4-task-def-book.yaml
   |--5-service-book.yaml
   |--6-codepipeline.yaml
   |--7-load-balancer-blue-green.yaml
   |--8-s3-ecr.yaml
   |--9-service-book-blue-green.yaml
   |--10-codepipeline-blue-green.yaml
|--README.md
```

## Deploy A Simple Service

First, let's create a VPC by launching 01-Network.yaml stack.

```bash
aws cloudformation create-stack \
 --stack-name cfn-network \
 --template-body file://01-Network.yaml \
 --capabilities CAPABILITY_NAMED_IAM
```

Second, let's create an application load balancer by launching 02-Load-Balancer.yaml stack.

```bash
aws cloudformation create-stack \
 --stack-name cfn-load-balancer \
 --template-body file://02-Load-Balancer.yaml \
 --capabilities CAPABILITY_NAMED_IAM
```

Third, let's create a Amazon ECS cluster by launch 03-ECS-Cluster.yaml.

```bash
aws cloudformation create-stack \
 --stack-name cfn-ecs-cluster \
 --template-body file://03-ECS-Cluster.yaml \
 --capabilities CAPABILITY_NAMED_IAM

```

Fourth, create a task definition for book applciation by launching 04-Task-Def-Book.yaml stack.

```bash
aws cloudformation create-stack \
 --stack-name cfn-task-def-book \
 --template-body file://04-Task-Def-Book.yaml \
 --capabilities CAPABILITY_NAMED_IAM
```

Finally, create the book service by launch the 05-Service-Book.yaml stack.

```bash
aws cloudformation create-stack \
 --stack-name cfn-service-book \
 --template-body file://05-Service-Book.yaml \
 --capabilities CAPABILITY_NAMED_IAM
```

## Deploy Standard Pipeline

First let's create a codecommit repository, an ecr repository and a S3 bucket for codepipeline artifacts by launching 06-S3-ECR-Codepipeline.yaml.

```bash
aws cloudformation create-stack \
 --stack-name cfn-codecommit-ecr-stack \
 --template-body file://06-S3-ECR-Codepipeline.yaml \
 --capabilities CAPABILITY_NAMED_IAM
```

Second, let's create a CodePipeline consisting of CodeCommit, CodeBuild and CodeDeploy by lauching 07-Codepipeline.yaml stack. The CodeDeploy will perform a standard Amazon ECS deployment which is rolling update.

```bash
aws cloudformation create-stack \
 --stack-name cfn-codepipeline \
 --template-body file://07-Codepipeline.yaml \
 --capabilities CAPABILITY_NAMED_IAM
```

## Deploy Blue Green Pipeline

First, let's create another application load balancer by launching 08-Load-Balancer-Blue-Green.yaml stack.

```bash
aws cloudformation create-stack \
 --stack-name cfn-alb-blue-green \
 --template-body file://08-Load-Balancer-Blue-Green.yaml \
 --capabilities CAPABILITY_NAMED_IAM
```

Second, let's create another book service by launching 09-Service-Book-Blue-Green.yaml.

```bash
aws cloudformation create-stack \
 --stack-name cfn-service-book-blue-green \
 --template-body file://09-Service-Book-Blue-Green.yaml \
 --capabilities CAPABILITY_NAMED_IAM
```

Third, let's create a CodePipeline with Blue/Green ECS Deployment supported by CodeDeploy by launching 10-Codepipeline-Blue-Green.yaml

```bash
aws cloudformation create-stack \
 --stack-name cfn-pipeline-blue-green \
 --template-body file://10-Codepipeline-Blue-Green.yaml \
 --capabilities CAPABILITY_NAMED_IAM
```
