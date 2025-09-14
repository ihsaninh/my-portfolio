import { NextRequest, NextResponse } from "next/server";

import { checkRateLimit, generalLimiter } from "@/src/lib/rate-limit";
import { getSessionIdFromCookies } from "@/src/lib/session";
import { supabaseAdmin } from "@/src/lib/supabase";
import { createRoomSchema, validateRequest } from "@/src/lib/validation";

// Simple in-memory connection tracking for server-side
const serverConnections = new Map<
  string,
  { roomId: string; timestamp: number }
>();

function trackServerConnection(roomId: string, sessionId: string) {
  serverConnections.set(sessionId, {
    roomId,
    timestamp: Date.now(),
  });

  // Clean up old connections (older than 1 hour)
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [key, conn] of serverConnections.entries()) {
    if (conn.timestamp < oneHourAgo) {
      serverConnections.delete(key);
    }
  }

  console.log(
    `🖥️ Server connection tracked. Active connections: ${serverConnections.size}`
  );
}

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const rateLimit = checkRateLimit(req, generalLimiter);
    if (rateLimit.limited) {
      return rateLimit.response!;
    }

    const json = await req.json();

    // Validate request body
    const validation = validateRequest(createRoomSchema, json);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error, details: validation.details },
        { status: 400 }
      );
    }

    const body = validation.data;

    const supabase = supabaseAdmin();
    const hostSessionId = getSessionIdFromCookies(req);
    if (!hostSessionId) {
      return NextResponse.json(
        { error: "Missing session token" },
        { status: 401 }
      );
    }

    // Track server connection
    trackServerConnection(`temp-${Date.now()}`, hostSessionId);

    // Ensure host session exists
    const { data: session, error: sessionErr } = await supabase
      .from("quiz_sessions")
      .select("*")
      .eq("id", hostSessionId)
      .single();

    if (sessionErr || !session) {
      console.error(
        "Session lookup error:",
        sessionErr,
        "for sessionId:",
        hostSessionId
      );
      console.log(
        `[DEBUG] RLS check: session lookup failed for ${hostSessionId}`
      );
      return NextResponse.json(
        { error: "Invalid host session. Please refresh and try again." },
        { status: 400 }
      );
    }
    console.log(
      `[DEBUG] RLS check: session lookup succeeded for ${hostSessionId}`
    );

    const roomId = `room-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    // Create room
    const { error: roomErr } = await supabase.from("battle_rooms").insert({
      id: roomId,
      host_session_id: hostSessionId,
      topic: body.topic ?? null,
      category_id: body.categoryId ?? null,
      language: body.language,
      num_questions: body.numQuestions,
      round_time_sec: body.roundTimeSec,
      capacity: body.capacity ?? null,
      question_type: body.questionType ?? "open-ended",
      status: "waiting",
    });

    if (roomErr) {
      console.error("Create room error", roomErr);
      return NextResponse.json(
        { error: "Failed to create room" },
        { status: 500 }
      );
    }

    // Update connection tracking with actual room ID
    trackServerConnection(roomId, hostSessionId);

    // Room created successfully - host will join manually
    return NextResponse.json({ roomId });
  } catch (e: unknown) {
    console.error("Create room exception", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
