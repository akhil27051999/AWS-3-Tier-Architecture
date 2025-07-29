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

## Step 22: Enable ECS Exec

**Enable Execute Command:**
1. **ECS Console** → **Clusters** → `demo` → **Services** → `service-book`
2. **Update service**
3. **Configuration** → **Enable Execute Command**: ✅
4. **Update**

**Connect to Container (via CloudShell):**
1. **AWS Console** → **CloudShell** (top right)
2. **Run command**:
   ```bash
   # Get task ARN
   TASK_ARN=$(aws ecs list-tasks --cluster demo --service-name service-book --query 'taskArns[0]' --output text)
   
   # Connect to container
   aws ecs execute-command \
     --cluster demo \
     --task $TASK_ARN \
     --container book-app \
     --interactive \
     --command "/bin/sh"
   ```

