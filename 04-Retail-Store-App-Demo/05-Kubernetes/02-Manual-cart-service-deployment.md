# Cart Service - Complete Kubernetes Deployment Guide

Complete step-by-step Kubernetes manifest creation for the Cart Service, including all necessary resources to run in EKS cluster.

## Service Overview

**Cart Service Details:**
- **Language**: Java (Spring Boot)
- **Database**: DynamoDB Local
- **Port**: 8080
- **Dependencies**: DynamoDB Local container
- **Image**: `public.ecr.aws/aws-containers/retail-store-sample-cart:1.2.2`

## Complete Manifest Files

### **1. Namespace**
```yaml
# 01-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: retail-store
  labels:
    name: retail-store
    app.kubernetes.io/part-of: retail-store-app
---
```

**Purpose**: Isolates cart service resources from other applications
**Why needed**: Provides logical separation and resource organization

---

### **2. ServiceAccount**
```yaml
# 02-serviceaccount.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: cart-service
  namespace: retail-store
  labels:
    app.kubernetes.io/name: cart-service
    app.kubernetes.io/component: service
    app.kubernetes.io/part-of: retail-store-app
automountServiceAccountToken: true
---
```

**Purpose**: Provides identity for cart service pods
**Why needed**: Required for pod security and potential AWS IAM integration

---

### **3. ConfigMap - Application Configuration**
```yaml
# 03-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cart-service-config
  namespace: retail-store
  labels:
    app.kubernetes.io/name: cart-service
    app.kubernetes.io/component: config
data:
  # Cart service configuration
  RETAIL_CART_PERSISTENCE_PROVIDER: "dynamodb"
  RETAIL_CART_PERSISTENCE_DYNAMODB_TABLE_NAME: "Items"
  RETAIL_CART_PERSISTENCE_DYNAMODB_CREATE_TABLE: "true"
  RETAIL_CART_PERSISTENCE_DYNAMODB_ENDPOINT: "http://cart-dynamodb:8000"
  
  # AWS configuration for DynamoDB Local
  AWS_ACCESS_KEY_ID: "key"
  AWS_SECRET_ACCESS_KEY: "secret"
  AWS_DEFAULT_REGION: "us-east-1"
  
  # Java/Spring Boot configuration
  SPRING_PROFILES_ACTIVE: "prod"
  SERVER_PORT: "8080"
  
  # Logging configuration
  LOGGING_LEVEL_ROOT: "INFO"
  LOGGING_LEVEL_COM_AMAZON: "INFO"
---
```

**Purpose**: Stores non-sensitive configuration data
**Why needed**: Separates configuration from application code

---

### **4. Secret - Sensitive Data**
```yaml
# 04-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: cart-service-secrets
  namespace: retail-store
  labels:
    app.kubernetes.io/name: cart-service
    app.kubernetes.io/component: secret
type: Opaque
data:
  # Base64 encoded values (for demo purposes, using simple values)
  # In production, use real secrets
  DATABASE_PASSWORD: "cGFzc3dvcmQ="  # password
  API_KEY: "YWJjZGVmZ2hpams="        # abcdefghijk
---
```

**Purpose**: Stores sensitive data like passwords and API keys
**Why needed**: Secure storage of credentials (base64 encoded)

---

### **5. DynamoDB Local Service**
```yaml
# 05-dynamodb-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: cart-dynamodb
  namespace: retail-store
  labels:
    app.kubernetes.io/name: cart-dynamodb
    app.kubernetes.io/component: database
    app.kubernetes.io/part-of: retail-store-app
spec:
  type: ClusterIP
  ports:
    - name: dynamodb
      port: 8000
      targetPort: 8000
      protocol: TCP
  selector:
    app.kubernetes.io/name: cart-dynamodb
    app.kubernetes.io/component: database
---
```

**Purpose**: Provides stable network endpoint for DynamoDB Local
**Why needed**: Cart service connects to `cart-dynamodb:8000`

---

