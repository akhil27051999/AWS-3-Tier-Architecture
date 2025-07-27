# 📦 What Is an S3 Bucket?

An S3 bucket is a container for storing objects (files, data, backups, etc.) in Amazon S3 (Simple Storage Service), a highly scalable and secure cloud storage service provided by AWS (Amazon Web Services).

# 📦 Creating an Amazon S3 Bucket Using AWS Console

This document provides step-by-step instructions to create an S3 bucket using the AWS Management Console. Amazon S3 (Simple Storage Service) is used to store and retrieve any amount of data at any time.

## Video of S3 Bucket Creation

https://github.com/user-attachments/assets/f46cc499-f101-44ae-8e6b-4884c24b2305

## 📋 Prerequisites

- An active [AWS account](https://aws.amazon.com/)
- Console access to the AWS Management Console
- IAM permissions to create S3 buckets if you are a user (e.g., `s3:CreateBucket`)


## ✅ Steps to Create an S3 Bucket

### Step 1: Sign in to AWS Console

- Go to [https://console.aws.amazon.com/s3](https://console.aws.amazon.com/s3)
- Log in with your IAM user credentials


### Step 2: Create Bucket

- Click **“Create bucket”** at the top-right of the S3 dashboard


### Step 3: Configure Bucket Settings

#### Bucket Name
- Enter a **globally unique** name (e.g., `my-product-storage-bucket`)
- Bucket names must be DNS-compliant: lowercase, no spaces, 3–63 characters

#### AWS Region
- Select the region closest to your users or application (e.g., `US East (N. Virginia) us-east-1`)


### Step 4: Set Object Ownership and ACLs

- **Object Ownership**: `Bucket owner enforced (recommended)`
- **ACLs**: Leave disabled

This prevents access issues and follows best security practices.


### Step 5: Block Public Access

- Leave all **Block Public Access** settings **enabled (recommended)** unless you’re hosting a public website
- Block all public ACLs and policies


### Step 6: Enable Bucket Versioning 

- Versioning allows you to preserve, retrieve, and restore every version of every object
- Recommended for backup and audit purposes


### Step 7: Configure Default Encryption *(Optional but Recommended)*

- Enable **Server-Side Encryption (SSE)**
- Choose either:
  - `SSE-S3` – Amazon S3 managed keys
  - `SSE-KMS` – AWS Key Management Service for customer-managed keys



### Step 8: Add Tags

Use tags to categorize buckets for billing, automation, and management.

Example:
- `Environment` – Production/prod
- `Project` - AWS-3-Tier-Arch


### Step 9: Review and Create

- Review all settings
- Click **“Create bucket”**

You’ll be redirected to the S3 bucket list, where you’ll see your new bucket.


## Best Practices

- Always **block public access** unless the use case requires it.
- Use **encryption** (SSE-S3 or SSE-KMS) to protect data at rest.
- Enable **versioning** for disaster recovery.
- Apply **IAM policies** to control access.
- Use **CloudTrail** to log S3 activity for auditing.


