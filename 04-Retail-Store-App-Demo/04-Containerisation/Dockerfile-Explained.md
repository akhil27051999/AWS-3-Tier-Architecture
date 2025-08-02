# Cart Service -Dockerfile

This service provides an API for storing customer shopping carts. Data is stored in Amazon DynamoDB.

#### GitHub: https://github.com/akhil27051999/retail-store-sample-app/src/cart/Dockerfile


### Dockerfile Explaination

🔧 Stage 1: Build Stage

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

---


# Catalog Service - Dockerfile

This service provides an API for retrieving product catalog information. Data is stored in a MySQL database.

## 📦 Dockerfile Structure Overview

This Dockerfile uses **two stages**:

1. **Build Stage**: Compiles the Go binary using Golang and Git.
2. **Final Stage**: Runs the binary inside a stripped-down Amazon Linux environment as a non-root user.

---

## 🔨 Stage 1: Build Stage

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
