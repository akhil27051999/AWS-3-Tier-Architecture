 
# AWS Containers Retail Sample - Cart Service

| Language | Persistence     |
| -------- | --------------- |
| Java     | Amazon DynamoDB |

This service provides an API for storing customer shopping carts. Data is stored in Amazon DynamoDB.

**Application-Code:**
https://github.com/akhil27051999/retail-store-sample-app/src/cart

## Configuration

The following environment variables are available for configuring the service:

| Name                                            | Description                                                        | Default     |
| ----------------------------------------------- | ------------------------------------------------------------------ | ----------- |
| `PORT`                                          | The port which the server will listen on                           | `8080`      |
| `RETAIL_CART_PERSISTENCE_PROVIDER`              | The persistence provider to use, can be `in-memory` or `dynamodb`. | `in-memory` |
| `RETAIL_CART_PERSISTENCE_DYNAMODB_TABLE_NAME`   | The name of the Amazon DynamoDB table used for persistence         | `Items`     |
| `RETAIL_CART_PERSISTENCE_DYNAMODB_ENDPOINT`     | The Amazon DynamoDB endpoint to use                                | `""`        |
| `RETAIL_CART_PERSISTENCE_DYNAMODB_CREATE_TABLE` | Enable to automatically create the Amazon DynamoDB table required  | `false`     |

## Endpoints

Several "utility" endpoints are provided with useful functionality for various scenarios:

| Method   | Name                     | Description                                                                        |
| -------- | ------------------------ | ---------------------------------------------------------------------------------- |
| `POST`   | `/chaos/status/{code}`   | All HTTP requests to API paths will return the given HTTP status code              |
| `DELETE` | `/chaos/status`          | Disables the HTTP status response above                                            |
| `POST`   | `/chaos/latency/{delay}` | All HTTP requests to API paths will have the specified delay added in milliseconds |
| `DELETE` | `/chaos/latency`         | Disables the HTTP response latency above                                           |
| `POST`   | `/chaos/health`          | Causes all health check requests to fail                                           |
| `DELETE` | `/chaos/health`          | Returns the health check to its default behavior                                   |

## Running

There are two main options for running the service:

### Local

Pre-requisites:

- Java 21 installed

Run the Spring Boot application like so:

```
./mvnw spring-boot:run
```

Test the application by visiting `http://localhost:8080` in a web browser.

### Docker

A `docker-compose.yml` file is included to run the service in Docker:

```
docker compose up
```

Test the application by visiting `http://localhost:8080` in a web browser.

To clean up:

```
docker compose down
```

---

# AWS Containers Retail Sample - Catalog Service

| Language | Persistence |
| -------- | ----------- |
| Go       | MySQL       |

This service provides an API for retrieving product catalog information. Data is stored in a MySQL database.

**Application-Code:**
https://github.com/akhil27051999/retail-store-sample-app/src/catalog

## Configuration

The following environment variables are available for configuring the service:

| Name                                       | Description                                                     | Default        |
| ------------------------------------------ | --------------------------------------------------------------- | -------------- |
| PORT                                       | The port which the server will listen on                        | `8080`         |
| RETAIL_CATALOG_PERSISTENCE_PROVIDER        | The persistence provider to use, can be `in-memory` or `mysql`. | `in-memory`    |
| RETAIL_CATALOG_PERSISTENCE_ENDPOINT        | Database endpoint URL                                           | `""`           |
| RETAIL_CATALOG_PERSISTENCE_DB_NAME         | Database name                                                   | `catalogdb`    |
| RETAIL_CATALOG_PERSISTENCE_USER            | Database user                                                   | `catalog_user` |
| RETAIL_CATALOG_PERSISTENCE_PASSWORD        | Database password                                               | `""`           |
| RETAIL_CATALOG_PERSISTENCE_CONNECT_TIMEOUT | Database connection timeout in seconds                          | `5`            |

## Endpoints

Several "utility" endpoints are provided with useful functionality for various scenarios:

