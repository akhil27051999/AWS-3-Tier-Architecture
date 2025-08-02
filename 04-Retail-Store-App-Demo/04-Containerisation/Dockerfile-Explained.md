# Cart Service -Dockerfile

| Language | Persistence     |
| -------- | --------------- |
| Java     | Amazon DynamoDB |

This service provides an API for storing customer shopping carts. Data is stored in Amazon DynamoDB.

#### GitHub: https://github.com/akhil27051999/retail-store-sample-app/src/cart/Dockerfile


### Dockerfile Explaination

🔧 Stage 1: Build Stage
dockerfile
Copy
Edit
FROM public.ecr.aws/amazonlinux/amazonlinux:2023 as build-env
Uses Amazon Linux 2023 base image for building the app.

Labels this stage as build-env.

dockerfile
Copy
Edit
RUN dnf --setopt=install_weak_deps=False install -q -y \
    maven \
    java-21-amazon-corretto-headless \
    which \
    tar \
    gzip \
    && dnf clean all
Installs only essential build tools:

maven: for building Java projects.

java-21-amazon-corretto-headless: Amazon’s Java 21 distribution.

Other utilities (tar, gzip, etc.).

Skips installing weak dependencies to keep the image lean.

Cleans up package cache to reduce image size.

dockerfile
Copy
Edit
ARG JAR_PATH
Allows a JAR_PATH argument to be passed during build (although it's not used directly here).

dockerfile
Copy
Edit
VOLUME /tmp
WORKDIR /
Defines /tmp as a volume (Spring Boot uses it for temp files).

Sets working directory to root (/).

dockerfile
Copy
Edit
COPY .mvn .mvn
COPY mvnw .
COPY pom.xml .
Copies Maven wrapper files and pom.xml (needed for dependency resolution).

dockerfile
Copy
Edit
RUN ./mvnw dependency:go-offline -B -q
Pre-downloads all Maven dependencies in offline mode to speed up future builds.

dockerfile
Copy
Edit
COPY ./src ./src
Copies application source code.

dockerfile
Copy
Edit
RUN ./mvnw -DskipTests package -q && \
    mv /target/carts-0.0.1-SNAPSHOT.jar /app.jar
Compiles and packages the app into a JAR file, skipping tests.

Moves the JAR to /app.jar.

📦 Stage 2: Package Stage (Runtime Image)
dockerfile
Copy
Edit
FROM public.ecr.aws/amazonlinux/amazonlinux:2023
Starts a new Amazon Linux 2023 base image (clean, no build tools).

dockerfile
Copy
Edit
RUN dnf --setopt=install_weak_deps=False install -q -y \
    java-21-amazon-corretto-headless \
    shadow-utils \
    && dnf clean all
Installs only Java runtime and user/group management tools (shadow-utils).

Minimal runtime environment.

dockerfile
Copy
Edit
ENV APPUSER=appuser
ENV APPUID=1000
ENV APPGID=1000
Declares environment variables for creating a secure app user.

dockerfile
Copy
Edit
RUN useradd \
    --home "/app" \
    --create-home \
    --user-group \
    --uid "$APPUID" \
    "$APPUSER"
Creates a non-root user (appuser) with UID 1000.

dockerfile
Copy
Edit
ENV JAVA_TOOL_OPTIONS=
ENV SPRING_PROFILES_ACTIVE=prod
Environment variables to configure JVM and Spring Boot.

SPRING_PROFILES_ACTIVE=prod enables the production config.

dockerfile
Copy
Edit
WORKDIR /app
USER appuser
Switches to working directory /app.

Runs the rest of the container as the non-root appuser.

dockerfile
Copy
Edit
COPY ./ATTRIBUTION.md ./LICENSES.md
COPY --chown=appuser:appuser --from=build-env /app.jar .
Copies attribution/license files and the JAR file from build stage.

dockerfile
Copy
Edit
EXPOSE 8080
Documents that the app listens on port 8080 (Spring Boot default).

dockerfile
Copy
Edit
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]

- Runs the app using the Java command.
- Allows passing extra options via $JAVA_OPTS.

---

# Go Application Docker Image (Multi-Stage Build)

This Dockerfile builds and packages a **Go (Golang)** application using **Amazon Linux 2023** with a **multi-stage build**, ensuring a minimal, secure, and production-ready container.

---

## 🏗️ Build Overview

This Dockerfile consists of two stages:

---

## 🔧 Stage 1: Build Stage

**Base Image**: `public.ecr.aws/amazonlinux/amazonlinux:2023`
**Stage Alias**: `build-env`

### 📦 Installed Packages:
- `git`: Required by Go modules (if dependencies are from GitHub).
- `golang`: Go compiler and tooling.
- Skips weak dependencies to keep the image lean.

### 📁 Directory Setup:
```dockerfile
RUN mkdir -p "${GOPATH}/src" "${GOPATH}/bin" /appsrc
Prepares the Go environment directories and the working directory /appsrc.

📍 Build Context:
WORKDIR is set to /appsrc

GOPROXY is set to a public proxy to improve module resolution reliability:

env
Copy
Edit
ENV GOPROXY=https://goproxy.io,direct
🚀 Build Steps:
dockerfile
Copy
Edit
COPY go.mod go.sum ./
RUN go mod download
Downloads dependencies based on go.mod and go.sum.

dockerfile
Copy
Edit
COPY . .
RUN go build -o main main.go
Copies the rest of the source code and builds the binary named main.

📦 Stage 2: Final Runtime Stage
Base Image: public.ecr.aws/amazonlinux/amazonlinux:2023

🔐 Security Enhancements:
Uses shadow-utils to create a non-root user (appuser) with UID/GID = 1000.

Helps prevent privilege escalation vulnerabilities.

📁 Application Setup:
dockerfile
Copy
Edit
WORKDIR /app
USER appuser
All files are located in /app, and run as appuser.

dockerfile
Copy
Edit
COPY --chown=appuser:appuser --from=build-env /appsrc/main /app/
COPY ./ATTRIBUTION.md ./LICENSES.md
Copies the Go binary built in stage 1.

Also includes license/attribution files.

🌐 Environment Configuration:
dockerfile
Copy
Edit
ENV GIN_MODE=release
Assumes the application uses the Gin Web Framework.

Sets Gin to release mode for better performance and disabled debug logs.

🚀 Container Launch
The container starts by executing:

bash
Copy
Edit
/app/main
This binary is expected to be a self-contained Go web or CLI app.

🔧 Build and Run
🔨 Build:
bash
Copy
Edit
docker build -t go-app .
▶️ Run:
bash
Copy
Edit
docker run -p 8080:8080 go-app
Adjust the ports based on what your Go app listens on.

Project Files Included

- main.go: Entry point for your Go application.
- go.mod and go.sum: Module dependency definitions.
- ATTRIBUTION.md and LICENSES.md: Legal docs.
- Other Go source files in the root directory.

✅ Best Practices Followed
✅ Multi-stage builds for clean separation of build/runtime.

✅ Non-root user for runtime security.

✅ Minimal final image size (runtime only includes the compiled binary).

✅ Environment configured for production (GIN_MODE=release).

🧩 Notes
If you're not using the Gin framework, you can remove or update this line:

dockerfile
Copy
Edit
ENV GIN_MODE=release
vbnet
Copy
Edit

--- 
