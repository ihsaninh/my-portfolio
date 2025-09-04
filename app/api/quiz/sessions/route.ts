import { NextRequest, NextResponse } from "next/server";

import { createSession, getSessionByFingerprint } from "@/src/lib/quiz-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerName, display_name, fingerprint_hash } = body;

    // Support both new API format (display_name, fingerprint_hash) and legacy format (playerName, categorySlug)
    const displayName = display_name || playerName;
    let fingerprintHash = fingerprint_hash;

    if (!displayName) {
      return NextResponse.json(
        { error: "Player name or display name is required" },
        { status: 400 }
      );
    }

    // Generate fingerprint if not provided (for legacy frontend calls)
    if (!fingerprintHash) {
      // Create a more stable fingerprint based on player name and category
      fingerprintHash = `fp-${displayName
        .toLowerCase()
        .replace(/\s+/g, "-")}-${Date.now()}`;
    }

    // Check if session already exists with this fingerprint
    const existingSession = await getSessionByFingerprint(fingerprintHash);
    if (existingSession) {
      return NextResponse.json({
        sessionId: existingSession.id,
        ...existingSession,
      });
    }

    // Create new session
    const sessionId = `session-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}`;

    const session = await createSession({
      id: sessionId,
      display_name: displayName,
      fingerprint_hash: fingerprintHash,
    });

    return NextResponse.json({
      sessionId: session.id,
      ...session,
    });
  } catch (error) {
    console.error("Sessions API error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
