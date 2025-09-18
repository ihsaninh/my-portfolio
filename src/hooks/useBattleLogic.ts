import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTimeout } from "usehooks-ts";

import { useBattleActions } from "@/src/hooks/useBattleActions";
import { useHostDetection } from "@/src/hooks/useHostDetection";
import { useRealtime } from "@/src/hooks/useRealtime";
import { useBattleRoomState } from "@/src/hooks/useRoomState";
import { useTimer } from "@/src/hooks/useTimer";
import { useBattleStore } from "@/src/lib/battle/battle-store";

export function useBattleLogic() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const roomId = useMemo(() => params?.id, [params]);
  const hasRedirectedRef = useRef(false);

  // Local state for timeouts
  const [shouldResetCopy, setShouldResetCopy] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Use the smaller hooks
  const { state, answerStatus, stateLoading, refresh, forceStateSync } =
    useBattleRoomState();

  const { isHost } = useHostDetection(roomId, state);

  const {
    copyRoomLink,
    startBattle,
    submitAnswer,
    autoCloseRound,
    formatTime,
    difficultyLabel,
    getDifficultyColor,
    getRoomStatusColor,
    startBattleLoading,
    submitAnswerLoading,
  } = useBattleActions(roomId, state, refresh);

  const { timeLeft } = useTimer(state, autoCloseRound);

  // Initialize realtime with dependencies
  useRealtime(roomId, state, refresh, autoCloseRound);

  // Reset copy state after 2 seconds using useTimeout
  useTimeout(
    () => {
      useBattleStore.getState().setCopied(false);
      setShouldResetCopy(false);
    },
    shouldResetCopy ? 2000 : null
  );

  // Redirect to results after 2.5 seconds using useTimeout
  useTimeout(
    () => {
      if (!roomId) return;
      router.replace(`/battle/result/${roomId}`);
      setShouldRedirect(false);
    },
    shouldRedirect ? 2500 : null
  );

  // Use Zustand store for UI state only
  const {
    // Game state
    gamePhase,
    answer,
    hasSubmitted,
    loading,
    copied,
    isProgressing,
    connectionState,
    connectionError,
    notifications,
    answeredCount,
    selectedChoiceId,

    // Actions
    // Note: Actions are handled by smaller hooks
  } = useBattleStore();

  // Compute whether server already recorded my answer (to avoid UI flicker)
  const mySessionId = useMemo(() => {
    return (
      state?.currentUser?.session_id ||
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("quiz_session_id="))
        ?.split("=")[1] ||
      null
    );
  }, [state?.currentUser?.session_id]);

  const serverMarkedAnswered = useMemo(() => {
    if (!answerStatus?.participants || !mySessionId) return null;
    const me = answerStatus.participants.find(
      (p: { session_id: string; has_answered: boolean }) =>
        p.session_id === mySessionId
    );
    return me?.has_answered ?? null;
  }, [answerStatus?.participants, mySessionId]);

  const iHaveAnswered = hasSubmitted || serverMarkedAnswered === true;

  // Redirect when gamePhase becomes finished (most robust trigger)
  useEffect(() => {
    if (hasRedirectedRef.current) return;
    if (gamePhase !== "finished") return;
    if (state?.room?.status !== "finished") return;

    hasRedirectedRef.current = true;
    setShouldRedirect(true);
  }, [gamePhase, state?.room?.status]);

  return {
    // State values
    roomId,
    gamePhase,
    timeLeft,
    hasSubmitted,
    loading:
      loading || stateLoading || startBattleLoading || submitAnswerLoading,
    copied,
    isProgressing,
    connectionState,
    connectionError,
    state,
    notifications,
    answeredCount,
    answerStatus,
    iHaveAnswered,
    answer,
    selectedChoiceId,

    // Functions
    copyRoomLink,
    refresh,
    forceStateSync,
    startBattle,
    submitAnswer,
    autoCloseRound,
    formatTime,
    difficultyLabel,
    getDifficultyColor,
    getRoomStatusColor,

    // Derived values
    isHost: isHost(),
  };
}