| Method   | Name                     | Description                                                                        |
| -------- | ------------------------ | ---------------------------------------------------------------------------------- |
| `POST`   | `/chaos/status/{code}`   | All HTTP requests to API paths will return the given HTTP status code              |
| `DELETE` | `/chaos/status`          | Disables the HTTP status response above                                            |
| `POST`   | `/chaos/latency/{delay}` | All HTTP requests to API paths will have the specified delay added in milliseconds |
| `DELETE` | `/chaos/latency`         | Disables the HTTP response latency above                                           |
| `POST`   | `/chaos/health`          | Causes all health check requests to fail                                           |
| `DELETE` | `/chaos/health`          | Returns the health check to its default behavior                                   |

## Running

There are two main options for running the service:

### Local

Note: You must already have a MySQL database running

Build the binary as follows:

```
go build -o main main.go
```

Then run it:

```
./main
```

Test access:

```
curl localhost:8080/catalogue
```

### Docker

A `docker-compose.yml` file is included to run the service in Docker, including a MySQL database:

```
DB_PASSWORD="testing" docker compose up
```

Test access:

```
curl localhost:8080/catalogue
```

To clean up:

```
docker compose down
```
---

# AWS Containers Retail Sample - Checkout Service

| Language | Persistence |
| -------- | ----------- |
| Node     | Redis       |

This service provides an API for storing customer data during the checkout process. Data is stored in Redis.

## Configuration

The following environment variables are available for configuring the service:

| Name                                    | Description                                                              | Default     |
| --------------------------------------- | ------------------------------------------------------------------------ | ----------- |
| `PORT`                                  | The port which the server will listen on                                 | `8080`      |
| `RETAIL_CHECKOUT_PERSISTENCE_PROVIDER`  | The persistence provider to use, can be `in-memory` or `redis`.          | `in-memory` |
| `RETAIL_CHECKOUT_PERSISTENCE_REDIS_URL` | The endpoint of the Redis server used to store state.                    | `""`        |
| `RETAIL_CHECKOUT_ENDPOINTS_ORDERS`      | The endpoint of the orders API. If empty uses a mock implementation      | `""`        |
| `RETAIL_CHECKOUT_SHIPPING_NAME_PREFIX`  | A string prefix that can be applied to the names of the shipping options | `""`        |

## Endpoints

Several "utility" endpoints are provided with useful functionality for various scenarios:

| Method   | Name                     | Description                                                                        |
| -------- | ------------------------ | ---------------------------------------------------------------------------------- |
| `POST`   | `/chaos/status/{code}`   | All HTTP requests to API paths will return the given HTTP status code              |
| `DELETE` | `/chaos/status`          | Disables the HTTP status response above                                            |
| `POST`   | `/chaos/latency/{delay}` | All HTTP requests to API paths will have the specified delay added in milliseconds |
| `DELETE` | `/chaos/latency`         | Disables the HTTP response latency above                                           |
| `POST`   | `/chaos/health`          | Causes all health check requests to fail                                           |
| `DELETE` | `/chaos/health`          | Returns the health check to its default behavior                                   |

## Running

There are two main options for running the service:

### Local

Pre-requisites:

- Node.JS >= 16 installed

Run the application like so:

```
yarn start
```

The API endpoint will be available at `http://localhost:8080`.

### Docker

A `docker-compose.yml` file is included to run the service in Docker:

```
docker compose up
```

The API endpoint will be available at `http://localhost:8080`.

To clean up:

```
docker compose down
```
---

# AWS Containers Retail Sample - Orders Service

| Language | Persistence |
| -------- | ----------- |
| Java     | MySQL       |

This service provides an API for storing orders. Data is stored in MySQL.

**Application-Code:**
https://github.com/akhil27051999/retail-store-sample-app/src/orders

## Configuration

The following environment variables are available for configuring the service:

