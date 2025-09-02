# VibeFinder External Integrations

This document provides information about the external services integrated with VibeFinder and how to set them up.

## Overview

VibeFinder integrates with several external services to provide its functionality:

1. **EnsembleData** - For real-time scraping of TikTok and Instagram video content
2. **SocialKit Video Analysis API** - For AI-powered analysis of video content
3. **OpenAI (GPT-4/3.5)** - For natural language processing and content generation
4. **Google Maps Geocoding/Places API** - For location data and map visualization
5. **Supabase** - For database and authentication services
6. **OnchainKit** - For wallet authentication and identity management

## Integration Details

### EnsembleData

**Purpose**: Real-time scraping of TikTok and Instagram video content to identify trending local spots.

**Setup**:
1. Sign up for an account at [EnsembleData](https://ensembledata.com)
2. Generate an API token from your dashboard
3. Add the token to your `.env.local` file:
   ```
   ENSEMBLE_DATA_API_URL=https://api.ensembledata.com
   ENSEMBLE_DATA_API_TOKEN=your_token_here
   ```

**Key Endpoints**:
- `/apis/tt/hashtag_search` - Search TikTok by hashtag
- `/apis/ig/hashtag_search` - Search Instagram by hashtag
- `/apis/location_search` - Search by location
- `/apis/trending_hashtags` - Get trending hashtags by location
- `/apis/video_details` - Get details about a specific video

### SocialKit Video Analysis API

**Purpose**: AI-powered analysis of video content to extract summaries, identify keywords, and gauge engagement/sentiment.

**Setup**:
1. Sign up for an account at [SocialKit](https://www.socialkit.dev)
2. Generate an API key from your dashboard
3. Add the key to your `.env.local` file:
   ```
   SOCIALKIT_API_URL=https://api.socialkit.dev
   SOCIALKIT_API_KEY=your_key_here
   ```

**Key Endpoints**:
- `/video/summary` - Get a summary of video content
- `/video/transcript` - Get a transcript of video content
- `/video/analytics` - Get analytics about video engagement
- `/video/keywords` - Extract keywords from video content
- `/video/sentiment` - Analyze sentiment of video content
- `/video/vibe_tags` - Extract vibe tags from video content

### OpenAI (GPT-4/3.5)

**Purpose**: Natural language processing for summarizing video transcripts, categorizing venues by 'vibe', and generating concise recommendation descriptions.

**Setup**:
1. Sign up for an account at [OpenAI](https://platform.openai.com)
2. Generate an API key from your dashboard
3. Add the key to your `.env.local` file:
   ```
   OPENAI_API_KEY=your_key_here
   OPENAI_MODEL=gpt-4o
   ```

**Alternative**: You can also use OpenRouter as an alternative to OpenAI:
```
OPENROUTER_API_KEY=your_key_here
```

**Key Functions**:
- `generateRecommendationDescription` - Generate a description for a recommendation
- `categorizeVenueVibe` - Categorize a venue by vibe based on video data
- `generateMockRecommendations` - Generate mock recommendations for development/demo
- `matchUserPreferencesToVenues` - Match user preferences to venue recommendations

### Google Maps Geocoding/Places API

**Purpose**: To convert venue names and addresses into precise geographical coordinates for the map view and to enrich venue data.

**Setup**:
1. Create a project in the [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Maps JavaScript API, Geocoding API, and Places API
3. Create an API key with appropriate restrictions
4. Add the key to your `.env.local` file:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
   ```

**Key Functions**:
- `geocodeAddress` - Convert an address to coordinates
- `reverseGeocode` - Convert coordinates to an address
- `getPlaceDetails` - Get details about a place
- `searchPlaces` - Search for places by text query
- `getNearbyPlaces` - Get places near a location

### Supabase

**Purpose**: Backend as a Service for storing user data, curated recommendations, and managing application state.

**Setup**:
1. Create a project at [Supabase](https://supabase.com)
2. Set up the database tables according to the schema in `docs/data-models.md`
3. Enable authentication with wallet providers
4. Add the project URL and anon key to your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

**Key Functions**:
- `supabase.auth` - Authentication services
- `supabase.from('users')` - User data operations
- `supabase.from('recommendations')` - Recommendation data operations
- `supabase.from('venues')` - Venue data operations

### OnchainKit

**Purpose**: Wallet authentication and identity management for the application.

**Setup**:
1. Sign up for an account at [OnchainKit](https://onchainkit.com)
2. Generate an API key from your dashboard
3. Add the key to your `.env.local` file:
   ```
   NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_key_here
   ```

**Key Components**:
- `OnchainKitProvider` - Provider component for OnchainKit
- `ConnectWallet` - Component for connecting a wallet
- `Identity` - Component for displaying user identity
- `useAccount` - Hook for accessing account information

## Integration Flow

1. **User Authentication**:
   - User connects wallet using OnchainKit
   - Authentication is handled by Supabase Auth

2. **Data Collection**:
   - EnsembleData scrapes social media for trending content
   - SocialKit analyzes video content to extract information
   - Google Maps provides location data for venues

3. **Content Processing**:
   - OpenAI processes text data to generate descriptions and categorize venues
   - Recommendation data is stored in Supabase

4. **User Experience**:
   - Google Maps displays recommendations on a map
   - User preferences are matched to recommendations
   - User interactions are tracked and used to improve recommendations

## Error Handling

All integrations include proper error handling to ensure the application remains functional even if an external service is unavailable:

- Timeouts for all API calls
- Fallback to cached data when possible
- Graceful degradation of features
- Clear error messages for users
- Logging of all integration errors for monitoring

