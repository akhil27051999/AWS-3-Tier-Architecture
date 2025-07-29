# Phase 4: Test Your Application

## Step 8: Verify Deployment

### Check Service Status:
1. **ECS Console** → **Clusters** → `demo` → **Services** → `service-book`
2. **Tasks tab** → Verify tasks are **RUNNING**
3. **Events tab** → Check for any deployment issues

### Get Application URL:
1. **EC2 Console** → **Load Balancers** → `standard-alb`
2. **Copy DNS name** (e.g., `standard-alb-123456789.us-east-1.elb.amazonaws.com`)
3. **Open in browser**: `http://[dns-name]`

### Check Target Health:
1. **Target Groups** → `standard-target-group`
2. **Targets tab** → Verify targets are **healthy**
