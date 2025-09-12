import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getSessionIdFromCookies } from "@/src/lib/session";
import { supabaseAdmin } from "@/src/lib/supabase";

const CreateRoomSchema = z.object({
  topic: z.string().max(500).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  language: z.string().min(2).max(5).default("en"),
  numQuestions: z.number().int().min(1).max(20),
  roundTimeSec: z.number().int().min(5).max(600),
  capacity: z.number().int().min(2).max(100).optional(),
  hostDisplayName: z.string().min(1).max(100).optional(),
  questionType: z
    .enum(["open-ended", "multiple-choice"])
    .default("open-ended")
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const body = CreateRoomSchema.parse(json);

    const supabase = supabaseAdmin();
    const hostSessionId = getSessionIdFromCookies(req);
    if (!hostSessionId) {
      return NextResponse.json(
        { error: "Missing session token" },
        { status: 401 }
      );
    }

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
      return NextResponse.json(
        { error: "Invalid host session. Please refresh and try again." },
        { status: 400 }
      );
    }

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

    // Room created successfully - host will join manually
    return NextResponse.json({ roomId });
  } catch (e: unknown) {
    console.error("Create room exception", e);
    if (e && typeof e === "object" && "issues" in e) {
      return NextResponse.json(
        { error: (e as { issues: unknown }).issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
