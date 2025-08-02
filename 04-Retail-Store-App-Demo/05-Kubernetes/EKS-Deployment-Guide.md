# EKS Deployment Guide - Retail Store Application

Complete guide for deploying the retail store microservices application on Amazon EKS cluster.

## Deployment Overview

This guide explains how the Kubernetes manifest creates a production-ready retail store application in EKS with 35 resources across 5 microservices.

## Prerequisites Setup

### 1. EKS Cluster Requirements
- **EKS Cluster**: Running with worker nodes
- **kubectl**: Configured to access your EKS cluster
- **Helm**: Installed for package management

### 2. AWS Load Balancer Controller Installation
```bash
# Install CRDs
kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller//crds?ref=master"

# Add EKS Helm repository
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install AWS Load Balancer Controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=<your-cluster-name> \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

### 3. IAM Permissions
Ensure your EKS cluster has permissions for:
- ALB creation and management
- EC2 instance management
- VPC and subnet access

## Deployment Process

### Step 1: Deploy All Resources
```bash
# Deploy the complete manifest
kubectl apply -f retail-store-manifest.yaml
```

### Step 2: Monitor Deployment Progress
```bash
# Watch all pods starting
kubectl get pods -w

# Check deployment status
kubectl get deployments
kubectl get statefulsets
```

### Step 3: Wait for Database Readiness
```bash
# Wait for databases to be ready (critical for app startup)
kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=mysql --timeout=300s
kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=postgresql --timeout=300s
kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=rabbitmq --timeout=300s
```

### Step 4: Verify Application Services
```bash
# Check all services are running
kubectl get services

# Verify ingress and ALB creation
kubectl get ingress retail-store-alb
```

## Deployment Timeline

### Phase 1: Infrastructure Creation (1-2 minutes)
**What Happens:**
- **ServiceAccounts**: 5 identities created for pod security
- **Secrets**: 3 secrets with database credentials (base64 encoded)
- **ConfigMaps**: 5 configuration maps with service settings
- **Services**: 11 ClusterIP services for internal communication

**Resources Created:**
```
✓ ServiceAccount: catalog, carts, orders, checkout, ui
✓ Secret: catalog-db, orders-rabbitmq, orders-db  
✓ ConfigMap: catalog, carts, orders, checkout, ui
✓ Services: Internal networking endpoints
```

### Phase 2: Database Layer Startup (3-5 minutes)
**What Happens:**
- **MySQL StatefulSet**: Catalog database initializes with schema
- **PostgreSQL StatefulSet**: Orders database starts with user setup
- **RabbitMQ StatefulSet**: Message broker starts with management interface
- **Redis Deployment**: Cache service starts for checkout sessions
- **DynamoDB Local**: NoSQL database for cart data

**Database Initialization:**
```
✓ MySQL 8.0: catalog database, catalog user
✓ PostgreSQL 16.1: orders database, orders user  
✓ RabbitMQ 3: Message queues for order processing
✓ Redis 6.0: Session cache for checkout
✓ DynamoDB Local: Items table auto-creation
```

### Phase 3: Application Services (2-3 minutes)
**What Happens:**
- **Catalog Service**: Connects to MySQL, loads product data
- **Cart Service**: Connects to DynamoDB, ready for cart operations
- **Orders Service**: Connects to PostgreSQL & RabbitMQ for order processing
- **Checkout Service**: Connects to Redis and Orders API
- **UI Service**: Frontend connects to all backend APIs

**Service Startup Sequence:**
```
1. Catalog → MySQL connection established
2. Cart → DynamoDB table created and ready
3. Orders → PostgreSQL + RabbitMQ connections active
4. Checkout → Redis cache and Orders API integration
5. UI → All backend service endpoints configured
```

### Phase 4: Load Balancer Provisioning (2-4 minutes)
**What Happens:**
- **ALB Creation**: AWS provisions Application Load Balancer
- **Target Registration**: EKS pods registered as ALB targets
- **Health Checks**: ALB performs readiness checks on `/actuator/health/readiness`
- **DNS Propagation**: ALB DNS name becomes available
- **Routing Rules**: Path-based routing configured

**ALB Configuration:**
```
✓ Internet-facing ALB created
✓ Target groups for each service
✓ Health checks: 30s interval, 5s timeout
✓ Routing rules:
  - / → UI Service
  - /api/catalog → Catalog Service
  - /api/carts → Cart Service
  - /api/orders → Orders Service  
  - /api/checkout → Checkout Service
