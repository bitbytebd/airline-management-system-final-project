# Airline Management System

A full-stack airline operations and reservation management system built with Angular, Spring Boot REST APIs, and MySQL. The project is prepared for portfolio review, local demonstration, and future GitHub publishing with secrets and generated artifacts excluded.

## Key Features

- Role-based administration
- Airline management
- Aircraft management
- Flight management
- Passenger management
- Booking workflow
- Intelligent class-wise seat allocation
- Coupon validation
- Loyalty earning and redemption
- Baggage and special assistance
- Admin approval
- Payment workflow
- Voucher, invoice, and ticket generation
- Boarding pass
- Waitlist
- Flight tracking
- Expense management
- Reports and KPI dashboards
- OTP-based passenger portal

## Technology Stack

- Angular
- TypeScript
- HTML
- CSS
- Bootstrap
- Spring Boot
- Java 17
- REST API
- Spring Data JPA
- Spring Security
- JWT
- MySQL
- Maven
- Git and GitHub

## Repository Structure

```text
airline-management-system-final-project/
  frontend/
    aircrat-management1/
  backend/
    airline/
  database/
  docs/
    screenshots/
    api/
    architecture/
  README.md
  SETUP.md
  SECURITY.md
  .gitignore
  .gitattributes
```

## Prerequisites

- Node.js and npm compatible with Angular 13
- Angular CLI 13
- Java 17
- Maven or the included Maven wrapper
- MySQL 8.x
- Git

## Backend Setup

1. Copy:

```text
backend/airline/src/main/resources/application.properties.example
```

to:

```text
backend/airline/src/main/resources/application.properties
```

2. Configure local values with environment variables or local-only properties:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
CORS_ALLOWED_ORIGIN
SMTP_USERNAME
SMTP_PASSWORD
SMS_API_TOKEN
TRACKING_API_KEY
```

3. Run from `backend/airline`:

```bash
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

## Frontend Setup

From `frontend/aircrat-management1`:

```bash
npm install
npm start
```

The Angular environment files currently use a placeholder Google Maps API key. Keep real API keys out of Git.

## Database Setup

Create the database:

```sql
CREATE DATABASE airway;
```

Import the GitHub-safe schema:

```bash
mysql -u your_mysql_username -p airway < database/schema.sql
```

The original full data dump is excluded from Git because it contains exported records.

## Default Local URLs

- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:8080`
- MySQL database: `airway`

## Screenshots

Add portfolio screenshots under `docs/screenshots/`.

## Known Limitations

- Local configuration is required before running the backend.
- Demo payment, OTP, email, SMS, and tracking integrations require provider credentials outside Git.
- Production deployment hardening is outside the scope of this repository-preparation pass.

## Future Enhancements

- Add deployment-specific profiles and CI checks.
- Add safe fictional demo seed data.
- Add API documentation under `docs/api/`.
- Add architecture diagrams under `docs/architecture/`.

## Author

Mousumi Akter  
IsDB-BISEW IT Scholarship Programme  
Round 68  
Trainee ID: 1293884
