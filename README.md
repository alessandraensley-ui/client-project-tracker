# Client Project Tracker

A real-time collaborative client project management dashboard built with Next.js 14 and Supabase.

![Dashboard Preview](https://via.placeholder.com/800x400/0D0D0D/E8C547?text=Client+Project+Tracker)

## Features

- **Real-time Collaboration**: See live updates from other users instantly
- **Client Information**: Track client name, brand, contact details, industry, and start date
- **Brand Development Timeline**: 10-day project timeline with grouped checklists
- **Website Development Timeline**: 14-day project timeline with grouped checklists
- **Progress Tracking**: Visual progress bars for each project phase
- **Notes Feed**: Timestamped notes tagged as "Lead" or "Designer"
- **User Presence**: See who's currently viewing the project

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + Realtime)
- **Styling**: CSS Modules
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd client-project-tracker
```

2. Install dependencies:

```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL from `supabase/schema.sql` in the Supabase SQL Editor

4. Configure environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Project Structure

```
client-project-tracker/
├── src/
│   ├── app/
│   │   ├── globals.css      # Global styles & design system
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Main dashboard component
│   │   └── page.module.css  # Dashboard styles
│   └── lib/
│       └── supabase.ts      # Supabase client & types
├── supabase/
│   └── schema.sql           # Database schema
├── .env.example             # Environment variables template
├── package.json
├── tsconfig.json
└── next.config.js
```

## User Roles

When using the app, you can switch between two roles:

- **Lead**: Agency lead/manager (indigo tag)
- **Designer**: Designer team member (pink tag)

Your role is stored in localStorage and persists across sessions.

## License

MIT