### **6. DynamoDB Local Deployment**
```yaml
# 06-dynamodb-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cart-dynamodb
  namespace: retail-store
  labels:
    app.kubernetes.io/name: cart-dynamodb
    app.kubernetes.io/component: database
    app.kubernetes.io/part-of: retail-store-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: cart-dynamodb
      app.kubernetes.io/component: database
  template:
    metadata:
      labels:
        app.kubernetes.io/name: cart-dynamodb
        app.kubernetes.io/component: database
        app.kubernetes.io/part-of: retail-store-app
    spec:
      containers:
        - name: dynamodb-local
          image: public.ecr.aws/aws-dynamodb-local/aws-dynamodb-local:1.25.1
          ports:
            - name: dynamodb
              containerPort: 8000
              protocol: TCP
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            tcpSocket:
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            tcpSocket:
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 5
---
```

**Purpose**: Runs DynamoDB Local database for cart data storage
**Why needed**: Cart service requires DynamoDB for persistence

---

### **7. Cart Service - Internal Service**
```yaml
# 07-cart-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: cart-service
  namespace: retail-store
  labels:
    app.kubernetes.io/name: cart-service
    app.kubernetes.io/component: service
    app.kubernetes.io/part-of: retail-store-app
spec:
  type: ClusterIP
  ports:
    - name: http
      port: 80
      targetPort: 8080
      protocol: TCP
  selector:
    app.kubernetes.io/name: cart-service
    app.kubernetes.io/component: service
---
```

**Purpose**: Provides stable network endpoint for cart service
**Why needed**: Other services (UI) connect to `cart-service:80`

---

### **8. Cart Service - Main Application Deployment**
```yaml
# 08-cart-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cart-service
  namespace: retail-store
  labels:
    app.kubernetes.io/name: cart-service
    app.kubernetes.io/component: service
    app.kubernetes.io/part-of: retail-store-app
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: cart-service
      app.kubernetes.io/component: service
  template:
    metadata:
      labels:
        app.kubernetes.io/name: cart-service
        app.kubernetes.io/component: service
        app.kubernetes.io/part-of: retail-store-app
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/actuator/prometheus"
    spec:
      serviceAccountName: cart-service
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
        - name: cart
          image: public.ecr.aws/aws-containers/retail-store-sample-cart:1.2.2
          imagePullPolicy: IfNotPresent
          ports:
            - name: http
              containerPort: 8080
              protocol: TCP
          env:
            # Inject configuration from ConfigMap
            - name: RETAIL_CART_PERSISTENCE_PROVIDER
              valueFrom:
                configMapKeyRef:
                  name: cart-service-config
                  key: RETAIL_CART_PERSISTENCE_PROVIDER
            - name: RETAIL_CART_PERSISTENCE_DYNAMODB_TABLE_NAME
              valueFrom:
                configMapKeyRef:
                  name: cart-service-config
                  key: RETAIL_CART_PERSISTENCE_DYNAMODB_TABLE_NAME
            - name: RETAIL_CART_PERSISTENCE_DYNAMODB_CREATE_TABLE
              valueFrom:
                configMapKeyRef:
                  name: cart-service-config
                  key: RETAIL_CART_PERSISTENCE_DYNAMODB_CREATE_TABLE
            - name: RETAIL_CART_PERSISTENCE_DYNAMODB_ENDPOINT
              valueFrom:
                configMapKeyRef:
                  name: cart-service-config
                  key: RETAIL_CART_PERSISTENCE_DYNAMODB_ENDPOINT
            - name: AWS_ACCESS_KEY_ID
              valueFrom:
                configMapKeyRef:
                  name: cart-service-config
                  key: AWS_ACCESS_KEY_ID
            - name: AWS_SECRET_ACCESS_KEY
              valueFrom:
                configMapKeyRef:
                  name: cart-service-config
                  key: AWS_SECRET_ACCESS_KEY
            - name: AWS_DEFAULT_REGION
              valueFrom:
                configMapKeyRef:
                  name: cart-service-config
                  key: AWS_DEFAULT_REGION
            - name: SPRING_PROFILES_ACTIVE
              valueFrom:
                configMapKeyRef:
                  name: cart-service-config
                  key: SPRING_PROFILES_ACTIVE
            - name: SERVER_PORT
              valueFrom:
                configMapKeyRef:
                  name: cart-service-config
                  key: SERVER_PORT
            # Inject secrets
            - name: DATABASE_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: cart-service-secrets
                  key: DATABASE_PASSWORD
            # JVM Configuration
            - name: JAVA_OPTS
              value: "-Xmx512m -Xms256m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: 8080
            initialDelaySeconds: 60
            periodSeconds: 30
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            runAsNonRoot: true
            runAsUser: 1000
            capabilities:
              drop:
                - ALL
          volumeMounts:
            - name: tmp-volume
              mountPath: /tmp
      volumes:
        - name: tmp-volume
          emptyDir:
            medium: Memory
      restartPolicy: Always
      terminationGracePeriodSeconds: 30
---
```

