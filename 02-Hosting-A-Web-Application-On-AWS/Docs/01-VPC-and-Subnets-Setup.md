# 🧱 AWS VPC Setup Guide for Hosting an Application on Cloud

This guide provides step-by-step instructions to create a **Virtual Private Cloud (VPC)** in AWS using the **AWS Management Console**.

- A VPC is your private network in the AWS cloud, where you can launch and manage AWS resources like EC2, RDS, and more in a logically isolated environment.

## 🧭 Overview

| Component         | Description                               |
|------------------|-------------------------------------------|
| VPC              | Your private virtual network in AWS       |
| CIDR Block       | Defines the IP range (e.g., `10.0.0.0/16`) |
| Subnets          | Public and private logical IP segments     |
| Internet Gateway | Enables internet access                    |
| NAT Gateway      | Allows outbound access from private subnets|
| Route Tables     | Controls traffic flow within the VPC       |

## Video of VPC Creation 

https://github.com/user-attachments/assets/dbdee4f3-a224-4b32-b8b4-b446cfb28204



## ✅ Steps to Setup VPC and Subnets

### Step 1: Open the VPC Dashboard

1. Sign in to the [AWS Management Console](https://console.aws.amazon.com/)
2. Navigate to **VPC** under Networking & Content Delivery
3. Click **“Your VPCs”** in the left-hand menu


### Step 2: Create a New VPC

Click **"Create VPC"** and choose one of the following:

#### Option A: VPC Only (Manual Setup)

- **Name tag**: `my-custom-vpc`
- **IPv4 CIDR block**: `10.0.0.0/16`
- **IPv6 CIDR block**: Optional (enable if needed)
- **Tenancy**: Default (recommended)
- Click **“Create VPC”**

#### Option B: VPC + Subnets (Recommended)

- Select **"VPC and more"**
- Set:
  - **Name**: `my-vpc`
  - **IPv4 CIDR**: `10.0.0.0/16`
  - Number of AZs: 2+
  - Create both **public** and **private** subnets
- AWS will automatically:
  - Create subnets, route tables, internet gateway, NAT gateway
- Click **“Create VPC”**


### Step 3: Verify Your Resources

Once the VPC is created, go to:

- **Your VPCs** – to verify the VPC
- **Subnets** – to see public and private subnets
- **Route Tables** – to review traffic routing
- **Internet Gateway** – to confirm attachment to VPC
- **NAT Gateway** – for private subnet access to the internet


## 📌 Example Configuration

| Resource            | Value                        |
|---------------------|------------------------------|
| VPC Name            | `my-vpc`                     |
| CIDR Block          | `10.55.0.0/16`                |
| Public Subnet 1     | `10.55.0.0/20`    |
| Public Subnet 2     | `10.55.16.0/20`    |
| Private Subnet 1    | `10.55.128.0/20`    |
| Private Subnet 2    | `10.55.144.0/20`    |
| Private Subnet 3    | `10.55.160.0/20`    |
| Private Subnet 4    | `10.55.176.0/20`    |
| Internet Gateway    | `my-vpc-igw`                 |
| NAT Gateway(s)      | 2 (for high availability)    |
| Availability Zones  | 2                            |




## Best Practices

-  Use **private subnets** for sensitive resources (e.g., databases)
-  Use **NAT Gateway** for private subnets needing internet access
-  Apply **security groups** and **network ACLs** for access control
-  Use **Route 53** for internal DNS if needed
-  Clean up unused NAT or Elastic IPs to avoid extra cost



