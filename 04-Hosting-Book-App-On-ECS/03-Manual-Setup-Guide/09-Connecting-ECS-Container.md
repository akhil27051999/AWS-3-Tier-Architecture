# Phase 9: Connect to ECS Container

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

