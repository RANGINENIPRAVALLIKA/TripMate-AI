# ==============================================================================
# TripMate AI — Production Multi-Stage Dockerfile for Render Deployment
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Stage (Maven + Java 21)
# ------------------------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Cache dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source tree and compile production JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Stage 2: Runtime Stage (Eclipse Temurin JRE 21 on Ubuntu Jammy)
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Create unprivileged system group and user for security
RUN groupadd -r spring && useradd -r -g spring spring

# Copy executable Spring Boot JAR from the build stage
COPY --from=builder /app/target/tripmate-ai-backend-0.0.1-SNAPSHOT.jar app.jar

# Set correct permissions
RUN chown -R spring:spring /app

USER spring:spring

# Render binds to the dynamic PORT environment variable (default: 8080)
ENV PORT=8080
EXPOSE 8080

# Production-tuned container JVM parameters:
# - UseContainerSupport: respects cgroup CPU & memory limits
# - MaxRAMPercentage=75.0: allocates up to 75% container RAM to JVM heap
# - java.security.egd: non-blocking entropy source for cryptographic operations
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
