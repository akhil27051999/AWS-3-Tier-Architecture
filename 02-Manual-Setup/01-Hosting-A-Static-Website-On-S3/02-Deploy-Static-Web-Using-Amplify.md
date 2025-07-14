# 🌐 Static Website Hosting on AWS using AWS Amplify 

This guide walks you through the steps to host a static website using **AWS Amplify Hosting** by uploading your website files (HTML, CSS, JS) directly — no Git connection required.

## Video of Deploying a Static Website using AWS Amplify

https://github.com/user-attachments/assets/d6ab6d25-1fb3-4419-8175-0de73abcc9be

## 📋 Prerequisites

- An active [AWS account](https://aws.amazon.com/)
- Website build files ready (e.g., `index.html`, `style.css`, `script.js`, etc.)
- Optional: A domain name for custom URL


## ✅ Steps for Deployment of Static Website using AWS Amplify 

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

<img width="1919" height="1061" alt="Screenshot 2025-07-14 173507" src="https://github.com/user-attachments/assets/8aac3c95-86db-4d90-8ccb-a368a2c8c7a8" />

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
<img width="1918" height="1057" alt="Screenshot 2025-07-14 173443" src="https://github.com/user-attachments/assets/dbcfb0ab-9169-49a9-991d-7b5ac60f1b46" />


### Step 6: Access Your Live Website

- Once deployment is complete, you’ll receive a URL like:
  - https://staging.d2vu8gbyc1bpte.amplifyapp.com/
- Share this link to access your website anywhere!
  
<img width="1918" height="1107" alt="Screenshot 2025-07-14 173407" src="https://github.com/user-attachments/assets/a5dce200-1dd4-404c-918e-22fe78480107" />

