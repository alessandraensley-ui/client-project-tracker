# Installation Instructions

## Prerequisites

1. **Install Node.js** (v18 or higher):
   - Download from: https://nodejs.org/
   - Or use Homebrew: `brew install node`
   - Or use nvm: `nvm install 18`

2. **Create a Supabase Project**:
   - Go to https://supabase.com
   - Create a new project
   - Get your project URL and anon key

## Setup Steps

1. Navigate to the project directory:

   ```bash
   cd Client-project-tracker
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your Supabase credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up the database:
   - Go to your Supabase dashboard
   - Run the SQL from `supabase/schema.sql` in the SQL editor

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open http://localhost:3000 in your browser

## Deployment to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add the environment variables in Vercel settings
5. Deploy!

## User Roles

When using the app, you can identify as either:

- **Lead** - Agency lead/manager
- **Designer** - Designer team member

This is stored in localStorage and shown in the notes feed.