**Purpose**: Runs the main cart service application
**Why needed**: This is the core cart functionality that handles shopping cart operations

---

### **9. Horizontal Pod Autoscaler (Optional)**
```yaml
# 09-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cart-service-hpa
  namespace: retail-store
  labels:
    app.kubernetes.io/name: cart-service
    app.kubernetes.io/component: autoscaler
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cart-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 60
---
```

**Purpose**: Automatically scales cart service based on CPU/memory usage
**Why needed**: Handles traffic spikes automatically

---

### **10. Pod Disruption Budget**
```yaml
# 10-pdb.yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: cart-service-pdb
  namespace: retail-store
  labels:
    app.kubernetes.io/name: cart-service
    app.kubernetes.io/component: pdb
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: cart-service
      app.kubernetes.io/component: service
---
```

**Purpose**: Ensures at least 1 cart service pod is always available during updates
**Why needed**: Maintains service availability during cluster maintenance

---

### **11. NetworkPolicy (Optional Security)**
```yaml
# 11-networkpolicy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: cart-service-netpol
  namespace: retail-store
  labels:
    app.kubernetes.io/name: cart-service
    app.kubernetes.io/component: security
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: cart-service
      app.kubernetes.io/component: service
  policyTypes:
    - Ingress
    - Egress
  ingress:
    # Allow traffic from UI service
    - from:
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: ui-service
      ports:
        - protocol: TCP
          port: 8080
    # Allow traffic from ingress controller
    - from:
        - namespaceSelector:
            matchLabels:
              name: kube-system
      ports:
        - protocol: TCP
          port: 8080
  egress:
    # Allow traffic to DynamoDB
    - to:
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: cart-dynamodb
      ports:
        - protocol: TCP
          port: 8000
    # Allow DNS resolution
    - to: []
      ports:
        - protocol: UDP
          port: 53
    # Allow HTTPS for external APIs
    - to: []
      ports:
        - protocol: TCP
          port: 443
---
```

**Purpose**: Controls network traffic to/from cart service
**Why needed**: Enhanced security by limiting network access

---

## Deployment Instructions

### **Step 1: Create All Resources**
```bash
# Apply all manifests in order
kubectl apply -f 01-namespace.yaml
kubectl apply -f 02-serviceaccount.yaml
kubectl apply -f 03-configmap.yaml
kubectl apply -f 04-secret.yaml
kubectl apply -f 05-dynamodb-service.yaml
kubectl apply -f 06-dynamodb-deployment.yaml
kubectl apply -f 07-cart-service.yaml
kubectl apply -f 08-cart-deployment.yaml
kubectl apply -f 09-hpa.yaml
kubectl apply -f 10-pdb.yaml
kubectl apply -f 11-networkpolicy.yaml

# Or apply all at once
kubectl apply -f .
```

