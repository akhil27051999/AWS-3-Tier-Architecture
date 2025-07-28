# Monitoring Your Application

## Real-time Monitoring Locations

### ECS Service Monitoring:
- **ECS Console** → **Clusters** → `demo` → **Services** → `service-book`
- **Metrics tab**: CPU, Memory, Network utilization
- **Tasks tab**: Running task status
- **Events tab**: Service events and deployments

### Load Balancer Monitoring:
- **EC2 Console** → **Load Balancers** → `standard-alb`
- **Monitoring tab**: Request count, response times
- **Target Groups** → `standard-target-group` → **Targets tab**: Health status

### Pipeline Monitoring:
- **CodePipeline Console** → `book-app-pipeline`
- **Execution history**: Pipeline runs and status
- **CodeBuild Console** → `book-app-build` → **Build history**

### Application Logs:
- **CloudWatch Console** → **Log groups** → `/ecs/book-app`
- **Real-time log streaming**
- **Log Insights** for advanced querying

### Metrics and Alarms:
- **CloudWatch Console** → **Dashboards** → `BookApp-Dashboard`
- **Alarms**: Monitor CPU and response time thresholds

# Troubleshooting via Console

### Common Issues and Solutions

### Service Won't Start:
1. **ECS Console** → **Services** → **Events tab** → Check error messages
2. **Tasks tab** → **Click task** → **Logs tab** → View container logs
3. **Verify**: Security groups allow ALB → ECS communication

### Health Check Failures:
1. **EC2 Console** → **Target Groups** → **Targets tab** → Check health status
2. **Health check settings** → Verify path is `/`
3. **ECS Console** → **Task logs** → Check if app responds on port 80

### Pipeline Failures:
1. **CodePipeline Console** → **Pipeline** → **Failed stage** → **Details**
2. **CodeBuild Console** → **Build project** → **Build history** → **Logs**
3. **Check**: IAM permissions, GitHub connection status

### Auto Scaling Issues:
1. **ECS Console** → **Services** → **Auto Scaling tab** → **Scaling activities**
2. **CloudWatch Console** → **Metrics** → Check CPU utilization
3. **Verify**: Scaling policies and thresholds

## Success Verification Checklist

✅ **VPC and networking configured correctly**  
✅ **ECR repository contains your Docker image**  
✅ **ECS cluster running with healthy tasks**  
✅ **Load balancer showing healthy targets**  
✅ **Application accessible via ALB DNS name**  
✅ **CI/CD pipeline successfully deploying changes**  
✅ **Blue/Green deployment working (if configured)**  
✅ **CloudWatch monitoring and alarms active**  
✅ **Auto-scaling responding to load changes**  
✅ **Container accessible via ECS Exec**  

## Cleanup via Console

**Delete resources in this order to avoid charges:**

1. **CodePipeline Console** → Delete pipelines
2. **CodeDeploy Console** → Delete applications
3. **CodeBuild Console** → Delete build projects
4. **ECS Console** → Delete services → Delete cluster
5. **EC2 Console** → Delete load balancers → Delete target groups
6. **ECR Console** → Delete repository
7. **VPC Console** → Delete NAT gateway → Delete subnets → Delete VPC
8. **S3 Console** → Empty and delete buckets
9. **CloudWatch Console** → Delete dashboards and alarms
10. **IAM Console** → Delete created roles

Your book application is now fully deployed using the AWS Console with complete monitoring and CI/CD capabilities!
