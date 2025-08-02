# Retail Store Application - Dockerfiles Guide

Complete guide to the Docker containerization strategy for all microservices in the retail store application.

## GitHub Repository
https://github.com/akhil27051999/retail-store-sample-app.git

## Overview

All services use **multi-stage Docker builds** with Amazon Linux 2023 base images for optimal security, performance, and consistency across the AWS ecosystem.

## Common Docker Patterns

### **Multi-Stage Build Strategy**
- **Stage 1 (Build)**: Contains build tools and dependencies
- **Stage 2 (Runtime)**: Minimal runtime environment with only necessary components

### **Security Best Practices**
- **Non-root user**: All containers run as `appuser` (UID 1000)
- **Minimal packages**: Only essential runtime dependencies installed
- **Clean package cache**: Reduces image size and attack surface

### **Base Image Choice**
- **Amazon Linux 2023**: Optimized for AWS, security-focused, minimal footprint

---

## Service Dockerfiles

### 1. **Cart Service** - Java/Spring Boot + DynamoDB

#### **Build Stage**
```dockerfile
FROM public.ecr.aws/amazonlinux/amazonlinux:2023 as build-env

# Install build tools
RUN dnf --setopt=install_weak_deps=False install -q -y \
    maven \
    java-21-amazon-corretto-headless \
    which tar gzip \
    && dnf clean all

# Optimize Maven caching
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -B -q

# Build application
COPY ./src ./src
RUN ./mvnw -DskipTests package -q && \
    mv /target/carts-0.0.1-SNAPSHOT.jar /app.jar
```

#### **Runtime Stage**
```dockerfile
FROM public.ecr.aws/amazonlinux/amazonlinux:2023

# Install runtime Java only
RUN dnf --setopt=install_weak_deps=False install -q -y \
    java-21-amazon-corretto-headless \
    shadow-utils \
    && dnf clean all

# Create non-root user
ENV APPUSER=appuser APPUID=1000 APPGID=1000
RUN useradd --home "/app" --create-home --user-group \
    --uid "$APPUID" "$APPUSER"

# Configure Spring Boot
ENV SPRING_PROFILES_ACTIVE=prod
WORKDIR /app
USER appuser

# Copy JAR from build stage
COPY --chown=appuser:appuser --from=build-env /app.jar .
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
```

**Key Features:**
- **Maven dependency caching** for faster rebuilds
- **Spring Boot production profile** enabled
- **JVM options** configurable via `$JAVA_OPTS`

---

### 2. **Catalog Service** - Go + MySQL

#### **Build Stage**
```dockerfile
FROM public.ecr.aws/amazonlinux/amazonlinux:2023 AS build-env

# Install Go and Git
RUN dnf --setopt=install_weak_deps=False install -q -y \
    git golang && dnf clean all

# Setup Go workspace
RUN mkdir -p "${GOPATH}/src" "${GOPATH}/bin" /appsrc
WORKDIR /appsrc

# Configure Go proxy for better module resolution
ENV GOPROXY=https://goproxy.io,direct

# Download dependencies first (caching optimization)
COPY go.mod go.sum ./
RUN go mod download

# Build Go binary
COPY . .
RUN go build -o main main.go
```

#### **Runtime Stage**
```dockerfile
FROM public.ecr.aws/amazonlinux/amazonlinux:2023

# Create non-root user
ENV APPUSER=appuser APPUID=1000 APPGID=1000
RUN dnf --setopt=install_weak_deps=False install -q -y \
    shadow-utils && dnf clean all

RUN useradd --home "/app" --create-home --user-group \
    --uid "$APPUID" "$APPUSER"

# Setup runtime environment
WORKDIR /app
USER appuser
ENV GIN_MODE=release

# Copy binary from build stage
COPY --chown=appuser:appuser --from=build-env /appsrc/main /app/
COPY ./ATTRIBUTION.md ./LICENSES.md ./

ENTRYPOINT ["/app/main"]
```

**Key Features:**
- **Go module proxy** for reliable dependency resolution
- **Gin framework** in release mode for production
- **Static binary** - no runtime dependencies needed

---

### 3. **Checkout Service** - Node.js + Redis

