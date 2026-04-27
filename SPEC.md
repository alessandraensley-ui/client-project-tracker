# Client Project Tracker - Specification

## Project Overview

- **Project Name**: Client Project Tracker
- **Type**: Real-time collaborative web application
- **Core Functionality**: Track client projects with real-time collaboration between agency team members (Lead/Designer)
- **Target Users**: Agency teams managing client projects

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + Realtime)
- **Styling**: CSS Modules with custom design system
- **Deployment**: Vercel

## UI/UX Specification

### Layout Structure

- **Header**: Fixed top bar with logo, project title, and user presence indicators
- **Main Content**: Two-column layout on desktop, single column on mobile
  - Left: Client info + Timeline sections
  - Right: Notes feed
- **Responsive Breakpoints**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

### Visual Design

#### Color Palette

- **Background**: `#0D0D0D` (deep black)
- **Surface**: `#161616` (card backgrounds)
- **Surface Elevated**: `#1E1E1E` (hover states)
- **Border**: `#2A2A2A` (subtle borders)
- **Primary**: `#E8C547` (golden yellow - agency accent)
- **Primary Hover**: `#F5D76E`
- **Text Primary**: `#FFFFFF`
- **Text Secondary**: `#8A8A8A`
- **Text Muted**: `#5A5A5A`
- **Success**: `#4ADE80` (green for completed)
- **Warning**: `#FBBF24` (amber for in-progress)
- **Lead Tag**: `#6366F1` (indigo)
- **Designer Tag**: `#EC4899` (pink)

#### Typography

- **Font Family**: `"Syne", sans-serif` (headings), `"DM Sans", sans-serif` (body)
- **Headings**:
  - H1: 32px, 700 weight
  - H2: 24px, 600 weight
  - H3: 18px, 600 weight
- **Body**: 14px, 400 weight
- **Small**: 12px, 400 weight
- **Letter Spacing**: -0.02em for headings

#### Spacing System

- **Base Unit**: 4px
- **Spacing Scale**: 4, 8, 12, 16, 24, 32, 48, 64px
- **Card Padding**: 24px
- **Section Gap**: 24px

#### Visual Effects

- **Card Shadow**: `0 4px 24px rgba(0,0,0,0.4)`
- **Border Radius**: 12px (cards), 8px (buttons), 6px (inputs)
- **Transitions**: 200ms ease-out for all interactive elements
- **Hover Effects**: Subtle scale(1.01) on cards, color shifts on buttons

### Components

#### Header

- Logo text "AGENCY" in Syne font
- Project title (editable)
- Live user presence dots (green = active)
- Connection status indicator

#### Client Info Card

- Client name (editable inline)
- Brand name (editable inline)
- Email with mailto link
- Phone with tel link
- Industry dropdown
- Start date picker

#### Timeline Section (Brand & Website)

- Section header with icon
- 10-day (Brand) / 14-day (Website) timeline
- Progress bar showing completion percentage
- Grouped checklist items:
  - Brand: Brand Strategy, Visual Identity, Brand Guidelines, Final Assets
  - Website: Wireframes, Design, Development, Testing, Launch
- Each task: checkbox + label + day indicator
- Real-time sync across users

#### Notes Feed

- Scrollable feed with newest first
- Note card: avatar, name, timestamp, content, tag (Lead/Designer)
- Input area with tag selector
- Real-time updates via Supabase

#### User Presence

- Small avatar circles in header
- Green dot for online users
- Tooltip with user name

## Database Schema (Supabase)

### Table: clients

```sql
id: uuid PRIMARY KEY
client_name: text
brand_name: text
email: text
phone: text
industry: text
start_date: date
created_at: timestamptz
updated_at: timestamptz
```

### Table: brand_tasks

```sql
id: uuid PRIMARY KEY
client_id: uuid REFERENCES clients
day: int (1-10)
group_name: text
task_name: text
completed: boolean
completed_by: uuid
completed_at: timestamptz
```

### Table: website_tasks

```sql
id: uuid PRIMARY KEY
client_id: uuid REFERENCES clients
day: int (1-14)
group_name: text
task_name: text
completed: boolean
completed_by: uuid
completed_at: timestamptz
```

### Table: notes

```sql
id: uuid PRIMARY KEY
client_id: uuid REFERENCES clients
user_name: text
user_role: text ('Lead' | 'Designer')
content: text
created_at: timestamptz
```

### Table: presence

```sql
id: uuid PRIMARY KEY
user_id: uuid
user_name: text
user_role: text
last_seen: timestamptz
```

## Functionality Specification

### Core Features

1. **Real-time Dashboard**: Changes sync instantly between users via Supabase Realtime
2. **Client Management**: Edit client info with inline editing
3. **Task Tracking**: Check/uncheck tasks, progress auto-calculates
4. **Notes Feed**: Add notes with role tags, see real-time updates
5. **User Presence**: See who's currently viewing the project

### User Interactions

- Click to edit any field (inline editing)
- Checkbox toggles task completion
- Notes input with Enter to submit
- Tag selector for note roles

### Edge Cases

- Handle offline state gracefully
- Show loading states during sync
- Optimistic UI updates with rollback on failure

## Acceptance Criteria

1. ✅ Two browser tabs show real-time sync of all changes
2. ✅ Client info displays and edits correctly
3. ✅ Brand Development shows 10-day progress with groups
4. ✅ Website Development shows 14-day progress with groups
5. ✅ Notes feed updates in real-time
6. ✅ User presence indicators work
7. ✅ Clean, minimal agency aesthetic
8. ✅ Deployable to Vercel with Supabase
