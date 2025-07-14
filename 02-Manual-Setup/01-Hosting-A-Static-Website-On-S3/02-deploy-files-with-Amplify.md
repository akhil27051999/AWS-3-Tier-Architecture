# 🌐 Deploying a Static Website using AWS Amplify (Manual Upload)

This guide walks you through the steps to host a static website using **AWS Amplify Hosting** by uploading your website files (HTML, CSS, JS) directly — no Git connection required.



## 📋 Prerequisites

- An active [AWS account](https://aws.amazon.com/)
- Website build files ready (e.g., `index.html`, `style.css`, `script.js`, etc.)
- Optional: A domain name for custom URL



## ✅ Steps to Deploy Your Static Website

###  Step 1: Sign in to AWS Console

- Visit the AWS Amplify Console:  
  [https://console.aws.amazon.com/amplify](https://console.aws.amazon.com/amplify)
- Select your preferred AWS Region



### Step 2: Start a New Deployment

1. On the **Amplify Hosting** page, click **“Get started”**.
2. Select **“Deploy without Git provider”**.



### Step 3: Upload Your Website Files

- Click the **"Drag and drop your build folder"** area.
- Upload your local folder containing your website files.



### Step 4: Configure Deployment

- You don’t need to define any build settings for a static HTML site.
- Click **Next** or **Continue** to proceed.



### Step 5: Review and Deploy

- Provide an **app name** (e.g., `my-static-site`).
- Click **“Save and Deploy”**.

Amplify will:
- Upload your files to an S3 bucket
- Host the content securely with CloudFront
- Generate a live public URL


### Step 6: Access Your Live Website

- Once deployment is complete, you’ll receive a URL like:
  - https://main.d1xyzexample.amplifyapp.com
- Share this link to access your website anywhere!

