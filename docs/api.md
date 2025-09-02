# VibeFinder API Documentation

This document provides comprehensive documentation for the VibeFinder API endpoints, including request/response formats, authentication requirements, and error handling.

## Authentication

All API endpoints require authentication using a wallet address. Authentication is handled through Supabase Auth.

### Error Responses

All API endpoints follow a consistent error response format:

```json
{
  "error": "Error message",
  "status": 400
}
```

## Endpoints

### Recommendations

#### GET /api/recommendations

Get recommendations with optional filtering.

**Query Parameters:**

- `userId` (optional): User ID for personalized recommendations
- `latitude` (optional): Latitude for location-based recommendations
- `longitude` (optional): Longitude for location-based recommendations
- `radius` (optional): Radius in kilometers (default: 5)
- `vibeTags` (optional): Comma-separated list of vibe tags to filter by
- `minTrendScore` (optional): Minimum trend score (premium users only)
- `limit` (optional): Maximum number of results to return

**Response:**

```json
[
  {
    "recommendationId": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Jazz Night at Blue Note",
    "description": "Live jazz performances with craft cocktails in an intimate setting.",
    "venue_name": "Blue Note Jazz Club",
    "location": "Downtown, San Francisco",
    "social_media_url": "https://tiktok.com/video/12345",
    "trend_score": 85,
    "vibe_tags": ["intimate", "lively", "artsy"],
    "image_url": "https://example.com/image.jpg",
    "video_url": "https://example.com/video.mp4",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "timestamp": "2023-06-15T14:30:00Z",
    "venueId": "456e7890-e12b-34d5-a678-426614174000"
  }
]
```

#### POST /api/recommendations

Create a new recommendation.

**Request Body:**

```json
{
  "title": "Jazz Night at Blue Note",
  "description": "Live jazz performances with craft cocktails in an intimate setting.",
  "venue_name": "Blue Note Jazz Club",
  "location": "Downtown, San Francisco",
  "social_media_url": "https://tiktok.com/video/12345",
  "vibe_tags": ["intimate", "lively", "artsy"],
  "image_url": "https://example.com/image.jpg",
  "video_url": "https://example.com/video.mp4",
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

**Response:**

```json
{
  "recommendationId": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Jazz Night at Blue Note",
  "description": "Live jazz performances with craft cocktails in an intimate setting.",
  "venue_name": "Blue Note Jazz Club",
  "location": "Downtown, San Francisco",
  "social_media_url": "https://tiktok.com/video/12345",
  "trend_score": 70,
  "vibe_tags": ["intimate", "lively", "artsy"],
  "image_url": "https://example.com/image.jpg",
  "video_url": "https://example.com/video.mp4",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "timestamp": "2023-06-15T14:30:00Z",
  "venueId": "456e7890-e12b-34d5-a678-426614174000"
}
```

#### PUT /api/recommendations

Generate mock recommendations (development/demo only).

**Request Body:**

```json
{
  "count": 5,
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194
  }
}
```

**Response:**

Array of recommendation objects.

### Users

#### GET /api/users

Get current user data.

**Response:**

```json
{
  "userId": "0x1234567890abcdef",
  "preferences": ["chill", "lively"],
  "saved_locations": ["123e4567-e89b-12d3-a456-426614174000"],
  "onboarding_complete": true,
  "subscription_tier": "free",
  "subscription_expiry": null,
  "created_at": "2023-06-15T14:30:00Z",
  "updated_at": "2023-06-15T14:30:00Z"
}
```

#### POST /api/users

Update user data.

**Request Body:**

```json
{
  "preferences": ["chill", "lively", "trendy"],
  "onboarding_complete": true
}
```

**Response:**

Updated user object.

#### GET /api/users/:id

Get user data by ID.

**Response:**

User object (full data for current user, limited data for other users).

#### PATCH /api/users/:id/preferences

Update user preferences.

**Request Body:**

```json
{
  "preferences": ["chill", "lively", "trendy"]
}
```

**Response:**

Updated user object.

#### POST /api/users/:id/onboarding

Complete user onboarding.

**Response:**

Updated user object.

### Venues

#### GET /api/venues

Search venues by query or get venues by category.

**Query Parameters:**

- `query` (optional): Search query
- `category` (optional): Category to filter by
- `latitude` (optional): Latitude for nearby venues
- `longitude` (optional): Longitude for nearby venues
- `radius` (optional): Radius in kilometers (default: 5)

**Response:**

```json
[
  {
    "venueId": "456e7890-e12b-34d5-a678-426614174000",
    "name": "Blue Note Jazz Club",
    "address": "Downtown, San Francisco",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "categories": ["music", "nightlife"],
    "created_at": "2023-06-15T14:30:00Z",
    "updated_at": "2023-06-15T14:30:00Z"
  }
]
```

#### POST /api/venues

Create a new venue.

**Request Body:**

```json
{
  "name": "Blue Note Jazz Club",
  "address": "Downtown, San Francisco",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "categories": ["music", "nightlife"]
}
```

**Response:**

Created venue object.

#### GET /api/venues/:id

Get venue by ID.

**Response:**

```json
{
  "venueId": "456e7890-e12b-34d5-a678-426614174000",
  "name": "Blue Note Jazz Club",
  "address": "Downtown, San Francisco",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "categories": ["music", "nightlife"],
  "created_at": "2023-06-15T14:30:00Z",
  "updated_at": "2023-06-15T14:30:00Z",
  "recommendations": [
    {
      "recommendationId": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Jazz Night at Blue Note",
      "description": "Live jazz performances with craft cocktails in an intimate setting.",
      "trend_score": 85,
      "vibe_tags": ["intimate", "lively", "artsy"],
      "timestamp": "2023-06-15T14:30:00Z"
    }
  ]
}
```

### Subscriptions

#### GET /api/subscriptions

Get current user's subscription status.

**Response:**

```json
{
  "tier": "premium",
  "expiry": "2023-07-15T14:30:00Z",
  "isActive": true,
  "features": [
    "Advanced filtering",
    "Personalized vibe matching",
    "Unlimited saved locations",
    "Ad-free experience",
    "Priority recommendations"
  ]
}
```

#### POST /api/subscriptions

Create or update user subscription.

**Request Body:**

```json
{
  "tier": "premium"
}
```

**Response:**

Updated subscription data.

