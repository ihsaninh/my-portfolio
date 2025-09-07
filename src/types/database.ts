export interface Database {
  public: {
    Tables: {
      quiz_categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          icon: string | null;
          color: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          slug: string;
          name: string;
          icon?: string | null;
          color?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          icon?: string | null;
          color?: string | null;
          is_active?: boolean;
        };
      };
      quiz_questions: {
        Row: {
          id: string;
          category_id: string;
          prompt: string;
          difficulty: number;
          rubric_json: Record<string, unknown> | null;
          type: string;
          language: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          category_id: string;
          prompt: string;
          difficulty?: number;
          rubric_json?: Record<string, unknown> | null;
          type?: string;
          language?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          category_id?: string;
          prompt?: string;
          difficulty?: number;
          rubric_json?: Record<string, unknown> | null;
          type?: string;
          language?: string;
          is_active?: boolean;
        };
        rubric_json?: Record<string, unknown> | null;
        type?: string;
        is_active?: boolean;
      };
    };
    quiz_sessions: {
      Row: {
        id: string;
        display_name: string;
        fingerprint_hash: string;
        created_at: string;
      };
      Insert: {
        id: string;
        display_name: string;
        fingerprint_hash: string;
      };
      Update: {
        id?: string;
        display_name?: string;
        fingerprint_hash?: string;
      };
    };
    quiz_attempts: {
      Row: {
        id: string;
        session_id: string;
        question_id: string;
        answer_text: string;
        score_ai: number | null;
        score_rule: number | null;
        score_final: number;
        feedback: string | null;
        created_at: string;
      };
      Insert: {
        id: string;
        session_id: string;
        question_id: string;
        answer_text: string;
        score_ai?: number | null;
        score_rule?: number | null;
        score_final: number;
        feedback?: string | null;
      };
      Update: {
        id?: string;
        session_id?: string;
        question_id?: string;
        answer_text?: string;
        score_ai?: number | null;
        score_rule?: number | null;
        score_final?: number;
        feedback?: string | null;
      };
    };
  };
  Views: {
    quiz_leaderboard_global: {
      Row: {
        session_id: string;
        display_name: string;
        avg_score: number;
        best_score: number;
        total_attempts: number;
        first_attempt: string;
        last_attempt: string;
      };
    };
    quiz_leaderboard_category: {
      Row: {
        category_id: string;
        session_id: string;
        display_name: string;
        avg_score: number;
        best_score: number;
        total_attempts: number;
        first_attempt: string;
        last_attempt: string;
      };
    };
  };
  Functions: {
    refresh_leaderboards: {
      Args: Record<PropertyKey, never>;
      Returns: void;
    };
  };
}

// Helper types for the quiz application
export type Category = Database["public"]["Tables"]["quiz_categories"]["Row"];
export type Question = Database["public"]["Tables"]["quiz_questions"]["Row"];
export type Session = Database["public"]["quiz_sessions"]["Row"];
export type Attempt = Database["public"]["quiz_attempts"]["Row"];
export type LeaderboardGlobal = Database["Views"]["quiz_leaderboard_global"]["Row"];
export type LeaderboardCategory =
  Database["Views"]["quiz_leaderboard_category"]["Row"];
