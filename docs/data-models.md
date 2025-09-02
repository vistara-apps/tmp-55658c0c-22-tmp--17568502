# VibeFinder Data Models

This document describes the data models used in the VibeFinder application.

## User

The User model represents a user of the application.

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| userId | string | Unique identifier for the user (wallet address) |
| preferences | string[] | Array of vibe preferences |
| saved_locations | string[] | Array of saved recommendation IDs |
| onboarding_complete | boolean | Whether the user has completed onboarding |
| subscription_tier | string | Subscription tier ('free' or 'premium') |
| subscription_expiry | string | ISO date string of subscription expiry (null for free tier) |
| created_at | string | ISO date string of creation time |
| updated_at | string | ISO date string of last update time |

### Relationships

- Has many saved Recommendations (via saved_locations)

## Recommendation

The Recommendation model represents a trending local spot recommendation.

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| recommendationId | string | Unique identifier for the recommendation |
| title | string | Title of the recommendation |
| description | string | Description of the recommendation |
| venue_name | string | Name of the venue |
| location | string | Location description (e.g., neighborhood) |
| social_media_url | string | URL to the original social media post |
| trend_score | number | Trending score (0-100) |
| vibe_tags | string[] | Array of vibe tags |
| image_url | string | URL to an image |
| video_url | string | URL to a video |
| latitude | number | Latitude coordinate |
| longitude | number | Longitude coordinate |
| venueId | string | ID of the associated venue |
| timestamp | string | ISO date string of when the recommendation was created |

### Relationships

- Belongs to a Venue (via venueId)
- Can be saved by many Users

## Venue

The Venue model represents a physical location.

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| venueId | string | Unique identifier for the venue |
| name | string | Name of the venue |
| address | string | Address of the venue |
| latitude | number | Latitude coordinate |
| longitude | number | Longitude coordinate |
| categories | string[] | Array of category tags |
| created_at | string | ISO date string of creation time |
| updated_at | string | ISO date string of last update time |

### Relationships

- Has many Recommendations

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  userId TEXT PRIMARY KEY,
  preferences TEXT[] DEFAULT '{}',
  saved_locations TEXT[] DEFAULT '{}',
  onboarding_complete BOOLEAN DEFAULT FALSE,
  subscription_tier TEXT DEFAULT 'free',
  subscription_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Recommendations Table

```sql
CREATE TABLE recommendations (
  recommendationId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  venue_name TEXT NOT NULL,
  location TEXT,
  social_media_url TEXT,
  trend_score INTEGER DEFAULT 70,
  vibe_tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  video_url TEXT,
  latitude FLOAT,
  longitude FLOAT,
  venueId UUID REFERENCES venues(venueId),
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### Venues Table

```sql
CREATE TABLE venues (
  venueId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Indexes

```sql
-- For efficient user lookups
CREATE INDEX idx_users_userId ON users(userId);

-- For efficient recommendation filtering by vibe tags
CREATE INDEX idx_recommendations_vibe_tags ON recommendations USING GIN(vibe_tags);

-- For efficient venue category filtering
CREATE INDEX idx_venues_categories ON venues USING GIN(categories);

-- For efficient geospatial queries
CREATE INDEX idx_venues_location ON venues USING GIST(
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);
CREATE INDEX idx_recommendations_location ON recommendations USING GIST(
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);
```

