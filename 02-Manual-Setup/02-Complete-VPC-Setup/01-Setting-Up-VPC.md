# 🧱 AWS VPC Setup Guide

This guide provides step-by-step instructions to create a **Virtual Private Cloud (VPC)** in AWS using the **AWS Management Console**.

- A VPC is your private network in the AWS cloud, where you can launch and manage AWS resources like EC2, RDS, and more in a logically isolated environment.

## 📋 Prerequisites

- An AWS account
- Access to the AWS Management Console with VPC permissions


## 🧭 Overview

| Component         | Description                               |
|------------------|-------------------------------------------|
| VPC              | Your private virtual network in AWS       |
| CIDR Block       | Defines the IP range (e.g., `10.0.0.0/16`) |
| Subnets          | Public and private logical IP segments     |
| Internet Gateway | Enables internet access                    |
| NAT Gateway      | Allows outbound access from private subnets|
| Route Tables     | Controls traffic flow within the VPC       |


## ✅ Steps to Create a VPC in AWS Console

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


## Example Configuration

| Resource            | Value                |
|---------------------|----------------------|
| VPC Name            | `my-vpc`             |
| CIDR Block          | `10.0.0.0/16`        |
| Public Subnet       | `10.0.1.0/24`        |
| Private Subnet      | `10.0.2.0/24`        |
| Internet Gateway    | `my-vpc-igw`         |
| NAT Gateway         | `my-vpc-nat`         |
| Availability Zones  | 2+                   |



## Best Practices

-  Use **private subnets** for sensitive resources (e.g., databases)
-  Use **NAT Gateway** for private subnets needing internet access
-  Apply **security groups** and **network ACLs** for access control
-  Use **Route 53** for internal DNS if needed
-  Clean up unused NAT or Elastic IPs to avoid extra cost