```

## Final Architecture in EKS

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                AWS Application Load Balancer                │
│            (retail-store-alb ingress)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  EKS Cluster                                │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ UI Service  │  │   Catalog   │  │    Cart     │         │
│  │   (Java)    │  │   Service   │  │   Service   │         │
│  │             │  │             │  │             │         │
│  └─────────────┘  └──────┬──────┘  └──────┬──────┘         │
│                          │                │                │
│  ┌─────────────┐  ┌──────▼──────┐  ┌──────▼──────┐         │
│  │   Orders    │  │    MySQL    │  │  DynamoDB   │         │
│  │   Service   │  │     8.0     │  │    Local    │         │
│  │             │  │             │  │             │         │
│  └──────┬──────┘  └─────────────┘  └─────────────┘         │
│         │                                                  │
│  ┌──────▼──────┐  ┌─────────────┐                          │
│  │ PostgreSQL  │  │  RabbitMQ   │                          │
│  │    16.1     │  │      3      │                          │
│  │             │  │             │                          │
│  └─────────────┘  └─────────────┘                          │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │  Checkout   │  │    Redis    │                          │
│  │   Service   │  │     6.0     │                          │
│  │             │  │             │                          │
│  └─────────────┘  └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

## Access Your Application

### Get ALB URL
```bash
# Get the load balancer URL
kubectl get ingress retail-store-alb -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### Application Endpoints
- **Main Application**: `http://<ALB-URL>/`
- **Catalog API**: `http://<ALB-URL>/api/catalog`
- **Cart API**: `http://<ALB-URL>/api/carts`
- **Orders API**: `http://<ALB-URL>/api/orders`
- **Checkout API**: `http://<ALB-URL>/api/checkout`

## Resource Allocation in EKS

### Memory Usage
- **Total Memory**: ~2.3 GB across all services
- **Catalog**: 256Mi
- **Cart**: 512Mi  
- **Orders**: 512Mi
- **Checkout**: 256Mi
- **UI**: 512Mi
- **Databases**: ~256Mi each

### CPU Usage
- **Total CPU**: ~1.2 cores across all services
- **Application Services**: 128m-256m each
- **Databases**: Burstable CPU usage

## Monitoring and Health Checks

### Prometheus Integration
All services expose metrics:
```bash
# Check metrics endpoints
curl http://<service-ip>:8080/metrics
curl http://<service-ip>:8080/actuator/prometheus
```

### Health Check Endpoints
```bash
# Application health checks
curl http://<ALB-URL>/actuator/health/readiness
curl http://<ALB-URL>/health
```

### Logging
```bash
# View application logs
kubectl logs -f deployment/catalog
kubectl logs -f deployment/carts
kubectl logs -f deployment/orders
kubectl logs -f deployment/checkout
kubectl logs -f deployment/ui
```

## Total Deployment Time

**Expected Timeline: 8-15 minutes**

| Phase | Duration | Critical Path |
|-------|----------|---------------|
| Infrastructure | 1-2 min | ServiceAccounts, Secrets, ConfigMaps |
| Databases | 3-5 min | MySQL, PostgreSQL, RabbitMQ initialization |
| Applications | 2-3 min | Service startup and API readiness |
| Load Balancer | 2-4 min | ALB provisioning and health checks |
| DNS Propagation | 1-2 min | ALB DNS availability |

## Troubleshooting Common Issues

### Pods Not Starting
```bash
# Check pod status and events
kubectl describe pod <pod-name>
kubectl get events --sort-by=.metadata.creationTimestamp
```

### Database Connection Issues
```bash
# Check database pod logs
kubectl logs -f statefulset/catalog-mysql
kubectl logs -f statefulset/orders-postgresql
kubectl logs -f statefulset/orders-rabbitmq
```

### ALB Not Created
```bash
# Verify AWS Load Balancer Controller
kubectl get pods -n kube-system | grep aws-load-balancer-controller

# Check ingress events
kubectl describe ingress retail-store-alb
```

### Service Communication Issues
```bash
# Test internal service connectivity
kubectl exec -it <pod-name> -- curl http://catalog:80/health
kubectl exec -it <pod-name> -- curl http://carts:80/health
```

## Production Considerations

### Scaling
```bash
# Scale application services
kubectl scale deployment catalog --replicas=3
kubectl scale deployment carts --replicas=3
kubectl scale deployment orders --replicas=2
kubectl scale deployment checkout --replicas=2
kubectl scale deployment ui --replicas=3
```