### **Step 2: Verify Deployment**
```bash
# Check namespace
kubectl get namespace retail-store

# Check all resources
kubectl get all -n retail-store

# Check specific resources
kubectl get pods -n retail-store
kubectl get services -n retail-store
kubectl get configmaps -n retail-store
kubectl get secrets -n retail-store

# Check pod logs
kubectl logs -f deployment/cart-service -n retail-store
kubectl logs -f deployment/cart-dynamodb -n retail-store
```

### **Step 3: Test Service Connectivity**
```bash
# Port forward to test locally
kubectl port-forward svc/cart-service 8080:80 -n retail-store

# Test cart service endpoints
curl http://localhost:8080/actuator/health
curl http://localhost:8080/carts/test-customer

# Test from within cluster
kubectl run test-pod --image=curlimages/curl -i --tty --rm -- sh
# Inside pod:
curl http://cart-service.retail-store.svc.cluster.local/actuator/health
```

## Service Communication

### **Internal Service Discovery**
```bash
# Cart service can be reached at:
cart-service.retail-store.svc.cluster.local:80

# DynamoDB can be reached at:
cart-dynamodb.retail-store.svc.cluster.local:8000

# Short names within same namespace:
cart-service:80
cart-dynamodb:8000
```

### **Environment Variables in Cart Service**
```bash
# Configuration injected from ConfigMap:
RETAIL_CART_PERSISTENCE_PROVIDER=dynamodb
RETAIL_CART_PERSISTENCE_DYNAMODB_ENDPOINT=http://cart-dynamodb:8000
RETAIL_CART_PERSISTENCE_DYNAMODB_TABLE_NAME=Items
RETAIL_CART_PERSISTENCE_DYNAMODB_CREATE_TABLE=true

# AWS credentials for DynamoDB Local:
AWS_ACCESS_KEY_ID=key
AWS_SECRET_ACCESS_KEY=secret
AWS_DEFAULT_REGION=us-east-1
```

## Troubleshooting

### **Common Issues**

#### **Cart Service Not Starting**
```bash
# Check pod status
kubectl describe pod -l app.kubernetes.io/name=cart-service -n retail-store

# Check logs
kubectl logs -f deployment/cart-service -n retail-store

# Common causes:
# - DynamoDB not ready
# - Configuration errors
# - Resource limits too low
```

#### **DynamoDB Connection Failed**
```bash
# Test DynamoDB connectivity
kubectl exec -it deployment/cart-service -n retail-store -- sh
# Inside pod:
curl http://cart-dynamodb:8000

# Check DynamoDB logs
kubectl logs -f deployment/cart-dynamodb -n retail-store
```

#### **Service Not Accessible**
```bash
# Check service endpoints
kubectl get endpoints cart-service -n retail-store

# Check if pods are ready
kubectl get pods -l app.kubernetes.io/name=cart-service -n retail-store

# Check service selector matches pod labels
kubectl describe service cart-service -n retail-store
```

## Key Learning Points

### **1. Resource Dependencies**
```
Namespace → ServiceAccount → ConfigMap/Secret → DynamoDB → Cart Service
```

### **2. Label Consistency**
All resources use consistent labels:
- `app.kubernetes.io/name`: Service identifier
- `app.kubernetes.io/component`: Component type (service, database, config)
- `app.kubernetes.io/part-of`: Application group

### **3. Configuration Management**
- **ConfigMap**: Non-sensitive configuration
- **Secret**: Sensitive data (base64 encoded)
- **Environment Variables**: Injected into containers

### **4. Service Discovery**
- **Service Name**: `cart-service`
- **FQDN**: `cart-service.retail-store.svc.cluster.local`
- **Port**: 80 (external) → 8080 (container)

### **5. Health Checks**
- **Liveness Probe**: Restarts unhealthy containers
- **Readiness Probe**: Controls traffic routing
- **Endpoints**: `/actuator/health/liveness` and `/actuator/health/readiness`

This template provides a complete, production-ready deployment for the cart service that you can adapt for other services by changing the service-specific configurations, images, and dependencies.
