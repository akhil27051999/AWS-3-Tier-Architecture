# AWS Three-Tier Architecture - Manual Setup Guide
## Project Overview
This guide walks you through creating a **production-ready, containerized three-tier web architecture** on AWS **manually through the AWS Console**. You'll build the same infrastructure as the CloudFormation templates but gain hands-on experience with each AWS service.
## Architecture You'll Build

<img width="3644" height="2444" alt="Untitled picture" src="https://github.com/user-attachments/assets/b97b1650-de59-4652-a0f4-edc8a955a52a" />

## Prerequisites
- AWS Account with administrative access
- GitHub repository with your application code
- Basic understanding of AWS services
- Docker application with Dockerfile

## Application Files

Your project contains:
- **Dockerfile**: `FROM public.ecr.aws/nginx/nginx` + `COPY index.html /usr/share/nginx/html`
- **index.html**: Book recommendation website with Tailwind CSS
- **appspec.yaml**: Blue/Green deployment configuration
- **taskdef.json**: ECS task definition template
