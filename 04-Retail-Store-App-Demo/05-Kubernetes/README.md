Retail Store Sample Application - Kubernetes Manifests
A complete microservices-based retail store application deployed on Kubernetes with modern Application Load Balancer (ALB) integration.

Architecture Overview
This application implements a microservices architecture with the following components:

Frontend: React-based UI service

Backend Services: Catalog, Cart, Orders, Checkout microservices

Databases: MySQL, PostgreSQL, DynamoDB Local, Redis

Message Broker: RabbitMQ

Load Balancer: AWS Application Load Balancer (ALB)

Services Architecture
1. Catalog Service
Purpose: Product catalog management with MySQL database

Components:

ServiceAccount: catalog - Identity for catalog pods

Secret: catalog-db - MySQL credentials (base64 encoded)

ConfigMap: catalog - Database connection configuration

Service: catalog-mysql (port 3306) - MySQL database endpoint

Service: catalog (port 80) - Catalog API endpoint

Deployment: catalog - Catalog application (1 replica)

StatefulSet: catalog-mysql - MySQL database with persistent identity

Database: MySQL 8.0 with catalog database and user credentials

2. Cart Service
Purpose: Shopping cart management with DynamoDB Local

Components:

ServiceAccount: carts - Identity for cart pods

ConfigMap: carts - DynamoDB connection and table configuration

Service: carts-dynamodb (port 8000) - DynamoDB Local endpoint

Service: carts (port 80) - Cart API endpoint

Deployment: carts - Cart application (1 replica)

Deployment: carts-dynamodb - DynamoDB Local database

Database: DynamoDB Local with Items table auto-creation

3. Orders Service
Purpose: Order processing with PostgreSQL and RabbitMQ

Components:

ServiceAccount: orders - Identity for orders pods

Secret: orders-rabbitmq - RabbitMQ credentials (empty placeholder)

Secret: orders-db - PostgreSQL credentials

ConfigMap: orders - Database and messaging configuration

Service: orders-postgresql (port 5432) - PostgreSQL endpoint

Service: orders-rabbitmq (ports 5672, 15672) - RabbitMQ endpoint

Service: orders (port 80) - Orders API endpoint

Deployment: orders - Orders application (1 replica)

StatefulSet: orders-postgresql - PostgreSQL database

StatefulSet: orders-rabbitmq - RabbitMQ message broker

Database: PostgreSQL 16.1 with orders database
Messaging: RabbitMQ 3 with management interface

4. Checkout Service
Purpose: Checkout processing with Redis cache

Components:

ServiceAccount: checkout - Identity for checkout pods

ConfigMap: checkout - Redis connection and orders service endpoint

Service: checkout-redis (port 6379) - Redis cache endpoint

Service: checkout (port 80) - Checkout API endpoint

Deployment: checkout - Checkout application (1 replica)

Deployment: checkout-redis - Redis cache

Cache: Redis 6.0 Alpine for session management

5. UI Service
Purpose: Frontend web application

Components:

ServiceAccount: ui - Identity for UI pods

ConfigMap: ui - Backend service endpoints configuration

Service: ui (port 80) - UI service endpoint (ClusterIP for ALB)

Deployment: ui - Frontend application (1 replica)

Frontend: Java-based UI connecting to all backend services

Load Balancer Configuration
Application Load Balancer (ALB)
Modern ALB Implementation replacing Classic Load Balancer

Component:

Ingress: retail-store-alb - ALB with advanced routing

Features:

Internet-facing scheme with IP target type

HTTP port 80 listener

Health checks on /actuator/health/readiness

Path-based routing for UI and API endpoints

Routing Rules:

/ → UI Service (main application)

/api/catalog → Catalog Service

/api/carts → Cart Service

/api/orders → Orders Service

/api/checkout → Checkout Service

Kubernetes Resources Summary
Resource Type	Count	Purpose
ServiceAccount	5	Pod identity and RBAC
Secret	3	Sensitive data (passwords, tokens)
ConfigMap	5	Non-sensitive configuration
Service	11	Network endpoints and load balancing
Deployment	7	Stateless application management
StatefulSet	3	Stateful database management
Ingress	1	External access via ALB
Security Features
Container Security
Non-root execution: All containers run as user ID 1000

Read-only root filesystem: Prevents runtime modifications

