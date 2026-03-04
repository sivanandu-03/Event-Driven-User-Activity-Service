# Event-Driven User Activity Service with RabbitMQ and Rate Limiting

## Overview

This project implements an **event-driven microservice architecture** for tracking user activities. The system provides a REST API that ingests activity events and publishes them to a **RabbitMQ message queue**. A separate **consumer worker** asynchronously processes these events and stores them in a database.

The API also includes **IP-based rate limiting** to prevent abuse and ensure system stability.

This architecture simulates real-world systems used in **analytics pipelines, auditing systems, and event processing platforms**.

---

# Architecture

```
Client
   │
   ▼
API Service (Express.js)
   │
   │ publish event
   ▼
RabbitMQ Queue (user_activities)
   │
   │ consume messages
   ▼
Consumer Service
   │
   │ store processed events
   ▼
Database (MongoDB)
```

### Key Concepts Used

* Event-driven architecture
* Message queues (RabbitMQ)
* Asynchronous processing
* Rate limiting
* Microservices
* Containerization using Docker

---

# Project Structure

```
Event-Driven User Activity Service
│
├── api
│   ├── src
│   │   ├── config
│   │   │   └── rabbitmq.js
│   │   │
│   │   ├── controllers
│   │   │   └── activityController.js
│   │   │
│   │   ├── middlewares
│   │   │   └── rateLimiter.js
│   │   │
│   │   ├── routes
│   │   │   └── activityRoutes.js
│   │   │
│   │   └── server.js
│   │
│   ├── tests
│   ├── Dockerfile
│   └── package.json
│
├── consumer
│   ├── src
│   │   ├── config
│   │   │   └── database.js
│   │   │
│   │   ├── models
│   │   │   └── activityModel.js
│   │   │
│   │   ├── services
│   │   │   └── activityProcessor.js
│   │   │
│   │   └── worker.js
│   │
│   ├── tests
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .env.example
├── API_DOCS.md
└── README.md
---

# Technologies Used

| Technology     | Purpose               |
| -------------- | --------------------- |
| Node.js        | Backend runtime       |
| Express.js     | REST API framework    |
| RabbitMQ       | Message queue broker  |
| MongoDB        | Data storage          |
| Docker         | Containerization      |
| Docker Compose | Service orchestration |
| Jest           | Unit testing          |

---

# Features

* Event-driven architecture
* Asynchronous event processing
* RabbitMQ durable queues
* API rate limiting (50 requests per minute per IP)
* Input validation
* Error handling
* Containerized services
* Health check endpoint
* Unit testing

---

# API Endpoint

## POST /api/v1/activities

### Description

Accepts a user activity event and publishes it to RabbitMQ.

### Request Example

```json
{
  "userId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "eventType": "user_login",
  "timestamp": "2023-10-27T10:00:00Z",
  "payload": {
    "ipAddress": "192.168.1.1",
    "device": "desktop",
    "browser": "Chrome"
  }
}
```

### Responses

| Status Code | Description               |
| ----------- | ------------------------- |
| 202         | Event successfully queued |
| 400         | Invalid input payload     |
| 429         | Rate limit exceeded       |

---

# Rate Limiting

The API implements **IP-based rate limiting**.

Limit:

```
50 requests per minute per IP
```

If exceeded:

```
HTTP 429 Too Many Requests
```

Response includes header:

```
Retry-After: seconds
```

---

# Database Schema (MongoDB)

Example document stored in MongoDB:

```json
{
  "id": "uuid",
  "userId": "a1b2c3",
  "eventType": "user_login",
  "timestamp": "2023-10-27T10:00:00Z",
  "processedAt": "2023-10-27T10:00:05Z",
  "payload": {
    "ipAddress": "192.168.1.1",
    "device": "desktop"
  }
}
```

---

# Setup Instructions

## 1. Clone the Repository

```
git clone https://github.com/your-username/event-tracker.git
cd event-tracker
```

---

## 2. Configure Environment Variables

Create a `.env` file using the example:

```
cp .env.example .env
```

Example `.env`

```
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
DATABASE_URL=mongodb://user:password@database:27017/activity_db?authSource=admin
API_PORT=3000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=50
```

---

# Running the Application

Start all services using Docker Compose:

```
docker-compose up --build
```

Services started:

* API Service
* Consumer Worker
* RabbitMQ
* MongoDB

---

# RabbitMQ Management UI

Open:

```
http://localhost:15672
```

Login:

```
username: guest
password: guest
```

Navigate to **Queues → user_activities** to see messages.

---

# Health Check

API health endpoint:

```
GET /health
```

Example:

```
http://localhost:3000/health
```

Response:

```json
{
  "status": "ok"
}
```

---

# Testing the API

Example using curl:

```
curl -X POST http://localhost:3000/api/v1/activities \
-H "Content-Type: application/json" \
-d '{
"userId":"123",
"eventType":"login",
"timestamp":"2026-03-01T10:00:00Z",
"payload":{"device":"desktop"}
}'
```

Expected response:

```
202 Accepted
```

---

# Running Tests

Run API tests:

```
docker-compose exec api npm test
```

Run consumer tests:

```
docker-compose exec consumer npm test
```

Tests include:

* API validation
* RabbitMQ publishing
* Message processing
* Database insertion

---

# Error Handling

The system includes robust error handling:

### API

* Input validation errors
* RabbitMQ connection failures
* Rate limit violations

### Consumer

* Invalid message parsing
* Database errors
* Retry using message requeue

---

# Architectural Decisions

### Event-Driven Architecture

Decouples event ingestion from processing, improving scalability and resilience.

### RabbitMQ

Ensures reliable message delivery with durable queues and message acknowledgments.

### Rate Limiting

Prevents API abuse and ensures fair resource usage.

### Docker

Provides a consistent development and deployment environment.

---

# Future Improvements

* Redis-based distributed rate limiting
* Dead-letter queues
* Monitoring with Prometheus and Grafana
* Retry backoff strategies
* Event idempotency handling

---

# Author

Sivanandu
Computer Science Engineering Student

---

# License

This project is licensed under the MIT License.
