# 🌐 Static Website Hosting on AWS using S3 + CloudFront + Route 53

This guide explains how to deploy a secure, fast, and scalable static website using:

- **Amazon S3** – stores your static site files
- **Amazon CloudFront** – serves content via global CDN with HTTPS
- **Amazon Route 53** – manages your custom domain (DNS)
- **AWS Certificate Manager (ACM)** – provides free SSL certificates

## 📋 Prerequisites

- An AWS account
- A registered domain name (e.g., `example.com`)
- Static website files (`index.html`, `style.css`, etc.)
- Permissions to use S3, CloudFront, ACM, and Route 53


## 🧱 Architecture Overview

`User` ↔ `Route 53` ↔ `CloudFront` (HTTPS via ACM) ↔ `S3 Bucket` (Static Site)


## ✅ Steps for Deployment of Static Website using S3 + CloudFront + Route 53

### Step 1. Upload Your Website to S3

1. Go to the [S3 Console](https://s3.console.aws.amazon.com/s3/)
2. Click **“Create bucket”**
   - Name: Use a globally unique name (e.g., `example.com`)
   - Region: Choose your preferred region
3. Upload your static website files:
   - `index.html` (mandatory)
   - `error.html` (optional)
4. Enable **static website hosting**:
   - Set **index document**: `index.html`
   - Set **error document**: `error.html` (optional)
5. (Optional) Make your bucket public (if not using CloudFront OAC)


### Step 2. Request an SSL Certificate (ACM)

1. Open the [AWS Certificate Manager](https://console.aws.amazon.com/acm/)
2. Click **“Request a certificate”**
   - Choose **Public certificate**
   - Add your domain (e.g., `example.com`, `www.example.com`)
3. Validate using **DNS validation**
   - ACM will create DNS records in Route 53 if your domain is hosted there
4. Wait for the certificate to be issued


### Step 3. Set Up CloudFront

1. Go to the [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. Click **“Create Distribution”**
   - **Origin domain**: Your S3 **static website endpoint**
   - **Origin type**: `S3 website`
   - **Viewer protocol policy**: Redirect HTTP to HTTPS
   - **Default root object**: `index.html`
   - **Custom domain name**: Add `example.com` or `www.example.com`
   - **SSL certificate**: Choose the ACM certificate created earlier
3. (Optional but recommended): Set up **Origin Access Control (OAC)** to keep the S3 bucket private
4. Wait ~15 minutes for CloudFront distribution to deploy


### Step 4. Configure Route 53 (DNS)

1. Go to [Route 53 Console](https://console.aws.amazon.com/route53/)
2. Open your **Hosted Zone** for the domain
3. Create a new **Record Set**:
   - **Type**: `A – IPv4 address`
   - **Alias**: Yes
   - **Alias Target**: Choose your CloudFront distribution
4. Repeat for `www` subdomain if needed


### Step 5. Test Your Site

- Visit your domain in a browser: https://example.com
- You should see your static site served via CloudFront over HTTPS.


