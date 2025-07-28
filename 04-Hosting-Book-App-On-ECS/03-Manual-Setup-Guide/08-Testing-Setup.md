# Phase 8: Testing Your Setup

## Step 20: Test Application

### Access Application:

1. **Get ALB DNS name** from EC2 Console → Load Balancers
2. **Open in browser**: `http://[alb-dns-name]`
3. **Verify**: Your book application loads correctly

### Load Testing:

1. **Use browser developer tools** → Network tab
2. **Refresh page multiple times** to generate traffic
3. **Monitor**: CloudWatch metrics for scaling

## Step 21: Test CI/CD Pipeline

### Test Standard Pipeline:

1. **Make changes** to your `index.html` file
2. **Commit and push** to GitHub main branch
3. **Monitor**: CodePipeline Console → Pipeline execution
4. **Verify**: Changes deployed to application

### Test Blue/Green Pipeline:

1. **Make changes** to application
2. **Push to main branch**
3. **Monitor**: CodeDeploy Console → Deployment progress
4. **Verify**: Zero-downtime deployment

