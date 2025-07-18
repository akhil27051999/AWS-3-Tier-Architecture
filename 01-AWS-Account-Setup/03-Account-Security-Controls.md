
# AWS Account Security Best Practices

This guide outlines essential security controls and recommendations to keep your AWS account secure, including detailed implementation steps.

## Account Security Controls

### ACCT.01 Set account-level contacts to valid email distribution lists

**Implementation Steps:**
1. Log in to the AWS Management Console
2. Navigate to Account settings (click on your account name in the top right corner)
3. Scroll to "Alternate Contacts" section
4. Add or update the following contacts with distribution lists:
   - Billing contact: finance-team@example.com
   - Operations contact: ops-team@example.com
   - Security contact: security-team@example.com
5. Click "Save changes"

https://github.com/user-attachments/assets/daf12f0d-4f5b-41be-b702-2970fdaacc7d

### ACCT.02 Restrict use of the root user

**Implementation Steps:**
1. Create an administrative IAM user:
   - Go to IAM console
   - Click "Users" → "Add users"
   - Create user with AdministratorAccess policy
   - Log out as root and log in as this admin user for daily tasks
2. Enable MFA for root user:
   - Log in as root user
   - Go to "Security credentials"
   - Under "Multi-factor authentication (MFA)", click "Assign MFA device"
   - Choose device type (Virtual MFA, Security Key, or Hardware MFA)
   - Follow the setup wizard
3. Store root credentials securely:
   - Use a password manager with strong encryption
   - Consider splitting knowledge of credentials among trusted individuals
   - Document recovery procedures
  

https://github.com/user-attachments/assets/f64f8693-3680-4b76-a907-adec2fd528ae   

### ACCT.03 Configure console access for each user

**Implementation Steps:**
1. Create individual IAM users:
   - Go to IAM console → "Users" → "Add users"
   - Enter username
   - Select "AWS Management Console access"
   - Choose "Autogenerated password" or "Custom password"
   - Require password reset at next sign-in
2. Document user onboarding process:
   ```
   1. Create IAM user with appropriate permissions
   2. Enable MFA
   3. Share temporary credentials securely
   4. Require password change on first login
   5. Document access granted in user registry
   ```
3. Document user offboarding process:
   ```
   1. Disable console access immediately
   2. Remove from IAM groups
   3. Delete access keys
   4. Document access removal in user registry
   5. Delete user after review period
   ```

https://github.com/user-attachments/assets/14ee3aa8-3501-4633-a6b2-f1fe07677afd

### ACCT.04 Assign permissions

**Implementation Steps:**
1. Create IAM groups for common job functions:
   - Go to IAM console → "User groups" → "Create group"
   - Name the group (e.g., "Developers", "DBAdmins")
   - Attach policies based on job requirements
2. Add users to appropriate groups:
   - Select the group → "Add users to group"
   - Select users to add
3. Create custom policies when needed:
   - Go to IAM console → "Policies" → "Create policy"
   - Use the visual editor or JSON editor
   - Follow least privilege principle
4. Set up regular permission reviews:
   - Use IAM Access Analyzer
   - Schedule quarterly reviews of permissions
   - Document review process and findings

### ACCT.05 Require multi-factor authentication to log in

**Implementation Steps:**
1. Enable MFA for individual users:
   - Go to IAM console → Select user → "Security credentials" tab
   - Under "Multi-factor authentication (MFA)", click "Assign MFA device"
   - Follow the setup wizard
2. Create and apply an MFA enforcement policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "BlockMostAccessUnlessSignedInWithMFA",
         "Effect": "Deny",
         "NotAction": [
           "iam:CreateVirtualMFADevice",
           "iam:EnableMFADevice",
           "iam:ListMFADevices",
           "iam:ListVirtualMFADevices",
           "iam:ResyncMFADevice",
           "iam:ChangePassword"
         ],
         "Resource": "*",
         "Condition": {
           "BoolIfExists": {
             "aws:MultiFactorAuthPresent": "false"
           }
         }
       }
     ]
   }
   ```
3. Apply this policy to all users or groups


https://github.com/user-attachments/assets/2aa0ee85-2036-4fdb-889d-4ff75fd0c5cd

### ACCT.06 Enforce a password policy

**Implementation Steps:**
1. Go to IAM console → "Account settings"
2. Under "Password policy", click "Edit"
3. Configure the following settings:
   - Minimum password length: 12 characters or more
   - Require at least one uppercase letter
   - Require at least one lowercase letter
   - Require at least one number
   - Require at least one non-alphanumeric character
   - Enable password expiration (90 days recommended)
   - Prevent password reuse (24 previous passwords)
   - Enable password expiration requires administrator reset
4. Click "Save changes"

### ACCT.07 Deliver CloudTrail logs to a protected S3 bucket

**Implementation Steps:**
1. Create a dedicated S3 bucket for CloudTrail logs:
   - Go to S3 console → "Create bucket"
   - Name the bucket (e.g., "organization-cloudtrail-logs")
   - Block all public access
   - Enable bucket versioning
   - Enable default encryption with KMS
2. Enable CloudTrail:
   - Go to CloudTrail console → "Trails" → "Create trail"
   - Name the trail
   - Apply to all regions: Yes
   - Management events: All
   - Data events: Configure as needed
   - Select the S3 bucket created earlier
   - Enable log file validation
   - Enable KMS encryption
3. Configure bucket policy to restrict access:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "AWSCloudTrailAclCheck",
         "Effect": "Allow",
         "Principal": {"Service": "cloudtrail.amazonaws.com"},
         "Action": "s3:GetBucketAcl",
         "Resource": "arn:aws:s3:::organization-cloudtrail-logs"
       },
       {
         "Sid": "AWSCloudTrailWrite",
         "Effect": "Allow",
         "Principal": {"Service": "cloudtrail.amazonaws.com"},
         "Action": "s3:PutObject",
         "Resource": "arn:aws:s3:::organization-cloudtrail-logs/AWSLogs/*",
         "Condition": {
           "StringEquals": {
             "s3:x-amz-acl": "bucket-owner-full-control"
           }
         }
       }
     ]
   }
   ```

