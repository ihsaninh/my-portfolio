export interface Database {
  public: {
    Tables: {
      categories: {
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
      questions: {
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
      sessions: {
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
      attempts: {
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
      leaderboard_global: {
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
      leaderboard_category: {
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
  };
}

// Helper types for the quiz application
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Question = Database["public"]["Tables"]["questions"]["Row"];
export type Session = Database["public"]["Tables"]["sessions"]["Row"];
export type Attempt = Database["public"]["Tables"]["attempts"]["Row"];
export type LeaderboardGlobal =
  Database["public"]["Views"]["leaderboard_global"]["Row"];
export type LeaderboardCategory =
  Database["public"]["Views"]["leaderboard_category"]["Row"];
