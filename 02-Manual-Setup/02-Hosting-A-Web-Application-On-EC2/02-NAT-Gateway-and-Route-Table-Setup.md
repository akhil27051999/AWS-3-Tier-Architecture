# 🌐 Setting Up a NAT Gateway for Private Subnets in AWS

This guide walks you through setting up a **NAT Gateway** to enable outbound internet access for **private subnets** in your AWS VPC — a critical step for updating packages, downloading dependencies, or accessing APIs securely.

## 🔒 Security Notes

- **Inbound traffic is blocked** by default
- NAT Gateway allows **only outbound access** from private subnets
- Useful for: OS updates, package downloads, external API access

## Video of NAT-Gateway Setup

https://github.com/user-attachments/assets/6bafc469-915d-466e-86e0-845111d79def

## 🧱 Prerequisites

Ensure you have:
- A VPC already created
- At least **1 public subnet** (with an Internet Gateway)
- **Private subnets** (without direct internet access)
- An **Internet Gateway** attached to your VPC

## ✅ Steps to Setup NAT Gateway and Route Table

### Step 1: Allocate an Elastic IP (EIP)

1. Open the **EC2 Console** → go to **Elastic IPs**
2. Click **“Allocate Elastic IP address”**
3. Choose scope: **VPC**
4. Click **“Allocate”**
5. Note down the allocated **Elastic IP**


### Step 2: Create a NAT Gateway

1. Open the **VPC Console**
2. In the left menu, click **“NAT Gateways”**
3. Click **“Create NAT Gateway”**
4. Fill in the details:
   - **Name tag**: `nat-gateway-az1` (or meaningful name)
   - **Subnet**: Choose a **public subnet**
   - **Elastic IP allocation ID**: Select the EIP created earlier
5. Click **“Create NAT Gateway”**
6. Wait until status becomes `Available`


### Step 3: Update Route Table of Private Subnets

1. Go to **VPC Console** → **Route Tables**
2. Find the route table(s) associated with your **private subnets**
3. Select a route table → click **“Edit routes”**
4. Click **“Add route”**:
   - **Destination**: `0.0.0.0/0`
   - **Target**: Select the **NAT Gateway** you just created
5. Click **Save changes**
6. Repeat for other private subnet route tables if needed.


### Optional: Multi-AZ High Availability

For better fault tolerance:
- Create **multiple NAT Gateways**, one per Availability Zone (AZ)
- Associate each private subnet (per AZ) with its local NAT Gateway

This ensures **zonal redundancy** and minimizes single points of failure.



## 📌 Example Network Setup

| Resource           | CIDR Block      | AZ         | Notes                     |
|--------------------|-----------------|------------|---------------------------|
| Public Subnet 1    | `10.55.0.0/20`   | us-east-1a | NAT Gateway lives here    |
| Public Subnet 2    | `10.55.16.0/20`   | us-east-1b | Optional NAT Gateway here |
| Private Subnet 1   | `10.55.128.0/20`   | us-east-1a | Routes via NAT GW in AZ-a |
| Private Subnet 2   | `10.55.144.0/20`   | us-east-1b | Routes via NAT GW in AZ-b |



