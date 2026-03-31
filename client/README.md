# SneakerBot Client

## Setup

### Environment Variables

To run this application, you need to create a `.env` file in the `client` directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_KEY=your_supabase_anon_key_here

# API Configuration
VITE_API_URL=http://localhost:3000
```

### Getting Supabase Credentials

1. Go to [Supabase](https://supabase.com) and create a new project
2. In your project dashboard, go to Settings > API
3. Copy the "Project URL" and paste it as `VITE_SUPABASE_URL`
4. Copy the "anon public" key and paste it as `VITE_SUPABASE_KEY`

### Development

```bash
npm install
npm run dev
```

The application will run on `http://localhost:3000`

### Production Build

```bash
npm run build
```

## Features

- Dark theme UI
- Task management
- Profile management
- Proxy management
- Real-time updates
- Toast notifications
