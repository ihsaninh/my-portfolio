import { NextRequest, NextResponse } from "next/server";

import { evaluateAnswer, isAIAvailable } from "@/src/lib/ai-scoring";
import { createAttempt, getAttemptsBySession } from "@/src/lib/quiz-api";

// Simple fallback scoring when AI is not available
function generateSimpleScore(answer: string): {
  score: number;
  feedback: string;
} {
  const wordCount = answer.trim().split(/\s+/).length;
  const hasKeywords =
    answer.toLowerCase().includes("because") ||
    answer.toLowerCase().includes("example") ||
    answer.toLowerCase().includes("however") ||
    answer.toLowerCase().includes("therefore");

  let score: number;
  let feedback: string;

  if (wordCount >= 50 && hasKeywords) {
    score = 85 + Math.floor(Math.random() * 15);
    feedback = "Excellent! Your answer was comprehensive and well-structured.";
  } else if (wordCount >= 30) {
    score = 70 + Math.floor(Math.random() * 15);
    feedback = "Good answer! You covered the main points effectively.";
  } else if (wordCount >= 15) {
    score = 50 + Math.floor(Math.random() * 20);
    feedback = "Decent answer, but could use more detail.";
  } else {
    score = 20 + Math.floor(Math.random() * 30);
    feedback = "This needs improvement. Consider researching the topic more.";
  }

  return { score, feedback };
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;
    const body = await request.json();
    const {
      questionId,
      answer,
      question_id,
      answer_text,
      question_data, // New: question details for AI evaluation
      score_ai,
      score_rule,
      score_final,
      feedback,
    } = body;

    // Support both new API format and legacy frontend format
    const finalQuestionId = question_id || questionId;
    const finalAnswerText = answer_text || answer;

    if (!finalQuestionId || !finalAnswerText) {
      return NextResponse.json(
        { error: "Question ID and answer are required" },
        { status: 400 }
      );
    }

    // AI Evaluation - Use real AI if available, otherwise fallback
    let finalScore = score_final;
    let finalFeedback = feedback;
    let aiScore = score_ai;
    let detailedFeedback = null;

    if (finalScore === undefined) {
      if (isAIAvailable() && question_data) {
        try {
          const aiResult = await evaluateAnswer({
            question:
              question_data.prompt ||
              question_data.question ||
              "Question text not available",
            answer: finalAnswerText,
            category: question_data.category || "general",
            difficulty: question_data.difficulty || 2,
            language: question_data.language || "en", // Pass language to AI evaluation
            rubric: question_data.rubric_json,
          });

          finalScore = aiResult.score;
          finalFeedback = aiResult.feedback;
          aiScore = aiResult.score;
          detailedFeedback = {
            strengths: aiResult.strengths,
            improvements: aiResult.improvements,
            category: aiResult.category,
          };
        } catch {
          // Fall back to simple scoring
          const fallbackResult = generateSimpleScore(finalAnswerText);
          finalScore = fallbackResult.score;
          finalFeedback = fallbackResult.feedback;
        }
      } else {
        // Simple scoring algorithm (fallback)
        const fallbackResult = generateSimpleScore(finalAnswerText);
        finalScore = fallbackResult.score;
        finalFeedback = fallbackResult.feedback;
      }
    }

    // Create attempt
    const attemptId = `attempt-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}`;

    const attempt = await createAttempt({
      id: attemptId,
      session_id: sessionId,
      question_id: finalQuestionId,
      answer_text: finalAnswerText,
      score_ai: aiScore,
      score_rule,
      score_final: finalScore,
      feedback: finalFeedback,
    });

    return NextResponse.json({
      score: finalScore,
      feedback: finalFeedback,
      detailedFeedback,
      attempt,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create attempt" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;
    const attempts = await getAttemptsBySession(sessionId);
    return NextResponse.json(attempts);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch attempts" },
      { status: 500 }
    );
  }
}
