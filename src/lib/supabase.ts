import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Client {
  id: string;
  client_name: string;
  brand_name: string;
  email: string;
  phone: string;
  industry: string;
  start_date: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  client_id: string;
  day: number;
  group_name: string;
  task_name: string;
  completed: boolean;
  completed_by: string | null;
  completed_at: string | null;
}

export interface Note {
  id: string;
  client_id: string;
  user_name: string;
  user_role: "Lead" | "Designer";
  content: string;
  created_at: string;
}

export interface Presence {
  id: string;
  user_id: string;
  user_name: string;
  user_role: "Lead" | "Designer";
  last_seen: string;
}

// Kanban Board Types
export interface BrandBoardColumn {
  id: string;
  client_id: string;
  column_name: string;
  position: number;
  created_at: string;
}

export interface BrandBoardCard {
  id: string;
  column_id: string;
  title: string;
  description: string;
  assignee: "Lead" | "Designer" | null;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface WebsiteBoardColumn {
  id: string;
  client_id: string;
  column_name: string;
  position: number;
  created_at: string;
}

export interface WebsiteBoardCard {
  id: string;
  column_id: string;
  title: string;
  description: string;
  assignee: "Lead" | "Designer" | null;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

// Helper to get or generate user ID
export function getUserId(): string {
  if (typeof window === "undefined") return "server";

  let userId = localStorage.getItem("user_id");
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("user_id", userId);
  }
  return userId;
}

// Helper to get user role
export function getUserRole(): "Lead" | "Designer" {
  if (typeof window === "undefined") return "Lead";

  let role = localStorage.getItem("user_role") as "Lead" | "Designer" | null;
  if (!role) {
    role = "Lead";
    localStorage.setItem("user_role", role);
  }
  return role;
}

// Helper to get user name
export function getUserName(): string {
  if (typeof window === "undefined") return "User";

  let name = localStorage.getItem("user_name");
  if (!name) {
    name = `User_${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    localStorage.setItem("user_name", name);
  }
  return name;
}

// Set user role
export function setUserRole(role: "Lead" | "Designer") {
  if (typeof window !== "undefined") {
    localStorage.setItem("user_role", role);
  }
}
