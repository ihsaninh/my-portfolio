const STATUS_COLOR_MAP: Record<string, string> = {
  waiting: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  finished: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export const formatBattleTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.max(0, seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const getDifficultyLabel = (
  difficulty: number,
  language: string
): string => {
  const isIndonesian = language === "id";
  if (difficulty === 1) {
    return isIndonesian ? "Mudah" : "Easy";
  }
  if (difficulty === 3) {
    return isIndonesian ? "Sulit" : "Hard";
  }
  return isIndonesian ? "Sedang" : "Medium";
};

export const getDifficultyColor = (difficulty: number): string => {
  if (difficulty === 1) return "text-green-400";
  if (difficulty === 3) return "text-red-400";
  return "text-yellow-400";
};

export const getRoomStatusColor = (status: string): string => {
  return STATUS_COLOR_MAP[status] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30";
};
