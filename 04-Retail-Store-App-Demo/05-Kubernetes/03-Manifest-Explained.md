# Kubernetes Manifest File - Simple Explanation

This README explains the retail store manifest file in simple terms - what it does, why it's written this way, and how it creates the application.

## What is a Kubernetes Manifest File?

A **manifest file** is like a **blueprint** or **recipe** that tells Kubernetes:
- What applications to run
- How to configure them
- How they should connect to each other
- What resources they need

Think of it like a **restaurant order** - you tell the waiter (Kubernetes) exactly what you want, and they make it happen.

## Why This Manifest is Written This Way

### **1. Microservices Architecture**
Instead of one big application, we have **5 small applications** that work together:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Catalog   │    │    Cart     │    │   Orders    │
│  (Products) │    │ (Shopping)  │    │(Processing) │
└─────────────┘    └─────────────┘    └─────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    MySQL    │    │  DynamoDB   │    │ PostgreSQL  │
│ (Database)  │    │ (Database)  │    │ (Database)  │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Why separate?**
- Each service can be updated independently
- If one breaks, others keep working
- Different teams can work on different services
- Can scale each service differently

### **2. Each Service Needs Multiple Kubernetes Resources**

For **each microservice**, we need:

#### **A. Identity (ServiceAccount)**
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: catalog
```
**Purpose**: Like an ID card for the service - "I am the catalog service"

#### **B. Configuration (ConfigMap)**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: catalog
data:
  RETAIL_CATALOG_PERSISTENCE_PROVIDER: mysql
  RETAIL_CATALOG_PERSISTENCE_ENDPOINT: catalog-mysql:3306
```
**Purpose**: Non-secret settings - "Connect to MySQL at catalog-mysql:3306"

#### **C. Secrets (Secret)**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: catalog-db
data:
  RETAIL_CATALOG_PERSISTENCE_USER: "Y2F0YWxvZw=="  # base64: catalog
  RETAIL_CATALOG_PERSISTENCE_PASSWORD: "Z2pFY2lqQUQ3T1NEbkhmOA=="
```
**Purpose**: Sensitive data like passwords - encoded for security

#### **D. Network Access (Service)**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: catalog
spec:
  ports:
    - port: 80
      targetPort: http
  selector:
    app.kubernetes.io/name: catalog
```
**Purpose**: Like a phone number - other services call "catalog" to reach this service

#### **E. The Application (Deployment)**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: catalog
spec:
  replicas: 1
  template:
    spec:
      containers:
        - name: catalog
          image: "public.ecr.aws/aws-containers/retail-store-sample-catalog:1.2.2"
          envFrom:
            - configMapRef:
                name: catalog
            - secretRef:
                name: catalog-db
```
**Purpose**: The actual running application with its container image

#### **F. Database (StatefulSet)**
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: catalog-mysql
spec:
  template:
    spec:
      containers:
        - name: mysql
          image: "public.ecr.aws/docker/library/mysql:8.0"
```
**Purpose**: The database that stores data permanently

## How the Manifest Creates the Application

### **Step 1: Kubernetes Reads the Manifest**
```bash
kubectl apply -f manifest.yaml
```
Kubernetes reads the entire file and says: "I need to create 35 resources"

### **Step 2: Creates Resources in Order**

#### **Phase 1: Basic Setup (Instant)**
```
✓ ServiceAccounts created (5)
✓ ConfigMaps created (5) 
✓ Secrets created (3)
✓ Services created (11)
```
**What happens**: Kubernetes creates the "infrastructure" - like setting up phone numbers and ID cards

#### **Phase 2: Databases Start (3-5 minutes)**
```
✓ MySQL starts (for Catalog)
✓ PostgreSQL starts (for Orders)
✓ RabbitMQ starts (for Messages)
✓ Redis starts (for Cache)
✓ DynamoDB Local starts (for Cart)
```
**What happens**: Databases initialize, create tables, set up users

#### **Phase 3: Applications Start (2-3 minutes)**
```
✓ Catalog app connects to MySQL
✓ Cart app connects to DynamoDB
✓ Orders app connects to PostgreSQL + RabbitMQ
✓ Checkout app connects to Redis
✓ UI app connects to all backend services
```
**What happens**: Applications start and connect to their databases

#### **Phase 4: Load Balancer (2-4 minutes)**
```
✓ AWS creates Application Load Balancer
✓ Routes traffic to healthy applications
✓ Provides public URL for access
```
**What happens**: External access is configured

### **Step 3: How Services Connect**

