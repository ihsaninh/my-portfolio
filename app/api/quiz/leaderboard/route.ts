import { NextRequest, NextResponse } from "next/server";

import {
  getCategoryLeaderboard,
  getGlobalLeaderboard,
} from "@/src/lib/quiz-api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (categoryId) {
      const leaderboard = await getCategoryLeaderboard(categoryId, limit);

      // Transform database format to frontend format
      const transformedData = leaderboard.map((entry) => ({
        id: entry.session_id,
        playerName: entry.display_name,
        categoryId: entry.category_id,
        categoryName: "Category", // TODO: Get actual category name
        score: Math.round(entry.best_score),
        maxScore: 100,
        percentage: Math.round(entry.best_score),
        completedAt: new Date(entry.last_attempt),
      }));

      return NextResponse.json(transformedData);
    } else {
      const leaderboard = await getGlobalLeaderboard(limit);

      // Transform database format to frontend format
      const transformedData = leaderboard.map((entry) => ({
        id: entry.session_id,
        playerName: entry.display_name,
        categoryId: "global",
        categoryName: "All Categories",
        score: Math.round(entry.best_score),
        maxScore: 100,
        percentage: Math.round(entry.best_score),
        completedAt: new Date(entry.last_attempt),
      }));

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
