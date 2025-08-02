# Retail Store Sample Application - Microservices Overview

A complete e-commerce application built with microservices architecture, featuring 5 core services that work together to provide a full shopping experience.

## Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                           │
│                     (Java - Port 8080)                         │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Catalog   │ │    Cart     │ │   Orders    │
│ (Go-MySQL)  │ │(Java-Dynamo)│ │(Java-Postgres)│
└─────────────┘ └─────────────┘ └─────────────┘
                                        │
                                        ▼
                                ┌─────────────┐
                                │  Checkout   │
                                │(Node-Redis) │
                                └─────────────┘
```

## Core Microservices

### 1. **UI Service** - Frontend & API Gateway
**Technology**: Java (Spring Boot)  
**Port**: 8080  
**Purpose**: Serves the web interface and coordinates backend API calls

**Key Features:**
- **Web Interface**: Complete shopping website UI
- **API Aggregation**: Combines data from all backend services
- **Theme Support**: Multiple UI themes (default, green, orange)
- **Mock Mode**: Can run without backend services for testing

**Configuration:**
```bash
RETAIL_UI_ENDPOINTS_CATALOG=http://catalog:80      # Catalog service URL
RETAIL_UI_ENDPOINTS_CARTS=http://carts:80          # Cart service URL  
RETAIL_UI_ENDPOINTS_ORDERS=http://orders:80        # Orders service URL
RETAIL_UI_ENDPOINTS_CHECKOUT=http://checkout:80    # Checkout service URL
RETAIL_UI_THEME=default                            # UI theme
```

**Endpoints:**
- `/` - Main shopping website
- `/utility/status/{code}` - Testing endpoint
- `/utility/headers` - Debug headers
- `/utility/panic` - Crash simulation

---

### 2. **Catalog Service** - Product Management
**Technology**: Go  
**Database**: MySQL  
**Port**: 8080  
**Purpose**: Manages product catalog and inventory

**Key Features:**
- **Product Listings**: Browse all available products
- **Product Details**: Individual product information
- **Search & Filter**: Find products by category/name
- **Inventory Management**: Stock levels and availability

**Configuration:**
```bash
RETAIL_CATALOG_PERSISTENCE_PROVIDER=mysql         # Database type
RETAIL_CATALOG_PERSISTENCE_ENDPOINT=mysql:3306    # Database connection
RETAIL_CATALOG_PERSISTENCE_DB_NAME=catalogdb      # Database name
RETAIL_CATALOG_PERSISTENCE_USER=catalog_user      # Database user
RETAIL_CATALOG_PERSISTENCE_PASSWORD=password      # Database password
```

**API Endpoints:**
- `GET /catalogue` - List all products
- `GET /catalogue/{id}` - Get product details
- `GET /catalogue/categories` - List categories
- `GET /catalogue/size` - Get catalog size

**Database Schema:**
```sql
-- Products table
CREATE TABLE products (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    price DECIMAL(10,2),
    category VARCHAR(50),
    image_url VARCHAR(200),
    stock_quantity INT
);
```

---

### 3. **Cart Service** - Shopping Cart Management
**Technology**: Java (Spring Boot)  
**Database**: Amazon DynamoDB  
**Port**: 8080  
**Purpose**: Manages customer shopping carts

**Key Features:**
- **Add to Cart**: Add products to customer cart
- **Update Quantities**: Modify item quantities
- **Remove Items**: Delete items from cart
- **Cart Persistence**: Save cart across sessions
- **Multi-User Support**: Separate carts per customer

**Configuration:**
```bash
RETAIL_CART_PERSISTENCE_PROVIDER=dynamodb                    # Database type
RETAIL_CART_PERSISTENCE_DYNAMODB_TABLE_NAME=Items           # DynamoDB table
RETAIL_CART_PERSISTENCE_DYNAMODB_ENDPOINT=http://dynamo:8000 # DynamoDB endpoint
RETAIL_CART_PERSISTENCE_DYNAMODB_CREATE_TABLE=true          # Auto-create table
```

**API Endpoints:**
- `GET /carts/{customerId}` - Get customer cart
- `POST /carts/{customerId}/items` - Add item to cart
- `PUT /carts/{customerId}/items/{itemId}` - Update item quantity
- `DELETE /carts/{customerId}/items/{itemId}` - Remove item
- `DELETE /carts/{customerId}` - Clear entire cart

**DynamoDB Schema:**
```json
{
  "TableName": "Items",
  "KeySchema": [
    {"AttributeName": "id", "KeyType": "HASH"},
    {"AttributeName": "customerId", "KeyType": "RANGE"}
  ],
  "AttributeDefinitions": [
    {"AttributeName": "id", "AttributeType": "S"},
    {"AttributeName": "customerId", "AttributeType": "S"}
  ]
}
```

---

### 4. **Orders Service** - Order Processing
**Technology**: Java (Spring Boot)  
**Database**: PostgreSQL  
**Messaging**: RabbitMQ  
**Port**: 8080  
**Purpose**: Processes and manages customer orders

**Key Features:**
- **Order Creation**: Convert cart to order
- **Order History**: Track customer orders
- **Order Status**: Processing, shipped, delivered states
- **Event Publishing**: Sends order events via RabbitMQ
- **Payment Integration**: Handles payment processing

**Configuration:**
```bash
RETAIL_ORDERS_PERSISTENCE_PROVIDER=postgres                    # Database type
RETAIL_ORDERS_PERSISTENCE_POSTGRES_ENDPOINT=postgres:5432     # Database connection
RETAIL_ORDERS_PERSISTENCE_POSTGRES_NAME=orders                # Database name
RETAIL_ORDERS_PERSISTENCE_POSTGRES_USERNAME=orders_user       # Database user
RETAIL_ORDERS_PERSISTENCE_POSTGRES_PASSWORD=password          # Database password
RETAIL_ORDERS_MESSAGING_PROVIDER=rabbitmq                     # Messaging system
RETAIL_ORDERS_MESSAGING_RABBITMQ_ADDRESSES=rabbitmq:5672     # RabbitMQ connection
```

**API Endpoints:**
- `GET /orders` - List all orders
- `GET /orders/{customerId}` - Get customer orders
- `POST /orders` - Create new order
- `GET /orders/{orderId}` - Get order details
- `PUT /orders/{orderId}/status` - Update order status

**Database Schema:**
```sql
-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    customer_id VARCHAR(50),
    order_date TIMESTAMP,
    total_amount DECIMAL(10,2),
    status VARCHAR(20),
    shipping_address TEXT
);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    product_id VARCHAR(40),
    quantity INT,
    unit_price DECIMAL(10,2)
);
```

---

### 5. **Checkout Service** - Payment Processing
**Technology**: Node.js (Express)  
**Database**: Redis  
**Port**: 8080  
**Purpose**: Handles checkout process and payment

**Key Features:**
- **Checkout Sessions**: Temporary checkout data storage
- **Payment Processing**: Credit card and payment gateway integration
- **Shipping Options**: Calculate shipping costs and methods
- **Order Validation**: Verify cart contents before payment
- **Session Management**: Secure checkout flow

**Configuration:**
```bash
RETAIL_CHECKOUT_PERSISTENCE_PROVIDER=redis              # Cache type
RETAIL_CHECKOUT_PERSISTENCE_REDIS_URL=redis://redis:6379 # Redis connection
RETAIL_CHECKOUT_ENDPOINTS_ORDERS=http://orders:80       # Orders service URL
RETAIL_CHECKOUT_SHIPPING_NAME_PREFIX=Standard           # Shipping prefix
```

**API Endpoints:**
- `POST /checkout` - Start checkout process
- `GET /checkout/{sessionId}` - Get checkout session
- `PUT /checkout/{sessionId}` - Update checkout data
- `POST /checkout/{sessionId}/payment` - Process payment
- `GET /checkout/shipping-options` - Get shipping methods

**Redis Data Structure:**
```json
{
  "sessionId": "checkout_12345",
  "customerId": "customer_67890",
  "items": [
    {
      "productId": "prod_001",
      "quantity": 2,
      "price": 29.99
    }
  ],
  "shippingAddress": {...},
  "paymentMethod": {...},
  "total": 59.98,
  "expires": "2024-01-01T12:00:00Z"
}
```

---

## Additional Components

### **Load Generator** - Performance Testing
**Technology**: Artillery.js  
**Purpose**: Generate synthetic traffic for testing

**Features:**
- **Realistic Traffic**: Simulates real user behavior
- **Scalable Load**: Configurable user count and duration
- **Multiple Scenarios**: Browse, add to cart, checkout flows
- **Kubernetes Ready**: Can run as pods in cluster

**Usage:**
```bash
# Local testing
bash scripts/run.sh --help

