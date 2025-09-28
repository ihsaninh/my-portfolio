import { NextRequest, NextResponse } from "next/server";

import { getCategoryBySlug, getQuestionsByCategory } from "@/src/shared/lib/services/quiz-api";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language") || "en";

    // First get the category to find the ID
    const category = await getCategoryBySlug(slug);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Get questions for this category with language filter
    const questions = await getQuestionsByCategory(category.id, language, 5);

    return NextResponse.json({
      category,
      questions,
    });
  } catch (error) {
    console.error("Questions API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
