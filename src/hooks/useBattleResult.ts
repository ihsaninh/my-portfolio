import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type FinalScoreEntry = {
  session_id: string;
  display_name: string;
  total_score: number;
  is_host?: boolean;
};

type UserAnswer = {
  id: string;
  roundNo: number;
  question: {
    prompt: string;
    difficulty: number;
    language: string;
    category?: string;
  } | null;
  answer: string;
  score: number;
  feedback: string;
  // Optional MCQ fields
  correctAnswer?: string;
  isCorrect?: boolean;
  timeMs?: number | null;
};

type UserAnswersResponse = {
  roomId: string;
  totalAnswers: number;
  answers: UserAnswer[];
};

type RoomStats = {
  room?: {
    id: string;
    topic?: string;
    language: string;
    num_questions: number;
    status: string;
  };
  participants?: FinalScoreEntry[];
  currentUser?: {
    session_id: string;
    display_name: string;
    total_score: number;
  };
};

type ScoreboardEntry = {
  sessionId: string;
  displayName: string;
  totalScore: number;
};

export function useBattleResult() {
  const params = useParams<{ id: string }>();
  const roomId = params?.id;
  const [results, setResults] = useState<RoomStats | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswersResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [answersLoading, setAnswersLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const fetchResults = async () => {
      try {
        // Fire both requests concurrently
        const resultsPromise = fetch(`/api/battle/rooms/${roomId}/state`, {
          credentials: "include",
          cache: "no-store",
        }).then((r) => r.json());

        const answersPromise = fetch(`/api/battle/rooms/${roomId}/my-answers`, {
          credentials: "include",
          cache: "no-store",
        });

        // Render main result as soon as it's ready
        const [resultsData] = await Promise.all([resultsPromise]);
        setResults(resultsData);
        setLoading(false);
        setTimeout(() => setShowConfetti(true), 300);

        // Complete answers without blocking main UI
        const answersResponse = await answersPromise;
        if (answersResponse.ok) {
          const answersData = await answersResponse.json();
          setUserAnswers(answersData);
        }
        setAnswersLoading(false);
      } catch (error) {
        console.error("Failed to fetch results:", error);
        setLoading(false);
        setAnswersLoading(false);
      }
    };

    fetchResults();
  }, [roomId]);

  const [sortedParticipants, setSortedParticipants] = useState<
    FinalScoreEntry[]
  >([]);

  useEffect(() => {
    if (!results?.participants) return;
    // Try to fetch scoreboard for tie-breaker
    const fetchBoard = async () => {
      try {
        const res = await fetch(`/api/battle/rooms/${roomId}/scoreboard`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.scoreboard?.length) {
            const ordered = data.scoreboard.map((b: ScoreboardEntry) => {
              const p = results.participants!.find(
                (x) => x.session_id === b.sessionId
              );
              return {
                session_id: b.sessionId,
                display_name: b.displayName,
                total_score: b.totalScore,
                is_host: p?.is_host,
              } as FinalScoreEntry;
            });
            setSortedParticipants(ordered);
            return;
          }
        }
      } catch {}
      // Fallback: sort by score only
      const fallback = [...(results.participants || [])]
        .map((p) => ({
          session_id: p.session_id,
          display_name: p.display_name,
          total_score: p.total_score,
          is_host: p.is_host,
        }))
        .sort((a, b) => (b.total_score || 0) - (a.total_score || 0));
      setSortedParticipants(fallback);
    };
    fetchBoard();
  }, [results?.participants, roomId]);

  const winner = sortedParticipants[0];
  const currentUserRank =
    sortedParticipants.findIndex(
      (p) => p.session_id === results?.currentUser?.session_id
    ) + 1;

  const shareResults = () => {
    const text = `I just completed a quiz battle! 🏆 Final score: ${
      results?.currentUser?.total_score || 0
    } points. Check out the results!`;
    const resultUrl = `${window.location.origin}/battle/result/${roomId}`;

    if (navigator.share) {
      navigator.share({
        title: "Quiz Battle Results",
        text,
        url: resultUrl,
      });
    } else {
      navigator.clipboard.writeText(text + " " + resultUrl);
      alert("Results copied to clipboard!");
    }
  };

  return {
    // State values
    roomId,
    results,
    userAnswers,
    loading,
    answersLoading,
    showConfetti,
    showAnswers,
    sortedParticipants,
    winner,
    currentUserRank,

    // State setters
    setShowAnswers,

    // Functions
    shareResults,
  };
}