# Kubernetes deployment
kubectl apply -f load-generator-pod.yaml
```

---

## Service Communication Flow

### **1. Browse Products**
```
User → UI Service → Catalog Service → MySQL
                 ← Product Data    ←
     ← Web Page ←
```

### **2. Add to Cart**
```
User → UI Service → Cart Service → DynamoDB
                 ← Cart Updated ←
     ← Updated UI ←
```

### **3. Place Order**
```
User → UI Service → Checkout Service → Redis (session)
                 → Orders Service → PostgreSQL (order)
                                 → RabbitMQ (events)
     ← Order Confirmation ←
```

### **4. Order Processing**
```
RabbitMQ → Order Processing Workers
        → Inventory Updates
        → Shipping Notifications
        → Email Confirmations
```

## Development & Testing Features

### **Chaos Engineering Endpoints**
All services include chaos testing endpoints:

```bash
# Simulate failures
POST /chaos/status/500        # Return HTTP 500 errors
POST /chaos/latency/2000      # Add 2-second delay
POST /chaos/health            # Fail health checks

# Reset to normal
DELETE /chaos/status          # Remove error simulation
DELETE /chaos/latency         # Remove delay
DELETE /chaos/health          # Restore health checks
```

### **Local Development**
Each service can run independently:

```bash
# Catalog Service
cd catalog && go run main.go