### High Availability
- Deploy across multiple AZs
- Use persistent volumes for databases
- Configure pod disruption budgets
- Implement horizontal pod autoscaling

### Security Enhancements
- Enable SSL/TLS with ACM certificates
- Configure WAF rules on ALB
- Implement network policies
- Use AWS Secrets Manager for credentials

## Kubernetes Data Storage & Configuration Management

### Where Labels, Data, and Selectors are Stored

#### **1. etcd Database - The Source of Truth**
All Kubernetes resources are stored in **etcd** (distributed key-value store):
```
etcd cluster → Stores all manifest data
├── Labels: metadata.labels
├── Selectors: spec.selector  
├── ConfigMap data: data.*
├── Secret data: data.* (base64 encoded)
└── Service endpoints: spec.ports, spec.selector
```

#### **2. Kubernetes API Server - The Gateway**
Acts as the interface between applications and etcd:
```
API Server → Retrieves data from etcd
├── Validates requests
├── Applies RBAC policies
├── Returns filtered results
└── Watches for changes
```

### How Labels & Selectors Work in Our Manifest

#### **Labels Storage (in metadata)**
```yaml
metadata:
  labels:
    app.kubernetes.io/name: catalog
    app.kubernetes.io/component: service
    app.kubernetes.io/owner: retail-store-sample
```
**Storage Location**: etcd → `/registry/pods/default/catalog-xyz`

#### **Selectors Usage (for pod matching)**
```yaml
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: catalog
      app.kubernetes.io/component: service
```
**Purpose**: Kubernetes controllers match these labels to find target pods

### Configuration Data Storage & Retrieval

#### **ConfigMap Data Storage**
```yaml
# From our manifest:
data:
  RETAIL_CATALOG_PERSISTENCE_PROVIDER: mysql
  RETAIL_CATALOG_PERSISTENCE_ENDPOINT: catalog-mysql:3306
  RETAIL_CATALOG_PERSISTENCE_DB_NAME: catalog
```
**Storage**: etcd → `/registry/configmaps/default/catalog`
**App Access**: Environment variables injected into pod containers

#### **Secret Data Storage**
```yaml
# From our manifest:
data:
  RETAIL_CATALOG_PERSISTENCE_USER: "Y2F0YWxvZw=="  # base64: catalog
  RETAIL_CATALOG_PERSISTENCE_PASSWORD: "Z2pFY2lqQUQ3T1NEbkhmOA=="
```
**Storage**: etcd → `/registry/secrets/default/catalog-db` (encrypted at rest)
**App Access**: Environment variables or mounted files

### How Our Applications Fetch Configuration

#### **1. Environment Variable Injection Process**
```yaml
# From our catalog service:
containers:
- name: catalog
  envFrom:
    - configMapRef:
        name: catalog      # Fetches from etcd via API server
    - secretRef:
        name: catalog-db   # Fetches from etcd via API server
```

#### **2. Service Discovery in Action**
```yaml
# Service definition from our manifest:
spec:
  selector:
    app.kubernetes.io/name: catalog
    app.kubernetes.io/component: mysql
```

**Service Discovery Flow:**
1. **Service Controller** queries API server for pods with matching labels
2. **API Server** queries etcd for pods with those labels
3. **Endpoints Controller** creates endpoint list
4. **kube-proxy** updates iptables rules for load balancing

#### **3. DNS Resolution Process**
```yaml
# App connects to: catalog-mysql:3306
# DNS resolution flow:
catalog-mysql → kube-dns → API server → etcd → Returns pod IPs
```

### Real-time Data Flow During Application Startup

#### **Configuration Injection Sequence:**
```
1. Pod starts → kubelet pulls container image
2. kubelet → API server: "Get ConfigMap 'catalog'"
3. API server → etcd: Query ConfigMap data
4. etcd → API server: Returns configuration data
5. API server → kubelet: ConfigMap data
6. kubelet → Injects as environment variables into container
7. App reads environment variables (RETAIL_CATALOG_PERSISTENCE_*)
8. App connects to catalog-mysql:3306
9. kube-dns resolves service name to MySQL pod IP
10. Connection established to MySQL database
```

