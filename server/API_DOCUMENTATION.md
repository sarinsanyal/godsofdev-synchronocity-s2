# Mela Server API Documentation

Welcome to the **Mela Backend API** documentation. This guide provides comprehensive details about all available endpoints, functions, and their request/response formats.

---

## Table of Contents

1. [Overview](#overview)
2. [Base Configuration](#base-configuration)
3. [HTTP Endpoints](#http-endpoints)
4. [Database Query Functions](#database-query-functions)
5. [Error Handling](#error-handling)
6. [Authentication](#authentication)

---

## Overview

The Mela backend server is built with **Express.js** and **Supabase** for database operations. It provides endpoints for managing events, user interactions, and ML-based recommendations.

**Base URL:** `http://localhost:3000`

**Current Version:** 1.0.0

---

## Base Configuration

| Aspect | Details |
|--------|---------|
| **Port** | 3000 (default) or via `PORT` env variable |
| **Framework** | Express.js |
| **Database** | Supabase PostgreSQL |
| **Storage** | Supabase Storage (event images) |
| **Authentication** | Mock User ID via `x-mock-user-id` header |
| **CORS** | Enabled |

---

## HTTP Endpoints

### 1. Health Check

Check if the server is running and operational.

| Property | Value |
|----------|-------|
| **Method** | GET |
| **Endpoint** | `/health` |
| **Authentication** | Not required |
| **Description** | Health check endpoint to verify server status |

**Request:**
```
GET /health
```

**Response (200 OK):**
```json
{
  "status": "Mela server is live and routing"
}
```

---

### 2. Get Events (Map Feed)

Fetch all events within a specified radius from the user's location.

| Property | Value |
|----------|-------|
| **Method** | GET |
| **Endpoint** | `/api/events` |
| **Authentication** | Not required |
| **Description** | Retrieves events within a geographic radius |

**Request Parameters (Query String):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | float | Yes | User's latitude |
| `lng` | float | Yes | User's longitude |
| `radius` | integer | Yes | Search radius in meters |

**Request Example:**
```
GET /api/events?lat=40.7128&lng=-74.0060&radius=5000
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid-string",
    "title": "Event Title",
    "description": "Event Description",
    "category": "Concert",
    "organizer_id": "user-id",
    "contact_email": "organizer@example.com",
    "contact_phone": "+1234567890",
    "image_url": "https://storage.example.com/event.jpg",
    "location": {"type": "Point", "coordinates": [-74.0060, 40.7128]},
    "created_at": "2026-05-30T10:00:00Z",
    "updated_at": "2026-05-30T10:00:00Z"
  }
]
```

**Error Response (400):**
```json
{
  "error": "Missing lat, lng, or radius parameters"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to fetch events"
}
```

---

### 3. Create Event

Create a new event with optional image upload.

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Endpoint** | `/api/events` |
| **Authentication** | Required (x-mock-user-id header) |
| **Content-Type** | multipart/form-data |
| **Description** | Create a new event with image upload support |

**Request Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `x-mock-user-id` | Yes | User ID of the event organizer |
| `Content-Type` | Auto | multipart/form-data |

**Request Body (Form Data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Event title (max 255 chars) |
| `description` | string | Yes | Event description |
| `category` | string | Yes | Event category (e.g., Concert, Sports, Tech) |
| `lat` | float | Yes | Event latitude |
| `lng` | float | Yes | Event longitude |
| `contact_email` | string | Yes | Organizer email |
| `contact_phone` | string | Yes | Organizer phone number |
| `image` | file | No | Event image (multipart file) |

**Request Example:**
```
POST /api/events
Headers: x-mock-user-id: user-123
Content-Type: multipart/form-data

Form Data:
- title: "Summer Music Festival"
- description: "Join us for an amazing music festival"
- category: "Concert"
- lat: 40.7128
- lng: -74.0060
- contact_email: organizer@example.com
- contact_phone: "+1234567890"
- image: [binary file data]
```

**Response (201 Created):**
```json
{
  "success": true,
  "event": {
    "id": "uuid-string",
    "title": "Summer Music Festival",
    "description": "Join us for an amazing music festival",
    "category": "Concert",
    "organizer_id": "user-123",
    "contact_email": "organizer@example.com",
    "contact_phone": "+1234567890",
    "image_url": "https://storage.example.com/events/unique-id-filename.jpg",
    "location": {"type": "Point", "coordinates": [-74.0060, 40.7128]},
    "created_at": "2026-05-30T10:00:00Z",
    "updated_at": "2026-05-30T10:00:00Z"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Unauthorized: You must be logged in to create an event"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to create event"
}
```

---

### 4. Update Event

Update an existing event (owner-only access with optional image update).

| Property | Value |
|----------|-------|
| **Method** | PUT |
| **Endpoint** | `/api/events/:eventId` |
| **Authentication** | Required (x-mock-user-id header) |
| **Content-Type** | multipart/form-data |
| **Description** | Update event details and optionally replace image |

**Request Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `x-mock-user-id` | Yes | User ID (must be event organizer) |

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventId` | string (UUID) | Yes | The event ID to update |

**Request Body (Form Data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | No | Updated event title |
| `description` | string | No | Updated event description |
| `category` | string | No | Updated event category |
| `lat` | float | No | Updated event latitude |
| `lng` | float | No | Updated event longitude |
| `contact_email` | string | No | Updated organizer email |
| `contact_phone` | string | No | Updated organizer phone |
| `image` | file | No | New event image (replaces existing) |

**Request Example:**
```
PUT /api/events/550e8400-e29b-41d4-a716-446655440000
Headers: x-mock-user-id: user-123
Content-Type: multipart/form-data

Form Data:
- title: "Updated Festival Name"
- description: "Updated description"
- category: "Music"
```

**Response (200 OK):**
```json
{
  "success": true,
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Updated Festival Name",
    "description": "Updated description",
    "category": "Music",
    "organizer_id": "user-123",
    "contact_email": "organizer@example.com",
    "contact_phone": "+1234567890",
    "image_url": "https://storage.example.com/events/updated-filename.jpg",
    "location": {"type": "Point", "coordinates": [-74.0060, 40.7128]},
    "created_at": "2026-05-30T10:00:00Z",
    "updated_at": "2026-05-30T11:30:00Z"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Unauthorized"
}
```

**Error Response (403):**
```json
{
  "error": "Forbidden: You can only edit your own events"
}
```

**Error Response (404):**
```json
{
  "error": "Event not found"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to update event"
}
```

---

### 5. RSVP to Event

Register user attendance for an event (RSVP confirmation).

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Endpoint** | `/api/rsvp` |
| **Authentication** | Required (x-mock-user-id header) |
| **Content-Type** | application/json |
| **Description** | Create RSVP record and log user interaction |

**Request Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `x-mock-user-id` | Yes | User ID of attendee |
| `Content-Type` | Yes | application/json |

**Request Body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eventId` | string (UUID) | Yes | The event ID to RSVP to |

**Request Example:**
```json
POST /api/rsvp
Headers: x-mock-user-id: user-456
Content-Type: application/json

{
  "eventId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "RSVP confirmed!"
}
```

**Error Response (400):**
```json
{
  "error": "Event ID required"
}
```

**Error Response (401):**
```json
{
  "error": "Unauthorized"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to process RSVP"
}
```

**Side Effects:**
- Creates entry in `rsvps` table
- Logs user interaction with score 3.0 in `user_interactions` table

---

### 6. Get ML-Based Recommendations

Fetch personalized event recommendations based on user history and location.

| Property | Value |
|----------|-------|
| **Method** | GET |
| **Endpoint** | `/api/recommendations` |
| **Authentication** | Required (x-mock-user-id header) |
| **Description** | ML-powered recommendations from external service |

**Request Parameters (Query String):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | float | Yes | User's current latitude |
| `lng` | float | Yes | User's current longitude |

**Request Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `x-mock-user-id` | Yes | User ID for recommendations |

**Request Example:**
```
GET /api/recommendations?lat=40.7128&lng=-74.0060
Headers: x-mock-user-id: user-456
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid-string",
    "title": "Jazz Night",
    "description": "Live jazz performance",
    "category": "Music",
    "organizer_id": "user-789",
    "contact_email": "jazz@example.com",
    "contact_phone": "+1987654321",
    "image_url": "https://storage.example.com/events/jazz.jpg",
    "location": {"type": "Point", "coordinates": [-74.0080, 40.7150]},
    "created_at": "2026-05-25T15:00:00Z",
    "updated_at": "2026-05-25T15:00:00Z",
    "ml_reason": "Similar to events you've attended"
  }
]
```

**Response (200 OK - No Recommendations):**
```json
[]
```

**Error Response (401):**
```json
{
  "error": "Unauthorized"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to fetch recommendations"
}
```

**Notes:**
- Calls external ML service on `http://localhost:5000/recommend`
- ML service must be running for this endpoint to work
- Events are hydrated with full details from database

---

## Database Query Functions

These are TypeScript functions exported from `src/db/queries.ts` for direct database access.

### Event Queries

#### 1. getAllEvents()

Fetch all events from the database.

| Property | Value |
|----------|-------|
| **Function** | `getAllEvents()` |
| **File** | `src/db/queries.ts` |
| **Parameters** | None |
| **Return Type** | `Promise<EventRecord[]>` |
| **Description** | Retrieves all events ordered by creation date (newest first) |

**Example Usage:**
```typescript
import { getAllEvents } from './src/db/queries';

const events = await getAllEvents();
```

**Return Format:**
```typescript
[
  {
    id: "uuid",
    title: "string",
    description: "string",
    category: "string",
    organizer_id: "string",
    contact_email: "string",
    contact_phone: "string",
    image_url: "string | null",
    location: "POINT(...)",
    created_at: "ISO 8601 timestamp",
    updated_at: "ISO 8601 timestamp"
  }
]
```

**Error Handling:**
- Throws `Error` if query fails
- Logs error message to console

---

#### 2. getEventById(eventId)

Fetch a single event by UUID.

| Property | Value |
|----------|-------|
| **Function** | `getEventById(eventId: string)` |
| **File** | `src/db/queries.ts` |
| **Parameters** | `eventId` (string, UUID) |
| **Return Type** | `Promise<EventRecord>` |
| **Description** | Retrieves a specific event by its unique ID |

**Example Usage:**
```typescript
import { getEventById } from './src/db/queries';

const event = await getEventById('550e8400-e29b-41d4-a716-446655440000');
```

**Error Handling:**
- Throws `Error` if event not found or query fails
- Logs error message to console

---

#### 3. createEvent(eventData)

Create a new event record.

| Property | Value |
|----------|-------|
| **Function** | `createEvent(eventData: any)` |
| **File** | `src/db/queries.ts` |
| **Parameters** | `eventData` (object with event details) |
| **Return Type** | `Promise<EventRecord>` |
| **Description** | Inserts a new event into the database |

**Example Usage:**
```typescript
import { createEvent } from './src/db/queries';

const newEvent = await createEvent({
  title: "Event Name",
  description: "Description",
  category: "Concert",
  organizer_id: "user-123",
  contact_email: "email@example.com",
  contact_phone: "+1234567890",
  image_url: "https://...",
  location: "POINT(-74.0060 40.7128)"
});
```

**Error Handling:**
- Throws `Error` if insert fails
- Logs error message to console

---

### User Queries

#### 4. getUserByClerkId(clerkUserId)

Fetch a user profile by Clerk User ID.

| Property | Value |
|----------|-------|
| **Function** | `getUserByClerkId(clerkUserId: string)` |
| **File** | `src/db/queries.ts` |
| **Parameters** | `clerkUserId` (string) |
| **Return Type** | `Promise<UserRecord \| null>` |
| **Description** | Retrieves user profile from Clerk authentication ID |

**Example Usage:**
```typescript
import { getUserByClerkId } from './src/db/queries';

const user = await getUserByClerkId('clerk_user_id_123');
```

**Return Format:**
```typescript
{
  id: "uuid",
  clerk_user_id: "string",
  name: "string",
  email: "string",
  preferences: "object | null",
  created_at: "ISO 8601 timestamp",
  updated_at: "ISO 8601 timestamp"
}
```

**Error Handling:**
- Returns `null` if user not found (PGRST116 ignored)
- Throws `Error` for other query failures
- Logs error message to console

---

#### 5. upsertUser(userData)

Create or update a user profile.

| Property | Value |
|----------|-------|
| **Function** | `upsertUser(userData: any)` |
| **File** | `src/db/queries.ts` |
| **Parameters** | `userData` (object with user details) |
| **Return Type** | `Promise<UserRecord>` |
| **Description** | Inserts user or updates if exists (by clerk_user_id) |

**Example Usage:**
```typescript
import { upsertUser } from './src/db/queries';

const user = await upsertUser({
  clerk_user_id: "clerk_user_id_123",
  name: "John Doe",
  email: "john@example.com",
  preferences: { theme: "dark" }
});
```

**Error Handling:**
- Throws `Error` if upsert fails
- Logs error message to console

---

### RSVP Queries

#### 6. createRsvp(clerkUserId, eventId)

Create an RSVP record for a user to attend an event.

| Property | Value |
|----------|-------|
| **Function** | `createRsvp(clerkUserId: string, eventId: string)` |
| **File** | `src/db/queries.ts` |
| **Parameters** | `clerkUserId` (string), `eventId` (string UUID) |
| **Return Type** | `Promise<RsvpRecord>` |
| **Description** | Creates RSVP entry for user attendance |

**Example Usage:**
```typescript
import { createRsvp } from './src/db/queries';

const rsvp = await createRsvp('user-456', '550e8400-e29b-41d4-a716-446655440000');
```

**Return Format:**
```typescript
{
  id: "uuid",
  clerk_user_id: "string",
  event_id: "string",
  created_at: "ISO 8601 timestamp"
}
```

**Error Handling:**
- Throws `Error` if insert fails
- Logs error message to console

---

#### 7. getEventRsvps(eventId)

Fetch all RSVPs for a specific event.

| Property | Value |
|----------|-------|
| **Function** | `getEventRsvps(eventId: string)` |
| **File** | `src/db/queries.ts` |
| **Parameters** | `eventId` (string UUID) |
| **Return Type** | `Promise<RsvpRecord[]>` |
| **Description** | Retrieves all RSVPs for an event (attendee list) |

**Example Usage:**
```typescript
import { getEventRsvps } from './src/db/queries';

const rsvps = await getEventRsvps('550e8400-e29b-41d4-a716-446655440000');
```

**Return Format:**
```typescript
[
  {
    id: "uuid",
    clerk_user_id: "string",
    event_id: "string",
    created_at: "ISO 8601 timestamp"
  }
]
```

**Error Handling:**
- Throws `Error` if query fails
- Logs error message to console

---

### Interaction Queries

#### 8. logUserInteraction(interactionData)

Log a user interaction for analytics and recommendation purposes.

| Property | Value |
|----------|-------|
| **Function** | `logUserInteraction(interactionData: object)` |
| **File** | `src/db/queries.ts` |
| **Parameters** | See table below |
| **Return Type** | `Promise<InteractionRecord>` |
| **Description** | Records user event interactions for ML training |

**Interaction Data Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `clerk_user_id` | string | Yes | User ID |
| `event_id` | string | Yes | Event ID |
| `interaction_type` | string | Yes | Type: VIEW, CLICK, SAVE, RSVP, SHARE |
| `score` | number | No | Interaction weight (default: 1.0) |

**Example Usage:**
```typescript
import { logUserInteraction } from './src/db/queries';

const interaction = await logUserInteraction({
  clerk_user_id: 'user-456',
  event_id: '550e8400-e29b-41d4-a716-446655440000',
  interaction_type: 'VIEW',
  score: 1.5
});
```

**Return Format:**
```typescript
{
  id: "uuid",
  clerk_user_id: "string",
  event_id: "string",
  interaction_type: "string",
  score: "number",
  created_at: "ISO 8601 timestamp"
}
```

**Error Handling:**
- Throws `Error` if insert fails
- Logs error message to console

---

## Error Handling

The API uses standard HTTP status codes and returns JSON error objects.

### Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Missing/invalid parameters |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected server error |

### Error Response Format

All error responses follow this format:

```json
{
  "error": "Descriptive error message"
}
```

### Common Error Scenarios

| Scenario | Status | Message |
|----------|--------|---------|
| Missing authentication header | 401 | `"Unauthorized"` |
| Missing query parameters | 400 | `"Missing lat, lng, or radius parameters"` |
| Not event owner | 403 | `"Forbidden: You can only edit your own events"` |
| Event doesn't exist | 404 | `"Event not found"` |
| Supabase connection error | 500 | `"Failed to fetch events"` |

---

## Authentication

The API uses a mock authentication system via headers for development:

### Header-Based Authentication

| Header | Value | Required | Description |
|--------|-------|----------|-------------|
| `x-mock-user-id` | User UUID | For protected endpoints | Development user identifier |

### Usage Example

```bash
curl -X POST http://localhost:3000/api/events \
  -H "x-mock-user-id: user-123" \
  -H "Content-Type: multipart/form-data" \
  -F "title=My Event" \
  -F "description=Event details" \
  -F "category=Concert" \
  -F "lat=40.7128" \
  -F "lng=-74.0060" \
  -F "contact_email=user@example.com" \
  -F "contact_phone=+1234567890" \
  -F "image=@/path/to/image.jpg"
```

**Production Note:** Replace with proper Clerk/JWT authentication before deploying to production.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `SUPABASE_URL` | Required | Supabase project URL |
| `SUPABASE_ANON_KEY` | Required | Supabase anonymous key |
| `CORS_ORIGIN` | * | CORS allowed origins |

---

## Quick Reference

### Endpoint Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Server health check |
| GET | `/api/events` | No | Fetch nearby events |
| POST | `/api/events` | Yes | Create event |
| PUT | `/api/events/:eventId` | Yes | Update event |
| POST | `/api/rsvp` | Yes | RSVP to event |
| GET | `/api/recommendations` | Yes | Get ML recommendations |

---

## Contact & Support

For issues or questions about the API:
- Check [server README](./README.md)
- Review error logs in terminal
- Verify Supabase connection status

---

**Last Updated:** May 30, 2026
**API Version:** 1.0.0
