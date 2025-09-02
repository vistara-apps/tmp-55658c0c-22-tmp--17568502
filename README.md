# VibeFinder

**Stop doomscrolling, start discovering: Your AI guide to trending local spots.**

VibeFinder is an AI-powered web application that curates and displays trending local experiences and events based on real-time social media video analysis, presented visually on a map.

## Features

### AI-Powered Social Curation
Scans Instagram and TikTok videos in real-time to identify trending venues, events, and experiences. Extracts key information like atmosphere, crowd, and activity type.

### Interactive Map View
Displays curated recommendations on an interactive map, allowing users to easily visualize what's happening around them.

### Real-time Trend Insights
Shows *why* a place is trending by integrating short video clips, user sentiment, and key activity highlights directly into recommendations.

### Personalized 'Vibe' Matching
Learns user preferences for atmosphere, crowd, and activity from their social media behavior to tailor recommendations.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Authentication**: OnchainKit (Wallet-based)
- **Database**: Supabase (PostgreSQL)
- **APIs**:
  - EnsembleData (Social media scraping)
  - SocialKit (Video analysis)
  - OpenAI (NLP and content generation)
  - Google Maps (Location services)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Git
- Supabase account
- API keys for external services

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/vibefinder.git
   cd vibefinder
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file based on the provided `.env.local.example`:
   ```bash
   cp .env.local.example .env.local
   ```

4. Fill in the required environment variables in `.env.local`.

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Documentation

- [API Documentation](docs/api.md)
- [Data Models](docs/data-models.md)
- [External Integrations](docs/integrations.md)
- [Setup Guide](docs/setup.md)

## Business Model

VibeFinder uses a subscription model:
- **Free Tier**: Basic recommendations with limited filtering options
- **Premium Tier** ($5/month): Advanced filtering, personalized vibe matching, unlimited saved locations, ad-free experience, and priority recommendations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

