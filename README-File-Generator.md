# Generating a README.md in VS Code using Amazon Q 

This guide explains how to use **Amazon Q** or **CodeWhisperer** in **Visual Studio Code** to auto-generate a `README.md` file for your AWS-based project.

https://github.com/user-attachments/assets/3abbabe4-5382-46b5-8279-eae5f52eaaa9


## Prerequisites

- AWS Account with access to Amazon CodeWhisperer / Amazon Q
- Visual Studio Code (VS Code) installed
- AWS Toolkit extension installed in VS Code

## Steps to Generate README

### 1. Install AWS Toolkit

1. Open **VS Code**
2. Go to the **Extensions** panel (Ctrl+Shift+X)
3. Search for `AWS Toolkit`
4. Click **Install**

### 2. Enable Amazon CodeWhisperer

1. In the AWS Toolkit panel, click **Sign in** to your AWS account
2. Once signed in, locate **Amazon CodeWhisperer** in the sidebar
3. Enable it for your session or configure it to auto-start

### 3. Generate README.md File

1. In your project’s root directory:
   - Open VS Code
   - Create a new file:  
     `File → New File → Save as README.md`

2. In the editor, type a Markdown comment prompt:

   ```markdown
   # Generate a README for a Python Flask REST API with MySQL, deployed using CloudFormation
   ```



