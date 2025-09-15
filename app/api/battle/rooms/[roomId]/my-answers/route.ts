import { NextRequest, NextResponse } from "next/server";

import { createErrorResponse, ERROR_TYPES } from "@/src/lib/api-errors";
import { getSessionIdFromCookies } from "@/src/lib/session";
import { supabaseAdmin } from "@/src/lib/supabase";

// Define types for better type safety
interface BattleRoomRound {
  round_no: number;
  question_id: string | null;
  question_json: AIQuestion | null;
}

interface BankQuestion {
  id: string;
  prompt: string;
  difficulty: number;
  language: string;
  category_id: string;
}

interface AIQuestion {
  prompt: string;
  difficulty: number;
  language: string;
  category?: string;
  choices?: Array<{ id: string; text: string }>;
  correctChoiceId?: string;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await context.params;
    const sessionId = getSessionIdFromCookies(req);

    if (!sessionId) {
      return createErrorResponse(ERROR_TYPES.MISSING_SESSION);
    }

    const supabase = supabaseAdmin();

    // Get user's answers for this room with round details
    const { data: answers, error: answersErr } = await supabase
      .from("battle_room_answers")
      .select(
        `
        id,
        answer_text,
        choice_id,
        is_correct,
        time_ms,
        score_final,
        feedback,
        round_id,
        battle_room_rounds!inner(
          round_no,
          question_id,
          question_json
        )
      `
      )
      .eq("room_id", roomId)
      .eq("session_id", sessionId);

    if (answersErr) {
      console.error("Failed to fetch user answers:", answersErr);
      return createErrorResponse(ERROR_TYPES.INTERNAL_ERROR);
    }

    // Get questions for rounds that have question_id (from question bank)
    const questionIds =
      answers
        ?.map((a) => {
          const roundData = a.battle_room_rounds as
            | BattleRoomRound
            | BattleRoomRound[];
          return Array.isArray(roundData)
            ? roundData[0]?.question_id
            : roundData?.question_id;
        })
        .filter(Boolean) || [];

    let bankQuestions: BankQuestion[] = [];
    if (questionIds.length > 0) {
      const { data: questions } = await supabase
        .from("quiz_questions")
        .select("id, prompt, difficulty, language, category_id")
        .in("id", questionIds);

      bankQuestions = questions || [];
    }

    // Format the response and sort by round number
    const userAnswers = (answers || [])
      .map((answer) => {
        const roundData = answer.battle_room_rounds as
          | BattleRoomRound
          | BattleRoomRound[];
        // Handle both array and single object cases
        const round = Array.isArray(roundData) ? roundData[0] : roundData;
        let questionData = null;
        let mcq = null as null | {
          chosenId?: string;
          chosenText?: string;
          correctId?: string;
          correctText?: string;
          isCorrect?: boolean;
        };

        if (round) {
          if (round.question_id) {
            // Question from bank
            const bankQuestion = bankQuestions.find(
              (q) => q.id === round.question_id
            );
            if (bankQuestion) {
              questionData = {
                prompt: bankQuestion.prompt,
                difficulty: bankQuestion.difficulty,
                language: bankQuestion.language,
                category: bankQuestion.category_id,
              };
            }
          } else if (round.question_json) {
            // AI-generated question
            const q = round.question_json;
            if (q) {
              questionData = {
                prompt: q.prompt,
                difficulty: q.difficulty,
                language: q.language,
                category: q.category,
              };
              if (q.choices && Array.isArray(q.choices)) {
                const choices = q.choices;
                const chosen = choices.find((c) => c.id === answer.choice_id);
                const correct = choices.find((c) => c.id === q.correctChoiceId);
                mcq = {
                  chosenId: answer.choice_id || undefined,
                  chosenText: chosen?.text,
                  correctId: q.correctChoiceId,
                  correctText: correct?.text,
                  isCorrect:
                    answer.is_correct ??
                    (answer.choice_id && q.correctChoiceId
                      ? answer.choice_id === q.correctChoiceId
                      : undefined),
                };
              }
            }
          }
        }

        return {
          id: answer.id,
          roundNo: round?.round_no || 0,
          question: questionData,
          answer: mcq?.chosenText || answer.answer_text,
          score: answer.score_final || 0,
          feedback: mcq ? "" : answer.feedback || "No feedback available",
          ...(mcq
            ? {
                correctAnswer: mcq.correctText || "",
                isCorrect: !!mcq.isCorrect,
                timeMs: answer.time_ms || null,
              }
            : {}),
        };
      })
      .sort((a, b) => a.roundNo - b.roundNo); // Sort by round number

    return NextResponse.json({
      roomId,
      totalAnswers: userAnswers.length,
      answers: userAnswers,
    });
  } catch (error) {
    console.error("Get user answers exception:", error);
    return createErrorResponse(error);
  }
}