Dropped capabilities: Removes unnecessary Linux capabilities

Security contexts: Enforces security policies

Data Security
Secrets management: Base64 encoded sensitive data

Network isolation: ClusterIP services for internal communication

Resource limits: Memory and CPU constraints

Network Security
Internal communication: Services communicate via ClusterIP

External access: Only through ALB ingress

Health checks: Readiness probes for traffic routing

Monitoring & Observability
Prometheus Integration
All services configured with Prometheus metrics:

Metrics endpoints: /metrics or /actuator/prometheus

Scraping enabled: prometheus.io/scrape: "true"

Custom ports: Service-specific metric ports

Health Checks
Readiness probes: HTTP health checks for load balancer integration

Health endpoints: /health or /actuator/health/readiness

Configurable timeouts: Service-specific probe settings

Resource Requirements
Memory Allocation
Catalog: 256Mi limit/request

Cart: 512Mi limit/request

Orders: 512Mi limit/request

Checkout: 256Mi limit/request

UI: 512Mi limit/request

CPU Allocation
Catalog: 256m request

Cart: 256m request

Orders: 256m request

Checkout: 128m request

UI: 128m request

Prerequisites
AWS Requirements
EKS Cluster with worker nodes

AWS Load Balancer Controller installed

VPC with public subnets in multiple AZs

IAM permissions for ALB creation

Security groups allowing HTTP/HTTPS traffic

Kubernetes Requirements
kubectl configured for cluster access

Ingress controller (AWS Load Balancer Controller)

StorageClass for persistent volumes (if needed)

Deployment Instructions
1. Deploy Database Services
# Deploy StatefulSets first (databases)
kubectl apply -f <manifest-file> --selector="app.kubernetes.io/component in (mysql,postgresql,rabbitmq)"

Copy

Insert at cursor
bash
2. Deploy Backend Services
# Deploy application services
kubectl apply -f <manifest-file> --selector="app.kubernetes.io/component=service"

Copy

Insert at cursor
bash
3. Deploy Load Balancer
# Deploy Ingress (ALB)
kubectl apply -f <manifest-file> --selector="app.kubernetes.io/component=ingress"

Copy

Insert at cursor
bash
4. Verify Deployment
# Check all pods are running
kubectl get pods

# Check services
kubectl get services

# Check ingress and ALB
kubectl get ingress

Copy

Insert at cursor
bash
Access the Application
Get ALB URL
kubectl get ingress retail-store-alb -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

Copy

Insert at cursor
bash
Application Endpoints
Main Application: http://<ALB-URL>/

Catalog API: http://<ALB-URL>/api/catalog

Cart API: http://<ALB-URL>/api/carts

Orders API: http://<ALB-URL>/api/orders

Checkout API: http://<ALB-URL>/api/checkout

ALB Benefits vs Classic Load Balancer
Cost Efficiency
Pay per ALB rule instead of per load balancer

Consolidated routing reduces infrastructure costs

Advanced Features
Path-based routing: Route by URL path

Host-based routing: Multiple domains support

SSL termination: Integrated with AWS Certificate Manager

WAF integration: Built-in security with AWS WAF

HTTP/2 support: Modern protocol support

WebSocket support: Real-time applications

Better Performance
More efficient request routing

Advanced health check options

Better integration with AWS services

Troubleshooting
Common Issues
Pods not starting: Check resource limits and node capacity

Services not accessible: Verify service selectors and labels

ALB not created: Check AWS Load Balancer Controller and IAM permissions

Database connection issues: Verify secrets and ConfigMaps

Debugging Commands
# Check pod logs
kubectl logs <pod-name>

# Describe resources
kubectl describe pod <pod-name>
kubectl describe service <service-name>
kubectl describe ingress retail-store-alb

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp

Copy

Insert at cursor
bash
Production Considerations
High Availability
Increase replica counts for production workloads

Use persistent volumes for databases

Configure pod disruption budgets

Implement horizontal pod autoscaling

Security Enhancements
Enable SSL/TLS with ACM certificates

Configure WAF rules for protection

Implement network policies

Use AWS Secrets Manager integration

Monitoring
Set up CloudWatch monitoring

Configure log aggregation

Implement distributed tracing

Set up alerting for critical metrics

This manifest provides a complete, production-ready microservices application with modern ALB integration, comprehensive security, and observability features.
