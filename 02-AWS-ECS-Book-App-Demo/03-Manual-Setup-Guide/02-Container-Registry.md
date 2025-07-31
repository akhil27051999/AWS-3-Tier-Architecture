# Phase 2: Container Registry Setup and Image Push to ECR

## ECR Setup Video

https://github.com/user-attachments/assets/f9f92964-9148-4803-8903-46420850df3f

## Step 3: Create ECR Repository

**Navigate to ECR Console:**
1. **AWS Console** → Search "ECR" → **Elastic Container Registry**

**Create Repository:**
1. **Repositories** → **Create repository**
2. **Configure**:
   - Visibility settings: Private
   - Repository name: `book-app`
   - Tag immutability: Disabled
   - Scan on push: Disabled
   - Encryption configuration: AES-256
3. **Create repository**

---

## Image Push to ECR Video

https://github.com/user-attachments/assets/0212d8b1-19fc-445c-9e5c-cb659ceb5474

### Step 3.1: Install Required Tools in Local

**Linux/macOS:**
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install Docker
sudo apt update
sudo apt install docker.io
sudo systemctl start docker
sudo usermod -aG docker $USER

# Install Session Manager Plugin
curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb" -o "session-manager-plugin.deb"
sudo dpkg -i session-manager-plugin.deb
```

### Step 3.2: Configure AWS CLI
```bash
aws configure
# AWS Access Key ID: [Your Access Key]
# AWS Secret Access Key: [Your Secret Key]
# Default region name: us-east-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity
```

### Step 3.3: Verify Installation
```bash
aws --version
docker --version
session-manager-plugin
```
### Step 3.4: Push Your Docker Image to ECR:

1. **Clone the project repository from GitHub to Local** → **Build and push the Docker image from Local to ECR**
2. **Follow the 4 commands** in your local terminal:
```bash
 # 1. Retrieve authentication token
 aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [account-id].dkr.ecr.us-east-1.amazonaws.com
  
 # 2. Build your Docker image
 docker build -t book-app .
   
 # 3. Tag your image
 docker tag book-app:latest [account-id].dkr.ecr.us-east-1.amazonaws.com/book-app:latest
   
 # 4. Push image to repository
 docker push [account-id].dkr.ecr.us-east-1.amazonaws.com/book-app:latest
```