| Name                                          | Description                                                                             | Default       |
| --------------------------------------------- | --------------------------------------------------------------------------------------- | ------------- |
| `PORT`                                        | The port which the server will listen on                                                | `8080`        |
| `RETAIL_CHECKOUT_PERSISTENCE_PROVIDER`        | The persistence provider to use, can be `in-memory` or `postgres`.                      | `in-memory`   |
| `RETAIL_ORDERS_PERSISTENCE_POSTGRES_ENDPOINT` | The postgres database endpoint.                                                         | `""`          |
| `RETAIL_ORDERS_PERSISTENCE_POSTGRES_NAME`     | The postgres database name                                                              | `""`          |
| `RETAIL_ORDERS_PERSISTENCE_POSTGRES_USERNAME` | Username to authenticate with postgres database.                                        | `""`          |
| `RETAIL_ORDERS_PERSISTENCE_POSTGRES_PASSWORD` | Password to authenticate with postgres database.                                        | `""`          |
| `RETAIL_ORDERS_MESSAGING_PROVIDER`            | The messaging provider to use to publish events. Can be `in-memory`, `sqs`, `rabbitmq`. | `"in-memory"` |
| `RETAIL_ORDERS_MESSAGING_SQS_TOPIC`           | The name of the SQS topic to publish events to (SQS messaging provider)                 | `""`          |
| `RETAIL_ORDERS_MESSAGING_RABBITMQ_ADDRESSES`  | Endpoints for RabbitMQ messaging provider, format `host:port`                           | `""`          |
| `RETAIL_ORDERS_MESSAGING_RABBITMQ_USERNAME`   | Username for RabbitMQ messaging provider                                                | `""`          |
| `RETAIL_ORDERS_MESSAGING_RABBITMQ_PASSWORD`   | Password for RabbitMQ messaging provider                                                | `""`          |

## Endpoints

Several "utility" endpoints are provided with useful functionality for various scenarios:

| Method   | Name                     | Description                                                                        |
| -------- | ------------------------ | ---------------------------------------------------------------------------------- |
| `POST`   | `/chaos/status/{code}`   | All HTTP requests to API paths will return the given HTTP status code              |
| `DELETE` | `/chaos/status`          | Disables the HTTP status response above                                            |
| `POST`   | `/chaos/latency/{delay}` | All HTTP requests to API paths will have the specified delay added in milliseconds |
| `DELETE` | `/chaos/latency`         | Disables the HTTP response latency above                                           |
| `POST`   | `/chaos/health`          | Causes all health check requests to fail                                           |
| `DELETE` | `/chaos/health`          | Returns the health check to its default behavior                                   |

## Running

There are two main options for running the service:

### Local

Pre-requisites:

- Java 21 installed

Run the Spring Boot application like so:

```
./mvnw spring-boot:run
```

Test access:

```
curl localhost:8080/orders
```

### Docker

A `docker-compose.yml` file is included to run the service in Docker:

```
docker compose up
```

Test the application by visiting `http://localhost:8080` in a web browser.

To clean up:

```
docker compose down
```
---

# AWS Containers Retail Sample - UI Service

| Language | Persistence |
| -------- | ----------- |
| Java     | N/A         |

This service provides the frontend for the retail store, serving the HTML UI and aggregating calls to the backend API components.

**Application-Code:**
https://github.com/akhil27051999/retail-store-sample-app/src/ui

## Configuration

The following environment variables are available for configuring the service:

