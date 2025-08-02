# Kubernetes Manifest Writing Guide

A comprehensive checklist and guide for writing Kubernetes manifest files for services.

## Essential Components Checklist

When writing a manifest for any service, you need these **6 core resources**:

### ✅ **1. ServiceAccount (Identity)**
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-service
  labels:
    app.kubernetes.io/name: my-service
```
**Purpose**: Provides identity for security and RBAC
**Always Include**: Yes

### ✅ **2. ConfigMap (Non-sensitive Configuration)**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-service
data:
  DATABASE_HOST: my-database
  DATABASE_PORT: "5432"
  LOG_LEVEL: "INFO"
```
**Purpose**: Store configuration that's not secret
**Always Include**: Yes (even if minimal)

### ✅ **3. Secret (Sensitive Data)**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: my-service-secrets
data:
  DATABASE_PASSWORD: cGFzc3dvcmQ=  # base64 encoded
  API_KEY: YWJjZGVmZ2g=
```
**Purpose**: Store passwords, tokens, certificates
**Always Include**: Yes (for any real application)

### ✅ **4. Service (Network Access)**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 8080
  selector:
    app.kubernetes.io/name: my-service
```
**Purpose**: Provides stable network endpoint
**Always Include**: Yes

### ✅ **5. Deployment (Application)**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: my-service
  template:
    metadata:
      labels:
        app.kubernetes.io/name: my-service
    spec:
      serviceAccountName: my-service
      containers:
        - name: my-service
          image: my-app:1.0.0
          ports:
            - containerPort: 8080
          envFrom:
            - configMapRef:
                name: my-service
            - secretRef:
                name: my-service-secrets
```
**Purpose**: Runs your application
**Always Include**: Yes

### ✅ **6. Database (StatefulSet or Deployment)**
```yaml
apiVersion: apps/v1
kind: StatefulSet  # or Deployment for stateless databases
metadata:
  name: my-database
spec:
  serviceName: my-database
  replicas: 1
  template:
    spec:
      containers:
        - name: database
          image: postgres:13
```
**Purpose**: Data storage
**Include If**: Your service needs a database

## Critical Things to Consider

### **1. Naming Convention**
```yaml
# ✅ GOOD - Consistent naming
metadata:
  name: user-service
  labels:
    app.kubernetes.io/name: user-service
    app.kubernetes.io/component: service
    app.kubernetes.io/part-of: my-application

# ❌ BAD - Inconsistent naming
metadata:
  name: userSvc
  labels:
    app: user
    component: backend
```

**Rules:**
- Use kebab-case (user-service, not userService)
- Be consistent across all resources
- Include standard labels

### **2. Resource Limits and Requests**
```yaml
# ✅ ALWAYS INCLUDE
resources:
  limits:
    memory: "512Mi"
    cpu: "500m"
  requests:
    memory: "256Mi"
    cpu: "250m"
```

**Why Important:**
- Prevents one service from consuming all cluster resources
- Helps Kubernetes schedule pods efficiently
- Required for production environments

### **3. Health Checks**
```yaml
# ✅ ALWAYS INCLUDE
readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5

livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
```

**Types:**
- **Readiness**: Is the app ready to receive traffic?
- **Liveness**: Is the app still running properly?

### **4. Security Context**
```yaml
# ✅ ALWAYS INCLUDE
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  readOnlyRootFilesystem: true
  capabilities:
    drop:
      - ALL
```

**Security Best Practices:**
- Never run as root user
- Drop all Linux capabilities
- Use read-only filesystem
- Set specific user ID

### **5. Labels and Selectors**
```yaml
# ✅ CONSISTENT LABELS EVERYWHERE
metadata:
  labels:
    app.kubernetes.io/name: my-service
    app.kubernetes.io/instance: my-service
    app.kubernetes.io/component: service
    app.kubernetes.io/part-of: my-application
    app.kubernetes.io/version: "1.0.0"

# ✅ MATCHING SELECTORS
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: my-service
      app.kubernetes.io/instance: my-service
```

**Critical Rule:** Labels in Deployment template MUST match Service selector

## Service-Specific Considerations

### **Web/API Services**
```yaml
# Additional requirements:
- Ingress for external access
- Multiple replicas for high availability
- Horizontal Pod Autoscaler
- Service type: ClusterIP (for internal) or LoadBalancer (for external)
```

### **Database Services**
```yaml
# Additional requirements:
- StatefulSet (not Deployment)
- Persistent Volume Claims
- Headless Service
- Init containers for setup
- Backup strategies
```

### **Background/Worker Services**
```yaml
# Additional requirements:
- No Service needed (unless exposing metrics)
- Job or CronJob for scheduled tasks
- Queue connections (Redis, RabbitMQ)
- Proper shutdown handling
```

### **Cache Services**
```yaml
# Additional requirements:
- Memory-optimized resources
- Fast storage (SSD)
- Network policies for security
- Monitoring for hit rates
```

## Environment-Specific Configurations

### **Development Environment**
```yaml
# Relaxed settings for development
spec:
  replicas: 1
  resources:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "256Mi"
      cpu: "200m"
