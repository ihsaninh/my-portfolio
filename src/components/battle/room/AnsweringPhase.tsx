"use client";

import { FaBolt, FaCheck, FaStar } from "react-icons/fa";

import { useBattleStore } from "@/src/lib/battle/battle-store";
import type { AnsweringPhaseProps } from "@/src/types/battle";

export function AnsweringPhase({
  onSubmitAnswer,
  iHaveAnswered,
  loading,
}: AnsweringPhaseProps) {
  const {
    state,
    answer,
    setAnswer,
    selectedChoiceId,
    setSelectedChoiceId,
    timeLeft,
  } = useBattleStore();

  const difficultyLabel = (difficulty: number, language: string) => {
    if (language === "id") {
      return difficulty === 1 ? "Mudah" : difficulty === 3 ? "Sulit" : "Sedang";
    }
    return difficulty === 1 ? "Easy" : difficulty === 3 ? "Hard" : "Medium";
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty === 1) return "text-green-400";
    if (difficulty === 3) return "text-red-400";
    return "text-yellow-400";
  };

  if (!state?.activeRound?.question) return null;

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="p-6 rounded-2xl border border-cyan-500/30 bg-cyan-900/20">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {state.activeRound?.roundNo === state?.room?.num_questions
              ? `Final Question (${state.activeRound?.roundNo}/${state?.room?.num_questions})`
              : `Round ${state.activeRound?.roundNo}${
                  state?.room?.num_questions
                    ? `/${state.room.num_questions}`
                    : ""
                }`}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs border ${getDifficultyColor(
                state.activeRound?.question?.difficulty || 0
              )}`}
            >
              {difficultyLabel(
                state.activeRound?.question?.difficulty || 0,
                state.activeRound?.question?.language || ""
              )}
            </span>
            {state.activeRound?.question?.category && (
              <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {state.activeRound.question.category}
              </span>
            )}
          </div>
        </div>
        <p className="text-white text-lg leading-relaxed">
          {state.activeRound?.question?.prompt}
        </p>
      </div>

      {/* Answer Input */}
      {!iHaveAnswered && (
        <div className="space-y-4">
          {state.activeRound?.question?.choices?.length ? (
            <div className="space-y-3">
              {state.activeRound.question.choices.map((c, idx) => {
                const isSelected = selectedChoiceId === c.id;
                return (
                  <label
                    key={c.id}
                    className={`group relative flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    } ${timeLeft === 0 ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {/* Hide the native radio visually but keep it accessible */}
                    <input
                      type="radio"
                      name="mcq"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => setSelectedChoiceId(c.id)}
                      disabled={timeLeft === 0}
                    />
                    {/* Custom radio indicator */}
                    <div
                      className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                        isSelected
                          ? "bg-cyan-500 border-cyan-400 text-white"
                          : "border-white/30 text-transparent group-hover:border-cyan-400"
                      }`}
                      aria-hidden="true"
                    >
                      {isSelected && <FaCheck className="w-3.5 h-3.5" />}
                    </div>
                    {/* Option text with letter badge */}
                    <div className="flex-1 text-white">
                      <div className="font-medium leading-relaxed">
                        <span className="mr-2 inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-white/10 bg-white/10 px-2 text-xs text-white/80">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        {c.text}
                      </div>
                    </div>
                    {timeLeft === 0 && (
                      <div
                        className="absolute inset-0 rounded-xl"
                        aria-hidden="true"
                      />
                    )}
                  </label>
                );
              })}
            </div>
          ) : (
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-32 px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 resize-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
              disabled={timeLeft === 0}
            />
          )}
          <button
            onClick={onSubmitAnswer}
            disabled={
              loading ||
              timeLeft === 0 ||
              (state.activeRound?.question?.choices?.length
                ? !selectedChoiceId
                : !answer.trim())
            }
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FaBolt className="w-5 h-5" />
            )}
            {loading ? "Submitting..." : "Submit Answer"}
          </button>
        </div>
      )}

      {/* Submitted State */}
      {iHaveAnswered && (
        <div className="text-center p-6 rounded-2xl bg-green-900/20 border border-green-500/30">
          <FaStar className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Answer Submitted!
          </h3>
          <p className="text-green-300">
            Waiting for other players to finish...
          </p>
        </div>
      )}
    </div>
  );
}
