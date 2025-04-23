#syntax=docker/dockerfile:1.4

# Build stage
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
COPY --link pom.xml .classpath ./
# Needs its own copy statement
COPY --link src/ src/
RUN mvn package

# Server stage
FROM tomcat:11.0.6-jre21-temurin-noble
# War files
COPY --link --from=build /target/*.war /usr/local/tomcat/webapps/
