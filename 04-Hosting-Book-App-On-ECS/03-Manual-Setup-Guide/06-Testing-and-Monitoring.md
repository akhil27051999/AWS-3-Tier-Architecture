# Phase 6: Testing and Monitoring

## Step 21: Setup CloudWatch Monitoring
1. **Navigate**: CloudWatch → Log groups
2. **Verify**: `/ecs/book-app` log group exists
3. **Set retention**: 7 days

## Step 22: Test the Application
1. **Get ALB DNS name**: EC2 → Load Balancers → Copy DNS name
2. **Test**: Open in browser - should show nginx welcome page
3. **Monitor**: ECS → Clusters → `demo` → Services → View metrics

## Step 23: Test CI/CD Pipeline
1. **Push code** to your GitHub repository
2. **Monitor**: CodePipeline → View pipeline execution
3. **Verify**: New container deployed to ECS

## Traffic Flow
### **Request Journey**
```
1. User Browser Request
   ↓
2. Internet Gateway (10.0.0.0/16 VPC)
   ↓
3. Application Load Balancer (Public Subnets)
   ├── Health Check: GET / (every 30s)
   ├── Target Selection: Round-robin
   └── Forward to healthy targets
   ↓
4. ECS Fargate Tasks (Private Subnets)
   ├── Container: nginx on port 80
   ├── Auto Scaling: 1-4 tasks based on CPU
   └── Process request
   ↓
5. Response back through same path
   ↓
6. User receives response
```
### **Blue/Green Deployment Flow**
```
1. Code Push → GitHub
   ↓
2. CodePipeline triggered
   ↓
3. CodeBuild creates new image
   ↓
4. CodeDeploy creates Green environment
   ↓
5. Health checks on Green tasks
   ↓
6. Traffic switch: Blue → Green
   ↓
7. Blue environment terminated
```
## Monitoring and Troubleshooting
### **Key Metrics to Monitor**
- **ECS Service**: CPU/Memory utilization, Task count
- **ALB**: Request count, Response time, Healthy targets
- **CodePipeline**: Build success rate, Deployment frequency
### **Common Issues**
1. **Service won't start**: Check security groups, subnet routing
2. **Health check failures**: Verify app responds on port 80
3. **Pipeline failures**: Check IAM permissions, GitHub connection
4. **Auto scaling issues**: Review CloudWatch metrics
### **Debugging Commands**
```bash
# Check ECS service status
aws ecs describe-services --cluster demo --services service-book
# View container logs
aws logs get-log-events --log-group-name /ecs/book-app
# Check ALB target health
aws elbv2 describe-target-health --target-group-arn <arn>
```
## Cost Optimization
- **Fargate Spot**: Use for non-critical workloads (70% cost savings)
- **Single NAT Gateway**: Shared across AZs (vs. one per AZ)
- **Auto Scaling**: Scale down during low traffic periods
- **Log Retention**: Set appropriate retention periods
## Security Best Practices
- **Network Isolation**: Applications in private subnets
- **Least Privilege**: IAM roles with minimal permissions
- **Security Groups**: Restrictive inbound rules
- **Container Security**: Regular image updates
- **Secrets Management**: Use AWS Secrets Manager for credentials
## Cleanup
To avoid ongoing charges, delete resources in this order:
1. CodePipeline pipelines
2. CodeDeploy applications
3. CodeBuild projects
4. ECS services
5. ECS task definitions
6. ECS cluster
7. Load balancers and target groups
8. NAT gateway
9. Subnets and route tables
10. Internet gateway
11. VPC
12. ECR repository
13. S3 bucket
14. IAM roles
## Next Steps
1. **Add HTTPS**: Configure SSL certificate on ALB
2. **Custom Domain**: Use Route 53 for DNS
3. **Database**: Add RDS Aurora for data persistence
4. **Monitoring**: Set up CloudWatch alarms and dashboards
5. **Security**: Implement AWS WAF for web application firewall
This manual setup gives you hands-on experience with each AWS service and a deep understanding of how they work together to create a production-ready containerized application architecture.