```

### **Production Environment**
```yaml
# Strict settings for production
spec:
  replicas: 3  # High availability
  resources:
    requests:
      memory: "512Mi"
      cpu: "500m"
    limits:
      memory: "1Gi"
      cpu: "1000m"
  # Add:
  # - Pod Disruption Budgets
  # - Network Policies
  # - Resource Quotas
  # - Monitoring/Alerting
```

## Common Mistakes to Avoid

### **❌ Missing Resource Limits**
```yaml
# This will cause problems in production
containers:
  - name: my-app
    image: my-app:1.0.0
    # Missing resources section
```

### **❌ Inconsistent Labels**
```yaml
# Service selector won't match Deployment
apiVersion: v1
kind: Service
spec:
  selector:
    app: my-service  # Different label

---
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    metadata:
      labels:
        application: my-service  # Different label
```

### **❌ No Health Checks**
```yaml
# Kubernetes won't know if your app is healthy
containers:
  - name: my-app
    image: my-app:1.0.0
    # Missing readinessProbe and livenessProbe
```

### **❌ Running as Root**
```yaml
# Security risk
securityContext:
  runAsUser: 0  # Root user - dangerous!
```

### **❌ Hardcoded Values**
```yaml
# Bad - hardcoded in Deployment
env:
  - name: DATABASE_HOST
    value: "192.168.1.100"  # Should be in ConfigMap

# Good - reference ConfigMap
envFrom:
  - configMapRef:
      name: my-service
```

## Manifest Writing Workflow

### **Step 1: Plan Your Service**
- What does it do?
- What does it connect to?
- What configuration does it need?
- What secrets does it need?

### **Step 2: Start with Template**
```yaml
# Basic template for any service
apiVersion: v1
kind: ServiceAccount
metadata:
  name: SERVICE_NAME
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: SERVICE_NAME
data:
  # Add your config here
---
apiVersion: v1
kind: Secret
metadata:
  name: SERVICE_NAME-secrets
data:
  # Add your secrets here (base64 encoded)
---
apiVersion: v1
kind: Service
metadata:
  name: SERVICE_NAME
spec:
  selector:
    app.kubernetes.io/name: SERVICE_NAME
  ports:
    - port: 80
      targetPort: 8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: SERVICE_NAME
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: SERVICE_NAME
  template:
    metadata:
      labels:
        app.kubernetes.io/name: SERVICE_NAME
    spec:
      serviceAccountName: SERVICE_NAME
      containers:
        - name: SERVICE_NAME
          image: YOUR_IMAGE:TAG
          ports:
            - containerPort: 8080
          envFrom:
            - configMapRef:
                name: SERVICE_NAME
            - secretRef:
                name: SERVICE_NAME-secrets
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          readinessProbe:
            httpGet:
              path: /health
              port: 8080
          securityContext:
            runAsNonRoot: true
            runAsUser: 1000
```

### **Step 3: Customize for Your Needs**
- Add specific configuration
- Set appropriate resource limits
- Add database if needed
- Configure networking
- Add monitoring

### **Step 4: Validate**
```bash
# Check syntax
kubectl apply --dry-run=client -f manifest.yaml

# Validate against cluster
kubectl apply --dry-run=server -f manifest.yaml
```

### **Step 5: Test**
```bash
# Deploy to test environment first
kubectl apply -f manifest.yaml

# Check if everything is running
kubectl get pods
kubectl get services
kubectl logs deployment/SERVICE_NAME
```

## Production Readiness Checklist

### **Security ✅**
- [ ] ServiceAccount created
- [ ] Secrets for sensitive data
- [ ] Non-root user
- [ ] Read-only filesystem
- [ ] Dropped capabilities
- [ ] Network policies (if needed)

### **Reliability ✅**
- [ ] Resource limits set
- [ ] Health checks configured
- [ ] Multiple replicas (for critical services)
- [ ] Pod disruption budgets
- [ ] Proper shutdown handling

### **Observability ✅**
- [ ] Logging configured
- [ ] Metrics exposed
- [ ] Health endpoints
- [ ] Proper labels for monitoring

### **Configuration ✅**
- [ ] ConfigMaps for settings
- [ ] Secrets for sensitive data
- [ ] Environment-specific values
- [ ] No hardcoded values

### **Networking ✅**
- [ ] Service for internal access
- [ ] Ingress for external access (if needed)
- [ ] Proper port configuration
- [ ] DNS-friendly service names

## Quick Reference

### **Resource Types by Use Case**

| Use Case | Resources Needed |
|----------|------------------|
| **Simple API** | ServiceAccount, ConfigMap, Secret, Service, Deployment |
| **API + Database** | Above + StatefulSet, PVC, Headless Service |
| **Background Worker** | ServiceAccount, ConfigMap, Secret, Deployment (no Service) |
| **Scheduled Job** | ServiceAccount, ConfigMap, Secret, CronJob |
| **External Access** | Above + Ingress |
| **High Availability** | Above + HPA, PDB, Multiple replicas |

### **Common Port Patterns**
- **Web apps**: 80 (service) → 8080 (container)
- **APIs**: 80 (service) → 3000/8080 (container)
- **Databases**: 3306 (MySQL), 5432 (PostgreSQL), 6379 (Redis)
- **Message queues**: 5672 (RabbitMQ), 9092 (Kafka)

Remember: **Start simple, then add complexity as needed**. Every service should have the 6 core resources, then add others based on specific requirements.
