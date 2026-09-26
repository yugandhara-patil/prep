# ==============================
# Stage 1: Build the application
# ==============================
FROM eclipse-temurin:21-jdk-jammy AS build

WORKDIR /app

# Copy Maven wrapper and project files
COPY . .

# Make Maven wrapper executable
RUN chmod +x mvnw

# Build Spring Boot application
RUN ./mvnw clean package -DskipTests


# ==============================
# Stage 2: Run the application
# ==============================
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Copy the generated JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Render will provide the PORT environment variable
EXPOSE 8081

# Start Spring Boot
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8081}"]