#### **Service Discovery Flow:**
```
Catalog App calls "catalog-mysql:3306"
    ↓
kube-dns (CoreDNS) receives DNS query
    ↓
Queries API server for service "catalog-mysql"
    ↓
API server queries etcd for service definition
    ↓
Returns endpoint IPs of pods matching selector:
    app.kubernetes.io/name: catalog
    app.kubernetes.io/component: mysql
    ↓
Connection routed to healthy MySQL pod
```

### Kubernetes Storage Architecture

```
┌─────────────────────────────────────────┐
│                etcd Cluster             │
│  ┌─────────────────────────────────────┐│
│  │ /registry/configmaps/default/       ││  ← Our ConfigMaps
│  │ /registry/secrets/default/          ││  ← Our Secrets  
│  │ /registry/services/default/         ││  ← Our Services
│  │ /registry/pods/default/             ││  ← Our Pods
│  │ /registry/deployments/default/      ││  ← Our Deployments
│  └─────────────────────────────────────┘│
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│            API Server                   │
│  ┌─────────────────────────────────────┐│
│  │ - Validates manifest requests       ││
│  │ - Applies RBAC policies             ││
│  │ - Watches for resource changes      ││
│  │ - Serves data to controllers        ││
│  └─────────────────────────────────────┘│
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│              Controllers                │
│  ┌─────────────────────────────────────┐│
│  │ - Deployment Controller             ││  ← Manages our apps
│  │ - Service Controller                ││  ← Creates endpoints
│  │ - Endpoints Controller              ││  ← Updates service IPs
│  │ - Ingress Controller (ALB)          ││  ← Manages our ALB
│  └─────────────────────────────────────┘│
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│               kubelet                   │
│  ┌─────────────────────────────────────┐│
│  │ - Pulls ConfigMaps/Secrets          ││  ← Gets our config
│  │ - Injects as environment variables  ││  ← Into our containers
│  │ - Mounts volumes if needed          ││
│  │ - Starts our application containers ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### Configuration Examples from Our Manifest

#### **Catalog Service Configuration Flow:**
```yaml
# 1. ConfigMap stored in etcd:
apiVersion: v1
kind: ConfigMap
metadata:
  name: catalog
data:
  RETAIL_CATALOG_PERSISTENCE_PROVIDER: mysql
  RETAIL_CATALOG_PERSISTENCE_ENDPOINT: catalog-mysql:3306
  RETAIL_CATALOG_PERSISTENCE_DB_NAME: catalog

# 2. Secret stored in etcd (encrypted):
apiVersion: v1
kind: Secret
metadata:
  name: catalog-db
data:
  RETAIL_CATALOG_PERSISTENCE_USER: "Y2F0YWxvZw=="
  RETAIL_CATALOG_PERSISTENCE_PASSWORD: "Z2pFY2lqQUQ3T1NEbkhmOA=="

# 3. Deployment references both:
spec:
  template:
    spec:
      containers:
      - name: catalog
        envFrom:
        - configMapRef:
            name: catalog     # kubelet fetches from API server → etcd
        - secretRef:
            name: catalog-db  # kubelet fetches from API server → etcd
```

#### **Service Discovery Example:**
```yaml
# 1. MySQL Service definition:
apiVersion: v1
kind: Service
metadata:
  name: catalog-mysql
spec:
  selector:
    app.kubernetes.io/name: catalog
    app.kubernetes.io/component: mysql
  ports:
  - port: 3306
    targetPort: mysql

# 2. MySQL Pod with matching labels:
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: catalog-mysql
spec:
  template:
    metadata:
      labels:
        app.kubernetes.io/name: catalog      # ← Matches service selector
        app.kubernetes.io/component: mysql   # ← Matches service selector
```

### Key Takeaways

1. **All data lives in etcd** - distributed, consistent, encrypted storage
2. **API server is the gateway** - all access goes through authentication/authorization
3. **Labels enable loose coupling** - services find pods dynamically using selectors
4. **DNS provides service discovery** - apps use service names, Kubernetes resolves to pod IPs
5. **Environment variables inject config** - apps get configuration at container startup
6. **Controllers maintain desired state** - continuously reconcile actual vs desired state

**The beauty of Kubernetes**: Applications don't need to know about etcd, API servers, or complex service discovery. They simply:
- Read environment variables for configuration
- Use DNS names to connect to other services
- Kubernetes handles all the complex orchestration behind the scenes

This deployment creates a complete, production-ready microservices application on EKS with modern load balancing, comprehensive monitoring, and enterprise-grade security features.