# Cart Service  
cd cart && ./mvnw spring-boot:run

# Orders Service
cd orders && ./mvnw spring-boot:run

# Checkout Service
cd checkout && npm start

# UI Service
cd ui && ./mvnw spring-boot:run
```

### **Docker Compose**
Each service includes `docker-compose.yml` for local testing:

```bash
# Run service with dependencies
docker compose up

# Test the service
curl http://localhost:8080

# Clean up
docker compose down
```

## Technology Stack Summary

| Service | Language | Framework | Database | Port |
|---------|----------|-----------|----------|------|
| **UI** | Java | Spring Boot | None | 8080 |
| **Catalog** | Go | Gin/Native | MySQL | 8080 |
| **Cart** | Java | Spring Boot | DynamoDB | 8080 |
| **Orders** | Java | Spring Boot | PostgreSQL | 8080 |
| **Checkout** | Node.js | Express | Redis | 8080 |

## Key Benefits of This Architecture

### **1. Technology Diversity**
- **Polyglot**: Different languages for different needs
- **Database Choice**: Right database for each use case
- **Framework Flexibility**: Best tools for each service

### **2. Scalability**
- **Independent Scaling**: Scale services based on demand
- **Resource Optimization**: Different resource needs per service
- **Performance Tuning**: Optimize each service individually

### **3. Resilience**
- **Fault Isolation**: One service failure doesn't break everything
- **Circuit Breakers**: Prevent cascade failures
- **Graceful Degradation**: UI can work with some services down

### **4. Development Velocity**
- **Team Independence**: Different teams can work on different services
- **Technology Choice**: Teams can choose best tools
- **Deployment Independence**: Deploy services separately

This microservices architecture provides a realistic, production-ready e-commerce platform that demonstrates modern cloud-native development practices and patterns.