#### **Build Stage**
```dockerfile
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Copy package files with proper ownership
COPY --chown=node:node package*.json ./
COPY --chown=node:node . .

# Install dependencies and build
RUN yarn install --frozen-lockfile
RUN yarn build

USER node
```

#### **Runtime Stage**
```dockerfile
FROM public.ecr.aws/amazonlinux/amazonlinux:2023

# Install Node.js 20
RUN dnf --setopt=install_weak_deps=False install -q -y \
    nodejs20 shadow-utils && dnf clean all

# Set Node.js 20 as default
RUN alternatives --install /usr/bin/node node /usr/bin/node-20 90

# Create non-root user
ENV APPUSER=appuser APPUID=1000 APPGID=1000
RUN useradd --home "/app" --create-home --user-group \
    --uid "$APPUID" "$APPUSER"

# Setup runtime
WORKDIR /app
USER appuser

# Copy built application from build stage
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

ENTRYPOINT ["node", "dist/main.js"]
```

**Key Features:**
- **Yarn frozen lockfile** for reproducible builds
- **Node.js 20** with alternatives system for version management
- **Built assets only** - source code not included in runtime image

---

### 4. **Orders Service** - Java/Spring Boot + PostgreSQL + RabbitMQ

#### **Build Stage**
```dockerfile
FROM public.ecr.aws/amazonlinux/amazonlinux:2023 as build-env

# Install build tools
RUN dnf --setopt=install_weak_deps=False install -q -y \
    maven java-21-amazon-corretto-headless \
    which tar gzip && dnf clean all

# Maven dependency optimization
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -B -q

# Build application
COPY ./src ./src
RUN ./mvnw -DskipTests package -q && \
    mv /target/orders-0.0.1-SNAPSHOT.jar /app.jar
```

#### **Runtime Stage**
```dockerfile
FROM public.ecr.aws/amazonlinux/amazonlinux:2023

# Install runtime and full curl (for health checks)
RUN dnf --setopt=install_weak_deps=False install -q -y \
    java-21-amazon-corretto-headless shadow-utils && dnf clean all

# Upgrade to full curl for telnet health checks
RUN dnf -q -y swap libcurl-minimal libcurl-full && \
    dnf -q -y swap curl-minimal curl-full

# Create non-root user
ENV APPUSER=appuser APPUID=1000 APPGID=1000
RUN useradd --home "/app" --create-home --user-group \
    --uid "$APPUID" "$APPUSER"

# Configure Spring Boot
ENV SPRING_PROFILES_ACTIVE=prod
WORKDIR /app
USER appuser

# Copy application
COPY --chown=appuser:appuser --from=build-env /app.jar .
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
```

**Key Features:**
- **Full curl package** for advanced health check capabilities
- **PostgreSQL and RabbitMQ connectivity** support
- **Production Spring profile** enabled

---

### 5. **UI Service** - Java/Spring Boot Frontend

#### **Build Stage**
```dockerfile
FROM public.ecr.aws/amazonlinux/amazonlinux:2023 AS build-env

# Install build tools
RUN dnf --setopt=install_weak_deps=False install -q -y \
    maven java-21-amazon-corretto-headless \
    which tar gzip && dnf clean all

# Maven optimization
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -B -q

# Build UI application
COPY ./src ./src
RUN ./mvnw -DskipTests package -q && \
    mv /target/ui-0.0.1-SNAPSHOT.jar /app.jar
```

#### **Runtime Stage**
```dockerfile
FROM public.ecr.aws/amazonlinux/amazonlinux:2023

# Install runtime with full curl
RUN dnf --setopt=install_weak_deps=False install -q -y \
    java-21-amazon-corretto-headless shadow-utils && dnf clean all

RUN dnf -q -y swap libcurl-minimal libcurl-full && \
    dnf -q -y swap curl-minimal curl-full

# Create non-root user
ENV APPUSER=appuser APPUID=1000 APPGID=1000
RUN useradd --home "/app" --create-home --user-group \
    --uid "$APPUID" "$APPUSER"

# Configure environment
ENV SPRING_PROFILES_ACTIVE=prod
WORKDIR /app
USER appuser

# Copy application and licenses
COPY ./ATTRIBUTION.md ./LICENSES.md ./
COPY --chown=appuser:appuser --from=build-env /app.jar .

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
```

