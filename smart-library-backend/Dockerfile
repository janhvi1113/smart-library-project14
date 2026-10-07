FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY . .

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

CMD ["sh", "-c", "java -jar target/smart-library-backend-0.0.1-SNAPSHOT.jar"]
