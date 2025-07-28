# Phase 7: Monitoring Setup

## Step 17: Create CloudWatch Dashboard

**Navigate to CloudWatch Console:**
1. **AWS Console** → Search "CloudWatch" → **CloudWatch**

### Create Dashboard:

1. **Dashboards** → **Create dashboard**
2. **Dashboard name**: `BookApp-Dashboard`
3. **Add widgets**:

   **ECS Metrics Widget:**
   - Widget type: Line
   - Metrics: 
     - AWS/ECS → CPUUtilization → ServiceName: service-book, ClusterName: demo
     - AWS/ECS → MemoryUtilization → ServiceName: service-book, ClusterName: demo
   - Period: 5 minutes

   **ALB Metrics Widget:**
   - Widget type: Line
   - Metrics:
     - AWS/ApplicationELB → RequestCount → LoadBalancer: app/standard-alb/...
     - AWS/ApplicationELB → TargetResponseTime → LoadBalancer: app/standard-alb/...

4. **Save dashboard**

## Step 18: Create CloudWatch Alarms

### Create CPU Alarm:

1. **CloudWatch Console** → **Alarms** → **Create alarm**
2. **Select metric**: AWS/ECS → CPUUtilization → ServiceName: service-book, ClusterName: demo
3. **Configure**:
   - Statistic: Average
   - Period: 5 minutes
   - Threshold: Greater than 80
   - Evaluation periods: 2
4. **Alarm name**: `BookApp-HighCPU`
5. **Create alarm**

**Create Response Time Alarm:**
1. **Create alarm** for AWS/ApplicationELB → TargetResponseTime
2. **Threshold**: Greater than 2 seconds
3. **Alarm name**: `BookApp-HighResponseTime`

## Step 19: View Application Logs

**Access Logs:**
1. **CloudWatch Console** → **Log groups**
2. **Select**: `/ecs/book-app`
3. **View log streams** to see application logs
4. **Create log insights queries** for error analysis


