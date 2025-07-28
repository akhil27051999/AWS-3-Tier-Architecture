# Phase 2: Container Registry Setup

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

**Push Your Docker Image:**
1. **Select repository** → **View push commands**
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
