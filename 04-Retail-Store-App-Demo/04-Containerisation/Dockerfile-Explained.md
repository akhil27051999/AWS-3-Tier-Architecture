# Cart Service -Dockerfile

This service provides an API for storing customer shopping carts. Data is stored in Amazon DynamoDB.

#### GitHub:
https://github.com/akhil27051999/retail-store-sample-app/src/cart/Dockerfile

## Dockerfile Explaination

### 🔧 Stage 1: Build Stage

```dockerfile
FROM public.ecr.aws/amazonlinux/amazonlinux:2023 as build-env
```
- Uses Amazon Linux 2023 base image for building the app.
- Labels this stage as build-env.

```dockerfile
RUN dnf --setopt=install_weak_deps=False install -q -y \
    maven \
    java-21-amazon-corretto-headless \
    which \
    tar \
    gzip \
    && dnf clean all
```
**Installs only essential build tools:**
- maven: for building Java projects.
- java-21-amazon-corretto-headless: Amazon’s Java 21 distribution.
- Other utilities (tar, gzip, etc.).
- Skips installing weak dependencies to keep the image lean.
- Cleans up package cache to reduce image size.

```dockerfile
ARG JAR_PATH
```
- Allows a JAR_PATH argument to be passed during build (although it's not used directly here).

```dockerfile
VOLUME /tmp
WORKDIR /
```
- Defines /tmp as a volume (Spring Boot uses it for temp files).
- Sets working directory to root (/).

```dockerfile
COPY .mvn .mvn
COPY mvnw .
COPY pom.xml .
```
- Copies Maven wrapper files and pom.xml (needed for dependency resolution).

```dockerfile
RUN ./mvnw dependency:go-offline -B -q
```
- Pre-downloads all Maven dependencies in offline mode to speed up future builds.

```dockerfile
COPY ./src ./src
```
- Copies application source code.

```dockerfile
RUN ./mvnw -DskipTests package -q && \
    mv /target/carts-0.0.1-SNAPSHOT.jar /app.jar
```
- Compiles and packages the app into a JAR file, skipping tests.
- Moves the JAR to /app.jar.

### 📦 Stage 2: Package Stage (Runtime Image)

```dockerfile
FROM public.ecr.aws/amazonlinux/amazonlinux:2023
```
- Starts a new Amazon Linux 2023 base image (clean, no build tools).

```dockerfile
RUN dnf --setopt=install_weak_deps=False install -q -y \
    java-21-amazon-corretto-headless \
    shadow-utils \
    && dnf clean all
```
- Installs only Java runtime and user/group management tools (shadow-utils).
- Minimal runtime environment.

```dockerfile
ENV APPUSER=appuser
ENV APPUID=1000
ENV APPGID=1000
```
- Declares environment variables for creating a secure app user.

```dockerfile
RUN useradd \
    --home "/app" \
    --create-home \
    --user-group \
    --uid "$APPUID" \
    "$APPUSER"
```
- Creates a non-root user (appuser) with UID 1000.

```dockerfile
ENV JAVA_TOOL_OPTIONS=
ENV SPRING_PROFILES_ACTIVE=prod
```
- Environment variables to configure JVM and Spring Boot.
- SPRING_PROFILES_ACTIVE=prod enables the production config.

```dockerfile
WORKDIR /app
USER appuser
```
- Switches to working directory /app.
- Runs the rest of the container as the non-root appuser.

```dockerfile
COPY ./ATTRIBUTION.md ./LICENSES.md
COPY --chown=appuser:appuser --from=build-env /app.jar .
```
- Copies attribution/license files and the JAR file from build stage.

```dockerfile
EXPOSE 8080
```
- Documents that the app listens on port 8080 (Spring Boot default).

```dockerfile
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
```
- Runs the app using the Java command.
- Allows passing extra options via $JAVA_OPTS.



# Catalog Service - Dockerfile

This service provides an API for retrieving product catalog information. Data is stored in a MySQL database.

#### GitHub: https://github.com/akhil27051999/retail-store-sample-app/src/catalog/Dockerfile

## Dockerfile Explained

### 🔨 Stage 1: Build Stage

- Uses Amazon Linux 2023 as the base image for building:

```dockerfile
FROM public.ecr.aws/amazonlinux/amazonlinux:2023 AS build-env
```
- Aims to keep the build image lightweight by disabling weak dependencies:

```dockerfile
RUN dnf --setopt=install_weak_deps=False install -q -y \
    git \
    golang \
    && \
    dnf clean all
```
- Installs only the required packages: Golang for building Go code and Git for module fetching.

- Sets up Go workspace directories and working directory:
```dockerfile
RUN mkdir -p "${GOPATH}/src" "${GOPATH}/bin" /appsrc
WORKDIR /appsrc
```

- Configures Go module proxy to improve module resolution:
```dockerfile
ENV GOPROXY=https://goproxy.io,direct
```

- Copies Go modules and downloads dependencies:
```dockerfile
COPY go.mod go.sum ./
RUN go mod download
```

- Copies app code and builds the Go binary:
```dockerfile
COPY . .
RUN go build -o main main.go
```
### 🏃 Stage 2: Final Runtime Stage

- Starts a clean, minimal Amazon Linux 2023 image:
```dockerfile
FROM public.ecr.aws/amazonlinux/amazonlinux:2023
```

- Declares environment variables for creating a secure non-root user:
```dockerfile
ENV APPUSER=appuser
ENV APPUID=1000
ENV APPGID=1000
```
- Installs shadow-utils to enable user and group creation:
```dockerfile
RUN dnf --setopt=install_weak_deps=False install -q -y \
    shadow-utils \
    && \
    dnf clean all
```
- Creates a dedicated non-root user:
```dockerfile
RUN useradd \
    --home "/app" \
    --create-home \
    --user-group \
    --uid "$APPUID" \
    "$APPUSER"
```
-  Sets working directory and switches to appuser:
```dockerfile
WORKDIR /app
USER appuser
```
- Copies the built Go binary and license files into the final image:
```dockerfile
COPY --chown=appuser:appuser --from=build-env /appsrc/main /app/
COPY ./ATTRIBUTION.md ./LICENSES.md
```
-  Sets Gin framework to production mode (optional):
```dockerfile
ENV GIN_MODE=release
```
- Defines the entry point for the container:
```dockerfile
ENTRYPOINT ["/app/main"]
```


# Checkout Service - Dockerfile

This project uses a **multi-stage Docker build** to build and run a Node.js 20 application using a secure, minimal, and production-ready Amazon Linux 2023 runtime container.

#### GitHub: https://github.com/akhil27051999/retail-store-sample-app/src/Checkout/Dockerfile

## Dockerfile Explained

### 🔨 Stage 1: Build Stage

- Uses Node.js 20 Alpine image as the base for building:
  - A small and fast image for installing dependencies and building the app.


```dockerfile
FROM node:20-alpine AS build
```

- Sets up working directory:
```dockerfile
WORKDIR /usr/src/app
```

- Copies dependency and source files with proper ownership:
  - Ensures that the node user owns the project files, improving security and compatibility.

```dockerfile
COPY --chown=node:node package*.json ./
COPY --chown=node:node . .
```

- Installs dependencies with Yarn (lockfile respected):
  - Ensures reproducible builds by using the lockfile.

```dockerfile
RUN yarn install --frozen-lockfile
```

- Builds the application:
  - Builds the production-ready files (typically compiles TypeScript, bundles assets, etc.).

```dockerfile
RUN yarn build
```

- Switches to non-root node user:
```dockerfile
USER node
```

### 🏃 Stage 2: Final Runtime Stage

- Starts with Amazon Linux 2023 for a stable runtime environment:
```dockerfile
FROM public.ecr.aws/amazonlinux/amazonlinux:2023
```

-  Installs Node.js 20 and essential packages:

```dockerfile
RUN dnf --setopt=install_weak_deps=False install -q -y \
    nodejs20 \
    shadow-utils \
    && \
    dnf clean all
```

- Registers Node.js 20 as the system's default:
  - Ensures the node command points to Node.js 20.

```dockerfile
RUN alternatives --install /usr/bin/node node /usr/bin/node-20 90
```

- Declares environment variables for user creation:
```dockerfile
ENV APPUSER=appuser
ENV APPUID=1000
ENV APPGID=1000
```
- Creates a dedicated non-root user:
  - Improves container security by avoiding running as root.

```dockerfile
RUN useradd \
    --home "/app" \
    --create-home \
    --user-group \
    --uid "$APPUID" \
    "$APPUSER"
```

- Sets working directory and switches to the app user:
```dockerfile
WORKDIR /app
USER appuser
```
- Copies built assets and dependencies from the build stage:
  - Only production-ready files and modules are moved to the final image.

```dockerfile
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
```

- Defines the entry point of the application:
  - Starts the application from the built JS file.

```dockerfile
ENTRYPOINT [ "node", "dist/main.js" ]
```



# Orders Service - Dockerfile
- This service provides an API for storing orders. Data is stored in MySQL.

#### GitHub: https://github.com/akhil27051999/retail-store-sample-app/src/orders/Dockerfile

## Dockerfile Explained

### 🔨 Stage 1: Build Stage

```dockerfile
FROM public.ecr.aws/amazonlinux/amazonlinux:2023 as build-env
```
- Installs necessary tools for building:
  - Installs Maven, Amazon Corretto 21, and other essential utilities, while avoiding unnecessary packages.

```dockerfile
RUN dnf --setopt=install_weak_deps=False install -q -y \
    maven \
    java-21-amazon-corretto-headless \
    which \
    tar \
    gzip \
    && dnf clean all
```

- Prepares project for offline build:
  - This ensures all Maven dependencies are cached before copying source files — a best practice to optimize Docker caching.

```dockerfile
COPY .mvn .mvn
COPY mvnw .
COPY pom.xml .
RUN ./mvnw dependency:go-offline -B -q
```

- Adds source and compiles the project:
  - Builds the Spring Boot JAR while skipping tests to speed up the build.

```dockerfile

COPY ./src ./src
RUN ./mvnw -DskipTests package -q
```

- Moves the final artifact:
  The compiled application is now ready for the final image.

```dockerfile

mv /target/orders-0.0.1-SNAPSHOT.jar /app.jar
```

### 📦 Stage 2: Package (Runtime) Stage
```dockerfile
FROM public.ecr.aws/amazonlinux/amazonlinux:2023
```
- Installs Java 21 and creates non-root user:
```dockerfile

RUN dnf --setopt=install_weak_deps=False install -q -y \
    java-21-amazon-corretto-headless \
    shadow-utils \
    && dnf clean all
```
- Swaps curl-minimal with full version (for telnet/diagnostics if needed):
```dockerfile

RUN dnf -q -y swap libcurl-minimal libcurl-full \
    && dnf -q -y swap curl-minimal curl-full
```
- Configures non-root runtime environment:
```dockerfile

ENV APPUSER=appuser
ENV APPUID=1000
ENV APPGID=1000

RUN useradd --home "/app" --create-home --user-group \
    --uid "$APPUID" "$APPUSER"
```
- Sets environment and permissions:
```dockerfile

ENV JAVA_TOOL_OPTIONS=
ENV SPRING_PROFILES_ACTIVE=prod

WORKDIR /app
USER appuser
```
- Adds license info and app JAR:
```dockerfile

COPY ./ATTRIBUTION.md ./LICENSES.md
COPY --chown=appuser:appuser --from=build-env /app.jar .
```
- Exposes port and starts the Spring Boot app:
```dockerfile

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
```


# UI Service - Dockerfile
- This service provides the frontend for the retail store, serving the HTML UI and aggregating calls to the backend API components.

#### GitHub: https://github.com/akhil27051999/retail-store-sample-app/src/ui/Dockerfile

## Dockerfile Explained

### 🔨 Stage 1: Build Environment

```dockerfile
FROM public.ecr.aws/amazonlinux/amazonlinux:2023 AS build-env
```
-  Install minimal required packages:
  - Uses --setopt=install_weak_deps=False to minimize image size.
  - Installs Maven, Java 21, and essential tools.


```dockerfile

RUN dnf --setopt=install_weak_deps=False install -q -y \
    maven \
    java-21-amazon-corretto-headless \
    which \
    tar \
    gzip \
    && dnf clean all
```


- Copy and prepare Maven build:
  - Prepares Maven dependencies offline to optimize caching and avoid rebuilding unchanged dependencies.

```dockerfile

COPY .mvn .mvn
COPY mvnw .
COPY pom.xml .
RUN ./mvnw dependency:go-offline -B -q
```

- Copy source and build application:
  - Builds the Spring Boot application.
  - Skips tests for faster builds.
  - Outputs a JAR file named ui-0.0.1-SNAPSHOT.jar.

```dockerfile

COPY ./src ./src
RUN ./mvnw -DskipTests package -q && \
    mv /target/ui-0.0.1-SNAPSHOT.jar /app.jar

```


### 📦 Stage 2: Runtime Environment
```dockerfile

FROM public.ecr.aws/amazonlinux/amazonlinux:2023
```
- Install only runtime dependencies:
  - Keeps runtime lightweight and minimal.

```dockerfile

RUN dnf --setopt=install_weak_deps=False install -q -y \
    java-21-amazon-corretto-headless \
    shadow-utils \
    && dnf clean all
```

- Swap full cURL:
  - Required if you use telnet:// in health checks or diagnostics.

```dockerfile

RUN dnf -q -y swap libcurl-minimal libcurl-full \
    && dnf -q -y swap curl-minimal curl-full

```

- Create non-root user:
  - Enhances security by running the app as a non-root user.

```dockerfile

ENV APPUSER=appuser
ENV APPUID=1000
ENV APPGID=1000
RUN useradd --home "/app" --create-home --user-group \
    --uid "$APPUID" "$APPUSER"
```

- Configure environment:
  - Accepts JVM flags via JAVA_OPTS.

```dockerfile

ENV JAVA_TOOL_OPTIONS=
ENV SPRING_PROFILES_ACTIVE=prod
Enables production profile by default.

```

- Copy final JAR and attribution files:
```dockerfile

WORKDIR /app
USER appuser
COPY ./ATTRIBUTION.md ./LICENSES.md
COPY --chown=appuser:appuser --from=build-env /app.jar .
```

- Application startup:
```dockerfile

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
```