#### **Example: Catalog Service Startup**
```
1. Kubernetes starts catalog container
2. Injects environment variables from ConfigMap:
   - RETAIL_CATALOG_PERSISTENCE_PROVIDER=mysql
   - RETAIL_CATALOG_PERSISTENCE_ENDPOINT=catalog-mysql:3306
3. Injects secrets:
   - RETAIL_CATALOG_PERSISTENCE_USER=catalog
   - RETAIL_CATALOG_PERSISTENCE_PASSWORD=gjEcijAD7OSDnHf8
4. App reads these variables and connects to MySQL
5. App starts serving on port 8080
6. Service "catalog" routes traffic to this app
```

#### **Example: How UI Connects to Catalog**
```
1. UI app needs product data
2. UI calls: http://catalog/products
3. Kubernetes DNS resolves "catalog" to catalog service IP
4. Service routes request to catalog app pod
5. Catalog app queries MySQL database
6. Returns product data to UI
```

## Why Each Resource Type Exists

### **ServiceAccount**
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: catalog
```
**Simple Explanation**: Like a name tag - "I am the catalog service"
**Why needed**: Security - Kubernetes needs to know who is making requests

### **ConfigMap**
```yaml
apiVersion: v1
kind: ConfigMap
data:
  DATABASE_HOST: catalog-mysql
  DATABASE_PORT: "3306"
```
**Simple Explanation**: Like a settings file - non-secret configuration
**Why needed**: Apps need to know where to connect, what settings to use

### **Secret**
```yaml
apiVersion: v1
kind: Secret
data:
  username: Y2F0YWxvZw==  # encoded
  password: cGFzc3dvcmQ=  # encoded
```
**Simple Explanation**: Like a locked safe - stores passwords securely
**Why needed**: Passwords shouldn't be visible in plain text

### **Service**
```yaml
apiVersion: v1
kind: Service
spec:
  selector:
    app.kubernetes.io/name: catalog
  ports:
    - port: 80
```
**Simple Explanation**: Like a phone number - other apps call this to reach catalog
**Why needed**: Apps need a stable way to find each other

### **Deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 1
  template:
    spec:
      containers:
        - name: catalog
          image: catalog:1.2.2
```
**Simple Explanation**: The actual running application
**Why needed**: This is your application code running in a container

### **StatefulSet**
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: catalog-mysql
```
**Simple Explanation**: Like Deployment but for databases that need permanent storage
**Why needed**: Databases need to keep data even if they restart

### **Ingress**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
spec:
  rules:
    - http:
        paths:
          - path: /
            backend:
              service:
                name: ui
```
**Simple Explanation**: Like a front door - how users access your app from internet
**Why needed**: Creates AWS Load Balancer for external access

## The Complete Flow

### **1. User Visits Website**
```
User types: http://your-app-url.com
    ↓
AWS Load Balancer (created by Ingress)
    ↓
Routes to UI Service
    ↓
UI Pod serves the website
```

### **2. User Browses Products**
```
UI needs product data
    ↓
UI calls: http://catalog/products
    ↓
Kubernetes routes to Catalog Service
    ↓
Catalog Pod queries MySQL
    ↓
Returns product list to UI
    ↓
User sees products on website
```

### **3. User Adds to Cart**
```
UI sends: POST http://carts/add-item
    ↓
Kubernetes routes to Cart Service
    ↓
Cart Pod saves to DynamoDB
    ↓
Returns success to UI
    ↓
User sees item in cart
```

### **4. User Places Order**
```
UI sends: POST http://orders/create
    ↓
Orders Service saves to PostgreSQL
    ↓
Orders Service sends message to RabbitMQ
    ↓
Order processing begins
    ↓
User gets order confirmation
```

## Why This Architecture Works

### **1. Separation of Concerns**
- **UI**: Only handles user interface
- **Catalog**: Only manages products
- **Cart**: Only manages shopping carts
- **Orders**: Only processes orders
- **Checkout**: Only handles payments

### **2. Independent Scaling**
```bash
# Scale only the busy services
kubectl scale deployment catalog --replicas=5    # More product requests
kubectl scale deployment ui --replicas=3        # More users
kubectl scale deployment orders --replicas=2    # Normal order volume
```

### **3. Independent Updates**
- Update catalog service without affecting cart
- Fix UI bugs without touching backend
- Upgrade databases independently

### **4. Fault Tolerance**
- If catalog fails, cart and orders still work
- If one database fails, others continue
- Load balancer routes around failed pods

## Summary

**The manifest file is like a detailed recipe that tells Kubernetes:**

1. **What to cook**: 5 microservices + databases
2. **How to cook it**: Container images, configurations, connections
3. **How to serve it**: Load balancer, networking, security
4. **How to keep it fresh**: Health checks, restarts, scaling

**The result**: A complete, professional e-commerce application that can handle real users, scale automatically, and recover from failures.

**Think of it as**: Building a restaurant where each chef (microservice) has their own station (container), ingredients (configuration), and way to communicate with other chefs (services), all coordinated by a head chef (Kubernetes) following your detailed recipe (manifest file).
