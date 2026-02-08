# CloudShare API (Backend)

## Overview
This is the backend service for the **CloudShare** application, responsible for handling user authentication, file management, payments, and profile data. It is built using **Spring Boot** and **MongoDB**.

## Tech Stack
- **Language:** Java 21
- **Framework:** Spring Boot 3.5.5
- **Database:** MongoDB (Atlas)
- **Authentication:** Clerk
- **Payments:** Razorpay
- **Build Tool:** Maven

## Features
- **User Authentication:** Secure login/signup using Clerk.
- **File Management:** Upload, view, and manage files.
- **Credits System:** Manage user credits for file operations.
- **Subscription & Payments:** Razorpay integration for premium features.
- **Profile Management:** Update and retrieve user profile details.

## Prerequisites
Ensure you have the following installed:
- [Java 21 SDK](https://www.oracle.com/java/technologies/downloads/#java21)
- [Maven](https://maven.apache.org/)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas)

## Configuration
The application requires several environment variables/properties to run. These are configured in `src/main/resources/application.properties`.

### Key Properties
| Property | Description |
|Args|Description|
|---|---|
| `spring.data.mongodb.uri` | MongoDB connection string |
| `clerk.issuer` | Clerk issuer URL |
| `clerk.webhook.secret` | Webhook secret for Clerk events |
| `razorpay.key.id` | Razorpay Key ID |
| `razorpay.key.secret` | Razorpay Key Secret |

## Installation & Running

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd cloudShareapi
   ```

2. **Build the project:**
   ```bash
   ./mvnw clean install
   ```

3. **Run the application:**
   ```bash
   ./mvnw spring-boot:run
   ```
   The server will start on port `9090`.

## API Endpoints
Base URL: `/api/v1.0`

### Authentication & Webhooks
- `POST /api/v1.0/webhook`: Handle Clerk webhooks.

### Files
- `POST /file/upload`: Upload a new file.
- `GET /file/view`: View user files.

### User Credits & Profile
- `GET /user-credits`: Get current user credits.
- `GET /profile`: Get user profile.
- `PATCH /profile`: Update profile.

### Payments
- `POST /payment/create-order`: Create a Razorpay order.
- `POST /payment/verify`: Verify payment signature.

## Project Structure
```
src/main/java/in/badam/cloudShareapi
├── config/           # Configuration classes (Security, etc.)
├── controller/       # REST Controllers
├── documents/        # MongoDB Document models
├── dto/             # Data Transfer Objects
├── repository/       # MongoDB Repositories
├── service/          # Business Logic
└── security/         # Security filters & utilities
```
