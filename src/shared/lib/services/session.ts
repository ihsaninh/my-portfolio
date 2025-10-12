import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "quiz_session_id";
export const BATTLE_SESSION_COOKIE = "battle_session_id";

export function getSessionIdFromCookies(req: NextRequest): string | null {
  try {
    const c = req.cookies.get(SESSION_COOKIE);
    return c?.value || null;
  } catch {
    return null;
  }
}

export function getBattleSessionIdFromCookies(req: NextRequest): string | null {
  try {
    const c = req.cookies.get(BATTLE_SESSION_COOKIE);
    return c?.value || null;
  } catch {
    return null;
  }
}

