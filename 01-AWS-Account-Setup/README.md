# 🏗️ AWS Account and IAM Setup for Product Deployment

This document outlines the necessary steps to configure an AWS account and IAM user/group structure in preparation for deploying a cloud-based product.

---

## 1. 🔐 Create and Configure the AWS Account

### ✅ Step 1: Sign Up for AWS
- Go to [https://aws.amazon.com/](https://aws.amazon.com/)
- Sign up using an email address and payment method.
- Choose a strong root account password.

### ✅ Step 2: Secure the Root Account
- Enable **MFA (Multi-Factor Authentication)** on the root account.
- Sign in to AWS console > **IAM** > **Dashboard** > **Activate MFA on root account**.
- Recommended: Use a virtual MFA app like Google Authenticator.

### ✅ Step 3: Add Alternate Contacts
- Go to **AWS Account Settings**.
- Add **Billing**, **Operations**, and **Security** contacts for the account.

---

## 2. 👤 IAM User and Group Setup

### ✅ Step 4: Create IAM Groups

Create groups based on roles in your team or environment. Suggested group structure:

| Group Name       | Permissions                    | Purpose                            |
|------------------|--------------------------------|-------------------------------------|
| `Admins`         | `AdministratorAccess`          | Full access to manage everything    |
| `DevOps`         | Custom (EC2, ECS, RDS, S3, etc.) | Infrastructure deployment & config |
| `Developers`     | Custom (Read-only or limited write) | Limited access for dev/testing    |
| `Auditors`       | `SecurityAudit`                | Read-only access to logs, IAM, etc. |

Use **IAM > Groups > Create Group**, then attach appropriate AWS managed or custom policies.

---

### ✅ Step 5: Create IAM Users

Create individual IAM users for team members:

- IAM > Users > **Add user**
- Enable **programmatic access** (for CLI/SDK) and/or **console access**
- Assign the user to the appropriate IAM group
- Require password reset on first login

> 🔒 Best practice: Do not share user accounts. Each person gets their own login and access key.

---

### ✅ Step 6: Enforce Security Best Practices

- Enable **MFA for all users**
  - IAM → Users → Security credentials → Assign MFA
- Set a **strong password policy**:
  - IAM → Account settings → Set minimum password length, complexity, expiration
- Rotate **access keys** every 90 days or use roles with temporary credentials

---

## 3. 🗂️ Organizing for Multi-Environment Deployment

If your product requires **multiple environments** (e.g., dev, staging, prod), organize resources using one of these approaches:

### Option A: Use AWS Organizations (preferred for large teams)
- Create an AWS Organization.
- Set up separate **accounts** for dev/staging/prod.
- Apply **Service Control Policies (SCPs)** and central billing.

### Option B: Use Single Account with Resource Tagging
- Use tags like:
  - `Environment=dev`, `Environment=prod`
  - `Project=YourProductName`
- Set IAM permissions using **resource-level access control** based on tags.

---

# AWS Security Best Practices Checklist

This document outlines a set of foundational AWS security best practices to help protect your cloud environment. Following these principles ensures a secure, compliant, and cost-effective AWS infrastructure.

---

## 🔐 1. Configure Account Alternate Contacts

**What**:  
Set up billing, operations, and security contacts in your AWS account.

**Why**:  
Ensures the right individuals receive critical alerts, security notifications, or billing issues from AWS.

> 📍 Navigate to: **AWS Console → Account Settings → Alternate Contacts**

---

## 🔒 2. Secure Root Account with MFA

**What**:  
Enable Multi-Factor Authentication (MFA) for the AWS root user.

**Why**:  
The root account has unrestricted access to all resources. MFA protects it from unauthorized access even if credentials are compromised.

> 📍 Use a virtual or hardware MFA device (e.g., Google Authenticator, YubiKey).

---

## 👤 3. Create IAM Users with Appropriate Permissions

**What**:  
Create individual IAM users with minimal required permissions.

**Why**:  
Avoid using the root account for everyday tasks. Assign fine-grained permissions using IAM policies to apply the **principle of least privilege**.

> 📍 Use IAM groups and roles to manage access at scale.

---

## 🔐 4. Enable MFA for All IAM Users

**What**:  
Require all IAM users to use MFA for console access.

**Why**:  
MFA significantly reduces the risk of compromised accounts by adding a second verification step.

> 📍 Enforce MFA using IAM policies or AWS Organizations SCPs.

---

## 🔑 5. Configure Strong Password Policy

**What**:  
Define account-wide password rules for IAM users.

**Why**:  
Enforces complexity and rotation to protect against brute-force or credential stuffing attacks.

**Recommended Settings**:
- Minimum length: 14 characters
- Require uppercase, lowercase, numbers, and symbols
- Enable password expiration and reuse prevention

> 📍 AWS Console → IAM → Account Settings → Password Policy

---

## 📜 6. Set Up CloudTrail Logging to Secure S3 Bucket

**What**:  
Enable AWS CloudTrail to log all account activity to a secure S3 bucket.

**Why**:  
Provides a detailed audit trail of AWS API calls for security analysis, compliance, and incident response.

**Best Practices**:
- Use a dedicated S3 bucket with encryption and access controls.
- Enable log file validation.
- Send logs to CloudWatch for real-time monitoring.

---

## 🚫 7. Enable S3 Block Public Access at Account Level

**What**:  
Globally block all public access to S3 buckets unless explicitly allowed.

**Why**:  
Prevents accidental exposure of sensitive data to the internet.

> 📍 S3 Console → Block Public Access Settings → Enable all block options at the account level.

---

## 🧹 8. Clean Up Unused Network Resources

**What**:  
Identify and remove unused VPCs, security groups, elastic IPs, NAT gateways, etc.

**Why**:  
Minimizes attack surface and reduces unnecessary costs.

**Tools**:
- AWS Config
- VPC Flow Logs
- Trusted Advisor (for unused security groups)

---

## 💸 9. Configure AWS Budgets

**What**:  
Set cost and usage budgets with email/SNS alerts.

**Why**:  
Avoid unexpected charges by tracking AWS spending and resource usage.

> 📍 AWS Console → Billing → Budgets → Create Budget

---

## 🛡️ 10. Enable GuardDuty

**What**:  
Turn on Amazon GuardDuty, AWS’s threat detection service.

**Why**:  
Continuously monitors for unusual activity like:
- Unauthorized access attempts
- Malware activity
- Suspicious API usage

> 📍 GuardDuty Console → Enable → Configure S3 protection (optional)

---

## ✅ 11. Review Trusted Advisor Recommendations

**What**:  
Use AWS Trusted Advisor to check for common security and cost optimization issues.

**Why**:  
Helps you detect misconfigurations like:
- Open security groups
- Unused access keys
- Lack of MFA
- Underutilized resources

> 📍 Trusted Advisor → Dashboard → Security → Review and apply fixes

---

## 📌 Final Notes

- Always apply the **principle of least privilege**.
- Regularly audit IAM roles, access keys, and policies.
- Use automation and Infrastructure as Code (IaC) to enforce these settings consistently.