**Key Features:**
- **Frontend aggregation** - serves UI and coordinates backend calls
- **Full curl support** for backend service health checks
- **License attribution** files included

---

## Docker Build Optimization Strategies

### **1. Layer Caching Optimization**
```dockerfile
# Copy dependency files first
COPY package*.json ./          # Node.js
COPY pom.xml .mvn ./           # Java/Maven  
COPY go.mod go.sum ./          # Go

# Download dependencies (cached layer)
RUN npm install               # Node.js
RUN ./mvnw dependency:go-offline  # Java
RUN go mod download           # Go

# Copy source code last (changes frequently)
COPY ./src ./src
```

### **2. Multi-Architecture Support**
All images support both `amd64` and `arm64` architectures for AWS Graviton instances.

### **3. Security Hardening**
```dockerfile
# Minimal package installation
RUN dnf --setopt=install_weak_deps=False install -q -y

# Non-root user creation
ENV APPUSER=appuser APPUID=1000 APPGID=1000
RUN useradd --home "/app" --create-home --user-group \
    --uid "$APPUID" "$APPUSER"

# Clean package cache
RUN dnf clean all
```

## Build Commands

### **Individual Service Build**
```bash
# Cart Service
docker build -t retail-cart:latest ./src/cart

# Catalog Service  
docker build -t retail-catalog:latest ./src/catalog

# Checkout Service
docker build -t retail-checkout:latest ./src/checkout

# Orders Service
docker build -t retail-orders:latest ./src/orders

# UI Service
docker build -t retail-ui:latest ./src/ui
```

### **Multi-Architecture Build**
```bash
# Enable buildx for multi-arch
docker buildx create --use

# Build for multiple architectures
docker buildx build --platform linux/amd64,linux/arm64 \
  -t retail-cart:latest ./src/cart --push
```

### **Build All Services**
```bash
#!/bin/bash
services=("cart" "catalog" "checkout" "orders" "ui")

for service in "${services[@]}"; do
  echo "Building $service..."
  docker build -t retail-$service:latest ./src/$service
done
```

## Runtime Configuration

### **Environment Variables**
Each service accepts configuration via environment variables:

```bash
# Cart Service
RETAIL_CART_PERSISTENCE_PROVIDER=dynamodb
RETAIL_CART_PERSISTENCE_DYNAMODB_ENDPOINT=http://dynamodb:8000

# Catalog Service  
RETAIL_CATALOG_PERSISTENCE_PROVIDER=mysql
RETAIL_CATALOG_PERSISTENCE_ENDPOINT=mysql:3306

# Checkout Service
RETAIL_CHECKOUT_PERSISTENCE_PROVIDER=redis
RETAIL_CHECKOUT_PERSISTENCE_REDIS_URL=redis://redis:6379

# Orders Service
RETAIL_ORDERS_PERSISTENCE_PROVIDER=postgres
RETAIL_ORDERS_MESSAGING_PROVIDER=rabbitmq

# UI Service
RETAIL_UI_ENDPOINTS_CATALOG=http://catalog:8080
RETAIL_UI_ENDPOINTS_CARTS=http://carts:8080
```

### **JVM Tuning (Java Services)**
```bash
# Memory optimization
JAVA_OPTS="-Xmx512m -Xms256m"

# Garbage collection tuning
JAVA_OPTS="-XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# Container-aware settings
JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
```

## Image Size Comparison

| Service | Language | Build Stage | Runtime Stage | Final Size |
|---------|----------|-------------|---------------|------------|
| **Cart** | Java | ~800MB | ~200MB | ~200MB |
| **Catalog** | Go | ~600MB | ~150MB | ~150MB |
| **Checkout** | Node.js | ~400MB | ~180MB | ~180MB |
| **Orders** | Java | ~800MB | ~220MB | ~220MB |
| **UI** | Java | ~800MB | ~210MB | ~210MB |

## Production Considerations

### **Health Checks**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1
```

### **Resource Limits**
```yaml
# Kubernetes deployment
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi" 
    cpu: "500m"
```

### **Security Scanning**
```bash
# Scan images for vulnerabilities
docker scout cves retail-cart:latest
docker scout recommendations retail-cart:latest
```

This Docker strategy provides secure, efficient, and maintainable containers optimized for AWS environments while following cloud-native best practices.
