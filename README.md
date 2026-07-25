# ✈️ Airline Management System — Enterprise Full-Stack Web Application

[![Angular](https://img.shields.io/badge/Angular-13-DD0031.svg?style=flat-square&logo=angular)](https://angular.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.x-3178C6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Java Version](https://img.shields.io/badge/Java-17-orange.svg?style=flat-square&logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F.svg?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/Database-MySQL_8.0-4479A1.svg?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![YouTube Demo](https://img.shields.io/badge/YouTube-Live_Demo-FF0000.svg?style=flat-square&logo=youtube)](https://www.youtube.com/watch?v=pAPH5O2MO6U)

A full-stack, enterprise-grade **Airline Operations & Reservation Management System** built with **Angular 13**, **Spring Boot RESTful APIs**, and a normalized **MySQL Relational Database**. Designed to streamline end-to-end airline administration, real-time flight tracking telemetry, intelligent seat allocation, passenger booking workflows, digital ticket generation, and financial reporting.

---

## 🎬 Video Demonstration

Watch the full-stack system walkthrough and live video demonstration on YouTube:

[![Airline Management System Demo](https://img.youtube.com/vi/pAPH5O2MO6U/maxresdefault.jpg)](https://www.youtube.com/watch?v=pAPH5O2MO6U)

> 💡 **Watch Full Walkthrough**: Click the video banner above or visit the [Live YouTube Demonstration](https://www.youtube.com/watch?v=pAPH5O2MO6U) to see Angular UI workflows, real-time flight tracking maps, passenger ticket downloads, and admin dashboards in action.

---

## 🔥 Key Features

- **Role-Based Administration**: Multi-role access control for system administrators, flight operators, and passengers.
- **Flight & Fleet Operations**: Complete CRUD management for Aircrafts, Airlines, Airports, Schedules, and Dynamic Fares.
- **Interactive Flight Search & Booking**: Real-time flight search, passenger information input, and intelligent class-wise seat allocation.
- **Real-Time Flight Tracking**: Integrated map route visualization with operational telemetry (ETA, speed, altitude, movement display) powered by Leaflet.js & Chart.js.
- **Payment & Invoice Generation**: Automated voucher, payment invoice downloading, refund handling, and ticket generation.
- **Loyalty & Discount Engine**: Automated passenger loyalty point accrual, point redemption, and promo coupon validation.
- **Baggage & Special Assistance**: Passenger baggage tracking and special assistance booking options.
- **OTP-Based Passenger Portal**: OTP authentication for user logins, flight status inquiries, and boarding pass downloads.
- **Expense & KPI Dashboards**: Administrative reporting dashboards for revenue tracking, operational expenses, and passenger analytics.

---

## 🛠️ Technology Stack

| Layer | Component / Technology |
| :--- | :--- |
| **Frontend Web App** | Angular 13, TypeScript, HTML5, CSS3, Bootstrap, Chart.js, Leaflet Map |
| **Backend REST Service** | Java 17, Spring Boot, REST API, Spring Data JPA, Spring Security, JWT |
| **Database** | MySQL 8.0, InnoDB Engine, Relational Schemas & Indexes |
| **Build & Tooling** | Maven (`mvnw`), npm, Git & GitHub, Postman |

---

## 📌 Repository Structure

```text
airline-management-system-final-project/
│
├── 🎨 frontend/
│   └── aircrat-management1/       # Angular 13 Web Client Application
│
├── ⚙️ backend/
│   └── airline/                   # Spring Boot REST Microservice
│
├── 🗄️ database/                  # Database Schemas & DDL Scripts
├── 📄 docs/                       # Architecture & Screenshots Documentation
│   ├── screenshots/
│   ├── api/
│   └── architecture/
├── README.md
├── SETUP.md
└── SECURITY.md
```

---

## 🚀 Getting Started & Setup Guide

### 📋 Prerequisites

- **Node.js & npm** (compatible with Angular 13)
- **Angular CLI 13** (`npm install -g @angular/cli@13`)
- **JDK 17** or higher
- **Maven** (or included `mvnw` wrapper)
- **MySQL 8.x**

---

### ⚙️ Backend Setup

1. Copy the example properties template:
   ```bash
   cp backend/airline/src/main/resources/application.properties.example backend/airline/src/main/resources/application.properties
   ```
2. Configure your local MySQL database credentials in `application.properties`:
   ```properties
   DB_URL=jdbc:mysql://localhost:3306/airway?useSSL=false&serverTimezone=UTC
   DB_USERNAME=your_mysql_username
   DB_PASSWORD=your_mysql_password
   JWT_SECRET=your_jwt_secret_key
   ```
3. Run the Spring Boot server:
   ```bash
   cd backend/airline

   # Linux / macOS
   ./mvnw spring-boot:run

   # Windows PowerShell
   .\mvnw.cmd spring-boot:run
   ```
   The backend API service will start on `http://localhost:8080`.

---

### 🎨 Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend/aircrat-management1
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Angular development server:
   ```bash
   npm start
   ```
   Access the web application at `http://localhost:4200`.

---

### 🗄️ Database Setup

1. Create the MySQL database:
   ```sql
   CREATE DATABASE airway;
   ```
2. Import the schema SQL script:
   ```bash
   mysql -u your_mysql_username -p airway < database/schema.sql
   ```

---

## 📍 Default Local URLs

- **Frontend**: `http://localhost:4200`
- **Backend API**: `http://localhost:8080`
- **MySQL Database**: `airway`

---

## ⚠️ Known Limitations & Future Enhancements

- **Known Limitations**: Local configuration is required before running the backend. Demo payment, OTP, email, SMS, and tracking integrations require provider credentials outside Git.
- **Future Enhancements**: Add deployment-specific profiles and CI checks, safe fictional demo seed data, API documentation under `docs/api/`, and architecture diagrams under `docs/architecture/`.

---

## 👤 Author & Credentials

**Mousumi Akter**  
*Junior Software Developer | Full-Stack & Mobile Developer*  
- 📍 **Location**: Dhaka, Bangladesh  
- 📧 **Email**: [mous4422@gmail.com](mailto:mous4422@gmail.com)  
- 🐙 **GitHub**: [@bitbytebd](https://github.com/bitbytebd)  
- 📜 **Fellowship**: ISDB-BISEW IT Scholarship Programme (Round 68, JEE / Full-Stack Track, Trainee ID: 1293884)

---

## 📄 License
This project is licensed under the [MIT License](LICENSE) — free for portfolio, demonstration, and educational purposes.
