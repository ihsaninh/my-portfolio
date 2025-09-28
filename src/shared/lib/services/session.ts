import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "quiz_session_id";

export function getSessionIdFromCookies(req: NextRequest): string | null {
  try {
    const c = req.cookies.get(SESSION_COOKIE);
    return c?.value || null;
  } catch {
    return null;
  }
}

