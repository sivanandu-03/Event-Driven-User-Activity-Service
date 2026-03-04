# Event-Driven User Activity Service

An event-driven microservice system for tracking user activities. Comprises an API for ingestion, a message queue (RabbitMQ), a MongoDB database, and a background consumer service to process events asynchronously. 

## Architecture
- **API Service**: Express.js REST API handling ingestion, validation, and rate limiting. Publishes events to RabbitMQ.
- **RabbitMQ**: Message broker decoupling ingestion from processing.
- **Consumer Service**: Node.js worker consuming events from RabbitMQ and saving them to MongoDB.
- **Database**: MongoDB storing activity data.

## Project Structure
- `/api`: The REST API service
- `/consumer`: The background worker daemon
- `docker-compose.yml`: Run orchestrator

## Prerequisites
- Docker
- Docker Compose

## Quick Start
To set up and run the entire stack with a single command:
```bash
docker-compose up --build
```
This will start:
- RabbitMQ on port 5672 (Management UI on http://localhost:15672)
- MongoDB on port 27017
- API Service on port 3000
- Consumer worker in the background

## Testing
To run tests for the API service:
```bash
docker-compose exec api npm test
```

To run tests for the consumer service:
```bash
docker-compose exec consumer npm test
```

## API Specification
Please see `API_DOCS.md` for detailed endpoint schemas.

## Rate Limiting
The API enforces a rate limit of 50 requests per 60 seconds per IP address to heavily mitigate spam and abuse.

## Message Acknowledgment
The consumer reliably implements acknowledgements (`channel.ack()`) only upon successfully processing and storing messages. Failures trigger `channel.nack()` to ensure no message loss.
