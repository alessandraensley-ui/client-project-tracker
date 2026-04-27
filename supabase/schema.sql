-- Client Project Tracker Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT DEFAULT 'New Client',
  brand_name TEXT DEFAULT 'Brand Name',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  industry TEXT DEFAULT 'Technology',
  start_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brand Development Tasks (10-day timeline)
CREATE TABLE brand_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  day INT NOT NULL CHECK (day >= 1 AND day <= 10),
  group_name TEXT NOT NULL,
  task_name TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_by TEXT,
  completed_at TIMESTAMPTZ
);

-- Website Development Tasks (14-day timeline)
CREATE TABLE website_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  day INT NOT NULL CHECK (day >= 1 AND day <= 14),
  group_name TEXT NOT NULL,
  task_name TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_by TEXT,
  completed_at TIMESTAMPTZ
);

-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL CHECK (user_role IN ('Lead', 'Designer')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Presence table for real-time user tracking
CREATE TABLE presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL CHECK (user_role IN ('Lead', 'Designer')),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Create a default client
INSERT INTO clients (client_name, brand_name, email, phone, industry, start_date)
VALUES ('Acme Corporation', 'Acme', 'contact@acme.com', '+1 555-0123', 'Technology', CURRENT_DATE);

-- Get the client ID for task insertion
DO $$
DECLARE
  client_uuid UUID;
BEGIN
  SELECT id INTO client_uuid FROM clients LIMIT 1;
  
  -- Brand Development Tasks (10 days, grouped)
  -- Group 1: Brand Strategy (Days 1-2)
  INSERT INTO brand_tasks (client_id, day, group_name, task_name) VALUES
    (client_uuid, 1, 'Brand Strategy', 'Initial brand discovery meeting'),
    (client_uuid, 2, 'Brand Strategy', 'Competitor analysis & market research');
  
  -- Group 2: Visual Identity (Days 3-5)
  INSERT INTO brand_tasks (client_id, day, group_name, task_name) VALUES
    (client_uuid, 3, 'Visual Identity', 'Logo concept development'),
    (client_uuid, 4, 'Visual Identity', 'Color palette & typography selection'),
    (client_uuid, 5, 'Visual Identity', 'Visual identity refinement');
  
  -- Group 3: Brand Guidelines (Days 6-8)
  INSERT INTO brand_tasks (client_id, day, group_name, task_name) VALUES
    (client_uuid, 6, 'Brand Guidelines', 'Brand guidelines document creation'),
    (client_uuid, 7, 'Brand Guidelines', 'Tone of voice & messaging framework'),
    (client_uuid, 8, 'Brand Guidelines', 'Brand asset organization');
  
  -- Group 4: Final Assets (Days 9-10)
  INSERT INTO brand_tasks (client_id, day, group_name, task_name) VALUES
    (client_uuid, 9, 'Final Assets', 'Final asset export & delivery'),
    (client_uuid, 10, 'Final Assets', 'Brand launch handoff');
  
  -- Website Development Tasks (14 days, grouped)
  -- Group 1: Wireframes (Days 1-3)
  INSERT INTO website_tasks (client_id, day, group_name, task_name) VALUES
    (client_uuid, 1, 'Wireframes', 'Sitemap & information architecture'),
    (client_uuid, 2, 'Wireframes', 'Homepage wireframe'),
    (client_uuid, 3, 'Wireframes', 'Inner pages wireframes');
  
  -- Group 2: Design (Days 4-7)
  INSERT INTO website_tasks (client_id, day, group_name, task_name) VALUES
    (client_uuid, 4, 'Design', 'Visual design concept'),
    (client_uuid, 5, 'Design', 'Homepage design'),
    (client_uuid, 6, 'Design', 'Inner pages design'),
    (client_uuid, 7, 'Design', 'Design review & revisions');
  
  -- Group 3: Development (Days 8-11)
  INSERT INTO website_tasks (client_id, day, group_name, task_name) VALUES
    (client_uuid, 8, 'Development', 'Frontend development setup'),
    (client_uuid, 9, 'Development', 'Core pages development'),
    (client_uuid, 10, 'Development', 'Interactive elements & animations'),
    (client_uuid, 11, 'Development', 'Mobile responsiveness');
  
  -- Group 4: Testing (Days 12-13)
  INSERT INTO website_tasks (client_id, day, group_name, task_name) VALUES
    (client_uuid, 12, 'Testing', 'Cross-browser testing'),
    (client_uuid, 13, 'Testing', 'Performance & accessibility audit');
  
  -- Group 5: Launch (Day 14)
  INSERT INTO website_tasks (client_id, day, group_name, task_name) VALUES
    (client_uuid, 14, 'Launch', 'Final launch & handoff');
END $$;

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE clients;
ALTER PUBLICATION supabase_realtime ADD TABLE brand_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE website_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
ALTER PUBLICATION supabase_realtime ADD TABLE presence;

-- Row Level Security (RLS) - Allow all operations for demo purposes
-- In production, you would want to configure proper auth policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE presence ENABLE ROW LEVEL SECURITY;

-- Allow all access (for demo - restrict in production)
CREATE POLICY "Allow all for clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for brand_tasks" ON brand_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for website_tasks" ON website_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for notes" ON notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for presence" ON presence FOR ALL USING (true) WITH CHECK (true);