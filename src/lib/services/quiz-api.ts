import {
  Attempt,
  Category,
  LeaderboardCategory,
  LeaderboardGlobal,
  Question,
  Session,
} from "@/src/types/database";

import { supabaseServer } from "./supabase";

// Categories API
export async function getCategories(): Promise<Category[]> {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("quiz_categories")
    .select("*")
    .eq("is_active", true)
    .order("created_at");

  if (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }

  return data || [];
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("quiz_categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("Error fetching category:", error);
    return null;
  }

  return data;
}

// Questions API
export async function getQuestionsByCategory(
  categoryId: string,
  language: string = "en",
  limit: number = 5
): Promise<Question[]> {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("category_id", categoryId)
    .eq("language", language)
    .eq("is_active", true)
    .order("created_at")
    .limit(limit);

  if (error) {
    console.error("Error fetching questions:", error);
    throw new Error("Failed to fetch questions");
  }

  return data || [];
}

// Fetch a single question by ID
export async function getQuestionById(
  questionId: string
): Promise<Question | null> {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("id", questionId)
    .single();

  if (error) {
    console.error("Error fetching question:", error);
    return null;
  }

  return data;
}

// Sessions API
export async function createSession(sessionData: {
  id: string;
  display_name: string;
  fingerprint_hash: string;
}): Promise<Session> {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("quiz_sessions")
    .insert(sessionData)
    .select()
    .single();

  if (error) {
    console.error("Error creating session:", error);
    throw new Error("Failed to create session");
  }

  return data;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("quiz_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error) {
    console.error("Error fetching session:", error);
    return null;
  }

  return data;
}

export async function getSessionByFingerprint(
  fingerprint: string
): Promise<Session | null> {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("quiz_sessions")
    .select("*")
    .eq("fingerprint_hash", fingerprint)
    .single();

  if (error) {
    // Session not found is not an error
    return null;
  }

  return data;
}

export async function updateSessionDisplayName(
  sessionId: string,
  displayName: string
): Promise<void> {
  const supabase = supabaseServer();

  const { error } = await supabase
    .from("quiz_sessions")
    .update({ display_name: displayName })
    .eq("id", sessionId);

  if (error) {
    console.error("Error updating session display name:", error);
    throw new Error("Failed to update session");
  }
}

// Attempts API
export async function createAttempt(attemptData: {
  id: string;
  session_id: string;
  question_id: string;
  answer_text: string;
  score_ai?: number | null;
  score_rule?: number | null;
  score_final: number;
  feedback?: string | null;
}): Promise<Attempt> {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("quiz_attempts")
    .insert(attemptData)
    .select()
    .single();

  if (error) {
    console.error("Error creating attempt:", error);
    throw new Error("Failed to create attempt");
  }

  return data;
}

export async function getAttemptsBySession(
  sessionId: string
): Promise<Attempt[]> {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at");

  if (error) {
    console.error("Error fetching attempts:", error);
    throw new Error("Failed to fetch attempts");
  }

  return data || [];
}

// Leaderboard API
export async function getGlobalLeaderboard(
  limit: number = 10
): Promise<LeaderboardGlobal[]> {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("quiz_leaderboard_global")
    .select("*")
    // Order by average score to align with quiz result percentage
    .order("avg_score", { ascending: false })
    .order("first_attempt", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching global leaderboard:", error);
    throw new Error("Failed to fetch global leaderboard");
  }

  return data || [];
}

export async function getCategoryLeaderboard(
  categoryId: string,
  limit: number = 10
): Promise<LeaderboardCategory[]> {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("quiz_leaderboard_category")
    .select("*")
    .eq("category_id", categoryId)
    // Order by average score to align with quiz result percentage
    .order("avg_score", { ascending: false })
    .order("first_attempt", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching category leaderboard:", error);
    throw new Error("Failed to fetch category leaderboard");
  }

  return data || [];
}

// Utility functions
export async function refreshLeaderboards(): Promise<void> {
  const supabase = supabaseServer();

  const { error } = await supabase.rpc("refresh_leaderboards");

  if (error) {
    console.error("Error refreshing leaderboards:", error);
    throw new Error("Failed to refresh leaderboards");
  }
}

// Fingerprint generation utility
export function generateFingerprint(): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("Browser fingerprint", 2, 2);
  }

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    Math.random().toString(),
  ].join("|");

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}
