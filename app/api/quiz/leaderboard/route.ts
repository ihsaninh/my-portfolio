import { NextRequest, NextResponse } from "next/server";

import {
  getAttemptsBySession,
  getCategories,
  getCategoryLeaderboard,
  getGlobalLeaderboard,
  getQuestionById,
} from "@/src/lib/quiz-api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (categoryId) {
      const leaderboard = await getCategoryLeaderboard(categoryId, limit);
      // Fetch categories to resolve names
      const categories = await getCategories();
      const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

      // Transform database format to frontend format
      const transformedData = leaderboard.map((entry) => ({
        id: entry.session_id,
        playerName: entry.display_name,
        categoryId: entry.category_id,
        categoryName: categoryMap.get(entry.category_id) || "Category",
        // Use average score across attempts to reflect quiz result
        score: Math.round(entry.avg_score),
        maxScore: 100,
        percentage: Math.round(entry.avg_score),
        completedAt: new Date(entry.last_attempt),
      }));

      return NextResponse.json(transformedData);
    } else {
      const leaderboard = await getGlobalLeaderboard(limit);

      // Resolve each entry's most recent category (based on last attempt)
      const categories = await getCategories();
      const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

      const transformedData = await Promise.all(
        leaderboard.map(async (entry) => {
          let categoryIdForEntry: string | "global" = "global";
          let categoryNameForEntry = "All Categories";

          try {
            const attempts = await getAttemptsBySession(entry.session_id);
            if (attempts && attempts.length > 0) {
              // Get latest attempt by created_at
              const latest = attempts.reduce((a, b) =>
                a.created_at > b.created_at ? a : b
              );
              const question = await getQuestionById(latest.question_id);
              if (question?.category_id) {
                categoryIdForEntry = question.category_id;
                categoryNameForEntry =
                  categoryMap.get(question.category_id) || "All Categories";
              }
            }
          } catch {
            // Keep defaults on failure
          }

          return {
            id: entry.session_id,
            playerName: entry.display_name,
            categoryId: categoryIdForEntry,
            categoryName: categoryNameForEntry,
            // Use average score across attempts to reflect quiz result
            score: Math.round(entry.avg_score),
            maxScore: 100,
            percentage: Math.round(entry.avg_score),
            completedAt: new Date(entry.last_attempt),
          };
        })
      );

      return NextResponse.json(transformedData);
    }
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
