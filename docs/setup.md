# VibeFinder Setup Guide

This document provides instructions for setting up the VibeFinder application for development and production.

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Git
- Supabase account
- API keys for external services (see below)

## Installation

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

4. Fill in the required environment variables in `.env.local` (see "Environment Variables" section below).

5. Set up the database:
   - Create a new Supabase project
   - Run the SQL scripts from `docs/data-models.md` to create the necessary tables and indexes

6. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Environment Variables

The following environment variables are required for the application to function properly:

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### OnchainKit Configuration
```
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key
```

### Google Maps API Configuration
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### OpenAI Configuration
```
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o
```

### OpenRouter Configuration (Alternative to OpenAI)
```
OPENROUTER_API_KEY=your_openrouter_api_key
```

### EnsembleData API Configuration
```
ENSEMBLE_DATA_API_URL=https://api.ensembledata.com
ENSEMBLE_DATA_API_TOKEN=your_ensembledata_api_token
```

### SocialKit API Configuration
```
SOCIALKIT_API_URL=https://api.socialkit.dev
SOCIALKIT_API_KEY=your_socialkit_api_key
```

### Application Configuration
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=VibeFinder
NEXT_PUBLIC_APP_DESCRIPTION="Stop doomscrolling, start discovering: Your AI guide to trending local spots."
```

## Database Setup

The application requires a Supabase database with the following tables:

1. `users` - Stores user data
2. `recommendations` - Stores recommendation data
3. `venues` - Stores venue data

The complete schema for these tables can be found in `docs/data-models.md`.

## External Services Setup

### Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Go to the SQL Editor and run the SQL scripts from `docs/data-models.md`
3. Set up authentication with wallet providers
4. Get the project URL and anon key from the API settings

### Google Maps

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Maps JavaScript API, Geocoding API, and Places API
3. Create an API key with appropriate restrictions
4. Add the key to your `.env.local` file

### OpenAI

1. Sign up for an account at [OpenAI](https://platform.openai.com)
2. Generate an API key from your dashboard
3. Add the key to your `.env.local` file

### EnsembleData

1. Sign up for an account at [EnsembleData](https://ensembledata.com)
2. Generate an API token from your dashboard
3. Add the token to your `.env.local` file

### SocialKit

1. Sign up for an account at [SocialKit](https://www.socialkit.dev)
2. Generate an API key from your dashboard
3. Add the key to your `.env.local` file

### OnchainKit

1. Sign up for an account at [OnchainKit](https://onchainkit.com)
2. Generate an API key from your dashboard
3. Add the key to your `.env.local` file

## Development Workflow

1. Make changes to the code
2. Run tests:
   ```bash
   npm test
   # or
   yarn test
   ```
3. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```
4. Start the production server:
   ```bash
   npm start
   # or
   yarn start
   ```

## Deployment

The application can be deployed to any platform that supports Next.js applications, such as Vercel, Netlify, or AWS.

### Deploying to Vercel

1. Push your code to a Git repository
2. Import the repository in Vercel
3. Configure the environment variables
4. Deploy the application

### Deploying to Netlify

1. Push your code to a Git repository
2. Import the repository in Netlify
3. Configure the environment variables
4. Deploy the application

### Deploying to AWS

1. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```
2. Deploy the `.next` folder to AWS using your preferred method (e.g., AWS Amplify, AWS Elastic Beanstalk, or AWS S3 + CloudFront)

## Troubleshooting

### API Keys Not Working

- Ensure that the API keys are correctly formatted and have the necessary permissions
- Check if the API keys have any usage restrictions or rate limits
- Verify that the API keys are correctly set in the `.env.local` file

### Database Connection Issues

- Check if the Supabase URL and anon key are correct
- Ensure that the database tables are correctly set up
- Verify that the database is accessible from your development environment

### Map Not Loading

- Check if the Google Maps API key is correct and has the necessary permissions
- Ensure that the Maps JavaScript API is enabled in the Google Cloud Console
- Verify that the API key is correctly set in the `.env.local` file

### Authentication Issues

- Check if the OnchainKit API key is correct
- Ensure that wallet authentication is properly set up in Supabase
- Verify that the user has a wallet connected and is properly authenticated

