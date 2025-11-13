#syntax=docker/dockerfile:1.4

# Build stage
FROM maven:3.9.11-eclipse-temurin-25-alpine AS build
# Cache dependencies
COPY --link pom.xml .classpath ./
RUN --mount=type=cache,target=/root/.m2 mvn dependency:go-offline -B -q
# Build source
COPY --link src/ src/
RUN --mount=type=cache,target=/root/.m2 mvn clean package -B

# Server stage
FROM tomcat:11.0.14-jre25-temurin-noble
# War files
COPY --link --from=build /target/*.war /usr/local/tomcat/webapps/
