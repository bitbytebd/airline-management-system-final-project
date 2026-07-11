# Setup Guide

This guide uses Windows-friendly commands and keeps private configuration local.

## 1. Database

Open MySQL and create the database:

```sql
CREATE DATABASE airway;
```

Import the schema-only file:

```powershell
mysql -u your_mysql_username -p airway < database\schema.sql
```

Do not import or commit private full-data dumps unless you have reviewed and sanitized them.

## 2. Backend Configuration

Copy the backend template:

```powershell
Copy-Item backend\airline\src\main\resources\application.properties.example backend\airline\src\main\resources\application.properties
```

Set local values in `application.properties` or through environment variables:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
app.jwt.secret=${JWT_SECRET}
app.cors.allowed-origin=${CORS_ALLOWED_ORIGIN}
```

Required minimum values:

```text
DB_URL=jdbc:mysql://localhost:3306/airway?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
JWT_SECRET=change_me_to_a_long_random_secret
CORS_ALLOWED_ORIGIN=http://localhost:4200
```

## 3. Run Backend

```powershell
cd backend\airline
.\mvnw.cmd spring-boot:run
```

Backend default URL:

```text
http://localhost:8080
```

## 4. Frontend Configuration

The Angular app is in:

```text
frontend\aircrat-management1
```

The environment files include a placeholder Google Maps API key. Do not commit real API keys.

## 5. Run Frontend

```powershell
cd frontend\aircrat-management1
npm install
npm start
```

Frontend default URL:

```text
http://localhost:4200
```

## 6. Build Commands

Frontend production build:

```powershell
cd frontend\aircrat-management1
npm run build
```

Backend test/package:

```powershell
cd backend\airline
.\mvnw.cmd test
.\mvnw.cmd package
```

## 7. Troubleshooting

Port `8080` already in use:

Stop the old Java process or change `server.port` in your local-only backend configuration.

Port `4200` already in use:

Run Angular on another port:

```powershell
npx ng serve --port 4201
```

MySQL not running:

Start MySQL and confirm the `airway` database exists.

Java version error:

Use Java 17. Spring Boot dependencies in this project require a modern JDK.

Frontend dependency issues:

Use the committed `package-lock.json` and run `npm install` without upgrading major versions.
