# Build stage
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn package -DskipTests -B

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy built JAR and entrypoint
COPY --from=build /app/target/crm-backend-1.0.0.jar app.jar
COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV SPRING_PROFILES_ACTIVE=pg
EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