### ACCT.08 Prevent public access to private S3 buckets

**Implementation Steps:**
1. Enable S3 Block Public Access at account level:
   - Go to S3 console
   - Click "Block Public Access settings for this account"
   - Check all four options:
     - Block public access to buckets and objects granted through new ACLs
     - Block public access to buckets and objects granted through any ACLs
     - Block public access to buckets and objects granted through new public bucket or access point policies
     - Block public access to buckets and objects granted through any public bucket or access point policies
   - Click "Save changes"
2. Audit existing bucket policies:
   - Use AWS Trusted Advisor
   - Use S3 console to review bucket permissions
   - Use AWS Config rule: s3-bucket-public-read-prohibited
3. Create an S3 inventory configuration:
   - Go to S3 console → Select bucket → "Management" tab
   - Click "Inventory configurations" → "Create inventory configuration"
   - Configure to run daily or weekly
   - Include metadata fields relevant to security

### ACCT.09 Delete unused VPCs, subnets, and security groups

**Implementation Steps:**
1. Identify unused resources:
   ```bash
   # List VPCs
   aws ec2 describe-vpcs --query 'Vpcs[*].[VpcId,Tags]'
   
   # List subnets
   aws ec2 describe-subnets --query 'Subnets[*].[SubnetId,VpcId,Tags]'
   
   # List security groups
   aws ec2 describe-security-groups --query 'SecurityGroups[*].[GroupId,GroupName,Description]'
   ```
2. Check for dependencies before deletion:
   ```bash
   # Check for instances in a VPC
   aws ec2 describe-instances --filters "Name=vpc-id,Values=vpc-12345678"
   
   # Check for resources using a security group
   aws ec2 describe-network-interfaces --filters "Name=group-id,Values=sg-12345678"
   ```
3. Delete unused resources:
   ```bash
   # Delete security group
   aws ec2 delete-security-group --group-id sg-12345678
   
   # Delete subnet
   aws ec2 delete-subnet --subnet-id subnet-12345678
   
   # Delete VPC
   aws ec2 delete-vpc --vpc-id vpc-12345678
   ```
4. Set up AWS Config rules to monitor:
   - Go to AWS Config console
   - Add rule: ec2-security-group-attached-to-eni

### ACCT.10 Configure AWS Budgets to monitor your spending

**Implementation Steps:**
1. Go to AWS Billing console → "Budgets" → "Create budget"
2. Select "Cost budget"
3. Configure budget details:
   - Name: "Monthly-Total-Budget"
   - Period: Monthly
   - Start date: First day of current month
   - Budget amount: Fixed or based on previous spending
4. Set up alerts:
   - First threshold: 50% of budgeted amount
   - Second threshold: 80% of budgeted amount
   - Third threshold: 100% of budgeted amount
   - Add email recipients for notifications
5. Create service-specific budgets:
   - Follow same steps but filter by service (e.g., EC2, S3)
   - Set appropriate thresholds based on expected usage

https://github.com/user-attachments/assets/f03822e9-6755-4d44-a26a-7055132f7629

### ACCT.11 Enable and respond to GuardDuty notifications

**Implementation Steps:**
1. Enable GuardDuty:
   - Go to GuardDuty console
   - Click "Get Started" or "Enable GuardDuty"
   - Enable in all regions
2. Configure notifications:
   - Go to CloudWatch console → "Rules" → "Create rule"
   - Select "Event Pattern" and choose "GuardDuty Finding"
   - Target: SNS topic
   - Create SNS topic and subscribe email addresses
3. Create response procedures document:
   ```
   GuardDuty Finding Response Procedures:
   
   1. High severity findings:
      - Immediate notification to security team
      - Isolate affected resources
      - Investigate within 1 hour
      - Document findings and response
   
   2. Medium severity findings:
      - Notification to security team
      - Investigate within 24 hours
      - Document findings and response
   
   3. Low severity findings:
      - Weekly review
      - Document patterns
      - Update security controls as needed
   ```

### ACCT.12 Monitor for and resolve high-risk issues by using Trusted Advisor

**Implementation Steps:**
1. Access Trusted Advisor:
   - Go to Trusted Advisor console
   - Review the dashboard
2. Focus on high-risk issues:
   - Security: Red and yellow warnings
   - Service Limits: Items approaching limits
   - Fault Tolerance: Single points of failure
3. Create action items for each issue:
   - Document the issue
   - Assign owner
   - Set deadline
   - Track resolution
4. Set up notifications:
   - Go to Trusted Advisor console → "Preferences"
   - Configure weekly email notifications
   - Add relevant email addresses

## Implementation Checklist

- [ ] Configure account alternate contacts
- [ ] Secure root account with MFA
- [ ] Create IAM users with appropriate permissions
- [ ] Enable MFA for all IAM users
- [ ] Configure strong password policy
- [ ] Set up CloudTrail logging to secure S3 bucket
- [ ] Enable S3 Block Public Access at account level
- [ ] Clean up unused network resources
- [ ] Configure AWS Budgets
- [ ] Enable GuardDuty
- [ ] Review Trusted Advisor recommendations

## Additional Security Recommendations

- Implement AWS Organizations for multi-account management
- Use Service Control Policies (SCPs) to enforce security guardrails
- Consider AWS Control Tower for account governance
- Implement infrastructure as code for consistent deployments
- Regularly perform security assessments and penetration testing
