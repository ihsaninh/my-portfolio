import { NextRequest, NextResponse } from "next/server";

import { getSessionIdFromCookies } from "@/src/lib/session";
import { supabaseAdmin } from "@/src/lib/supabase";

// Simple type validation without zod
interface CreateRoomBody {
  topic?: string | null;
  categoryId?: string | null;
  language?: string;
  numQuestions?: number;
  roundTimeSec?: number;
  capacity?: number | null;
  hostDisplayName?: string | null;
  questionType?: "open-ended" | "multiple-choice";
}

function validateCreateRoomBody(body: unknown): body is CreateRoomBody {
  if (!body || typeof body !== "object") return false;

  const obj = body as Record<string, unknown>;

  // Basic validation
  if (
    obj.language !== undefined &&
    (typeof obj.language !== "string" ||
      (obj.language as string).length < 2 ||
      (obj.language as string).length > 5)
  )
    return false;
  if (
    obj.numQuestions !== undefined &&
    (typeof obj.numQuestions !== "number" ||
      (obj.numQuestions as number) < 1 ||
      (obj.numQuestions as number) > 20)
  )
    return false;
  if (
    obj.roundTimeSec !== undefined &&
    (typeof obj.roundTimeSec !== "number" ||
      (obj.roundTimeSec as number) < 5 ||
      (obj.roundTimeSec as number) > 600)
  )
    return false;
  if (
    obj.capacity !== undefined &&
    (typeof obj.capacity !== "number" ||
      (obj.capacity as number) < 2 ||
      (obj.capacity as number) > 100)
  )
    return false;
  if (
    obj.questionType !== undefined &&
    obj.questionType !== "open-ended" &&
    obj.questionType !== "multiple-choice"
  )
    return false;

  return true;
}

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
    const json = await req.json();

    // Validate request body
    if (!validateCreateRoomBody(json)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const body = {
      topic: json.topic ?? null,
      categoryId: json.categoryId ?? null,
      language: json.language ?? "en",
      numQuestions: json.numQuestions ?? 10,
      roundTimeSec: json.roundTimeSec ?? 30,
      capacity: json.capacity ?? null,
      hostDisplayName: json.hostDisplayName ?? null,
      questionType: json.questionType ?? "open-ended",
    };

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