| Name                              | Description                                                                                            | Default                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------- |
| `PORT`                            | The port which the server will listen on                                                               | `8080`                  |
| `RETAIL_UI_THEME`                 | Name of the theme for the UI, valid values are `default`, `green`, `orange`                            | `"default"`             |
| `RETAIL_UI_DISABLE_DEMO_WARNINGS` | Disable the UI messages warning about demonstration content                                            | `false`                 |
| `RETAIL_UI_PRODUCT_IMAGES_PATH`   | Overrides the location where the sample product images are sourced from to use the specified file path | ``                      |
| `RETAIL_UI_ENDPOINTS_CATALOG`     | The endpoint of the catalog API. If set to `false` uses a mock implementation                          | `false`                 |
| `RETAIL_UI_ENDPOINTS_CARTS`       | The endpoint of the carts API. If set to `false` uses a mock implementation                            | `false`                 |
| `RETAIL_UI_ENDPOINTS_ORDERS`      | The endpoint of the orders API. If set to `false` uses a mock implementation                           | `false`                 |
| `RETAIL_UI_ENDPOINTS_CHECKOUT`    | The endpoint of the checkout API. If set to `false` uses a mock implementation                         | `false`                 |
| `RETAIL_UI_CHAT_ENABLED`          | Enable the chat bot UI                                                                                 | `false`                 |
| `RETAIL_UI_CHAT_PROVIDER`         | The chat provider to use, value values are `bedrock`, `openai`, `mock`                                 | `""`                    |
| `RETAIL_UI_CHAT_MODEL`            | The chat model to use, depends on the provider.                                                        | `""`                    |
| `RETAIL_UI_CHAT_TEMPERATURE`      | Model temperature                                                                                      | `0.6`                   |
| `RETAIL_UI_CHAT_MAX_TOKENS`       | Model maximum response tokens                                                                          | `300`                   |
| `RETAIL_UI_CHAT_PROMPT`           | Model system prompt                                                                                    | `(see source)`          |
| `RETAIL_UI_CHAT_BEDROCK_REGION`   | Amazon Bedrock region                                                                                  | `""`                    |
| `RETAIL_UI_CHAT_OPENAI_BASE_URL`  | Base URL for OpenAI endpoint                                                                           | `http://localhost:8888` |
| `RETAIL_UI_CHAT_OPENAI_API_KEY`   | API key for OpenAI endpoint                                                                            | `""`                    |

## Endpoints

Several "utility" endpoints are provided with useful functionality for various scenarios:

| Method | Name                           | Description                                                                 |
| ------ | ------------------------------ | --------------------------------------------------------------------------- |
| `GET`  | `/utility/status/{code}`       | Returns HTTP response with given HTTP status code                           |
| `GET`  | `/utility/headers`             | Print the HTTP headers of the inbound request                               |
| `GET`  | `/utility/panic`               | Shutdown the application with an error code                                 |
| `POST` | `/utility/echo`                | Write back the POST payload sent                                            |
| `POST` | `/utility/store`               | Write the payload to a file and return a hash                               |
| `GET`  | `/utility/store/{hash}`        | Return the payload from the file system previously written                  |
| `GET`  | `/utility/stress/{iterations}` | Stress the CPU with the number of iterations increasing the CPU consumption |

## Running

There are two main options for running the service:

### Local

Pre-requisites:

- Java 21 installed

Run the Spring Boot application like so:

```
./mvnw spring-boot:run
```

Test the application by visiting `http://localhost:8080` in a web browser.

### Docker

A `docker-compose.yml` file is included to run the service in Docker:

```
docker compose up
```

Test the application by visiting `http://localhost:8080` in a web browser.

To clean up:

```
docker compose down
```
---

# Retail Store Sample App - Load Generator

This is a utility component to generate synthetic load on the sample application, which is useful for scenarios such as autoscaling, observability and resiliency testing. It primarily consists of a set of scenarios for [Artillery](https://github.com/artilleryio/artillery), as well as scripts to help run it.

**Application-Code:**
https://github.com/akhil27051999/retail-store-sample-app/src/load-generator

## Usage

### Local

A convenience script is provided to make it easier to run the load generator on your local machine.

Run the following command for usage instructions:

```bash
bash scripts/run.sh --help
```

### Kubernetes

You can easily run the load generator as one or more Pods in a Kubernetes cluster. For example:

(Note: Update `http://ui.ui.svc` to reflect your namespace structure)

```bash
$ cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: load-generator
spec:
  containers:
  - name: artillery
    image: artilleryio/artillery:2.0.22
    args:
    - "run"
    - "-t"
    - "http://ui.ui.svc"
    - "/scripts/scenario.yml"
    volumeMounts:
    - name: scripts
      mountPath: /scripts
  initContainers:
  - name: setup
    image: public.ecr.aws/aws-containers/retail-store-sample-utils:load-gen.0.3.0
    command:
    - bash
    args:
    - -c
    - "cp /artillery/* /scripts"
    volumeMounts:
    - name: scripts
      mountPath: "/scripts"
  volumes:
  - name: scripts
    emptyDir: {}
EOF
```

Note: Ensure the image tag of `retail-store-sample-load-generator` matches the version of the application being targeted.

