# Lexit build stage
FROM maven:3.9.9-eclipse-temurin-11-alpine AS lexit-build
COPY --link pom.xml .classpath ./
# Needs its own copy statement
COPY --link src/ src/
RUN mvn package

# Server stage
FROM tomcat:10.1.33-jre11-temurin-noble
# War files
COPY --link --from=lexit-build /target/lexit2.war /usr/local/tomcat/webapps/
