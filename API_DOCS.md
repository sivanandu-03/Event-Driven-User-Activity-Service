# API Documentation

## `POST /api/v1/activities`

Ingests a user activity event and queues it for asynchronous processing.

### Endpoint
`POST /api/v1/activities`

### Request Headers
- `Content-Type: application/json`

### Request Body (JSON)
| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | (Required) Unique identifier of the user (e.g., UUID) |
| `eventType` | string | (Required) Type of event |
| `timestamp` | string | (Required) ISO-8601 formatted timestamp |
| `payload` | object | (Required) Additional details about the event |

#### Example:
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

#### 202 Accepted
Indicates the event was successfully validated, received, and queued.

```json
{
    "message": "Event successfully received and queued."
}
```

#### 400 Bad Request
Indicates invalid input. The response body will contain details regarding the validation error.
```json
{
    "error": "\"timestamp\" must be in ISO 8601 date format"
}
```

#### 429 Too Many Requests
Returned when the limit of 50 requests per 60 seconds per IP is exceeded. Includes a `Retry-After` header indicating when the limit will reset.
```json
{
    "error": "Too Many Requests",
    "retryAfter": 15
}
```

#### 500 Internal Server Error
Returned when the server fails to process or queue the message.
