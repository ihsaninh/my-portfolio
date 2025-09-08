"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  FaBolt,
  FaClock,
  FaCog,
  FaCopy,
  FaCrown,
  FaGamepad,
  FaStar,
  FaTrophy,
  FaUsers,
} from "react-icons/fa";

type GameMode = "create" | "join" | null;

function BattleLandingContent() {
  const searchParams = useSearchParams();
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [createPayload, setCreatePayload] = useState({
    topic: "",
    hostDisplayName: "",
    language: "en",
    numQuestions: 5,
    roundTimeSec: 60,
    capacity: 4,
  });
  const [joinPlayerName, setJoinPlayerName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string>("");
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-populate join form if roomId is provided in URL
  useEffect(() => {
    const urlRoomId = searchParams?.get("roomId");
    if (urlRoomId) {
      setJoinRoomId(urlRoomId);
      setGameMode("join"); // Automatically switch to join mode
    }
  }, [searchParams]);

  async function ensureSession(name: string) {
    try {
      const res = await fetch("/api/quiz/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: name || "Player" }),
      });
      return res.ok;
    } catch (error) {
      console.error("Session creation error:", error);
      return false;
    }
  }

  async function createRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!createPayload.hostDisplayName.trim()) {
      setLog("Please enter your name to continue");
      return;
    }

    setLoading(true);
    setLog("");
    try {
      // Always ensure session exists first
      const sessionCreated = await ensureSession(createPayload.hostDisplayName);
      if (!sessionCreated) {
        throw new Error("Failed to create session");
      }

      // Small delay to ensure cookie is set
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Now create the room
      const res = await fetch("/api/battle/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create room");

      // Store room ID and switch to success view
      setCreatedRoomId(data.roomId);
      setJoinRoomId(data.roomId);

      // Hide the form and show success message
      setGameMode(null);
    } catch (err: unknown) {
      setLog(
        `Failed to create room: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinRoom(
    nameOverride?: string,
    skipSessionCreation = false
  ) {
    const roomId = joinRoomId;
    const playerName = nameOverride || joinPlayerName || "";

    if (!roomId || !roomId.trim()) {
      setLog("Please enter a valid Room ID");
      return;
    }
    if (!playerName || !playerName.trim()) {
      setLog("Please enter your player name");
      return;
    }

    setLoading(true);
    setLog("");
    try {
      // Create session first (skip if already created during room creation)
      if (!skipSessionCreation) {
        const sessionCreated = await ensureSession(playerName);

        if (!sessionCreated) {
          throw new Error("Failed to create session");
        }

        // Small delay to ensure cookie is set
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Then join the room with the display name
      const res = await fetch(`/api/battle/rooms/${roomId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: playerName }),
        credentials: "include", // Ensure cookies are sent
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to join room");

      // Small delay to ensure the join is processed on the server
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Redirect to room
      window.location.href = `/battle/rooms/${roomId}`;
    } catch (err: unknown) {
      console.error("Join error:", err);
      setLog(
        `Join error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  }

  const copyRoomId = async () => {
    if (createdRoomId) {
      try {
        const fullUrl = `${window.location.origin}/battle?roomId=${createdRoomId}`;
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating orbs */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-32 h-32 rounded-full opacity-20 blur-xl ${
              i % 3 === 0
                ? "bg-gradient-to-br from-purple-400 to-pink-400"
                : i % 3 === 1
                ? "bg-gradient-to-br from-blue-400 to-cyan-400"
                : "bg-gradient-to-br from-emerald-400 to-teal-400"
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl"
              >
                ⚔️
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                BATTLE ARENA
              </h1>
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="text-4xl"
              >
                🏆
              </motion.div>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Challenge your friends in real-time knowledge battles! Choose
              topics, set rounds, and prove who&apos;s the ultimate champion.
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm">
                <FaBolt className="w-4 h-4" /> Real-time sync
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm">
                <FaStar className="w-4 h-4" /> AI questions
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm">
                <FaTrophy className="w-4 h-4" /> Fair scoring
              </span>
            </div>
          </motion.div>

          {/* Game Mode Selection */}
          {!gameMode && !createdRoomId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            >
              {/* Create Room Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setGameMode("create")}
                className="group cursor-pointer relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/50 via-purple-800/30 to-pink-900/50 p-8 backdrop-blur-xl transition-all duration-300 hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-2xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                      <FaCrown className="w-8 h-8 text-purple-300" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        Host Battle
                      </h3>
                      <p className="text-purple-200">
                        Create and lead your own arena
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      <FaCog className="w-4 h-4 text-purple-400" /> Customize
                      game settings
                    </li>
                    <li className="flex items-center gap-2">
                      <FaBolt className="w-4 h-4 text-purple-400" />{" "}
                      AI-generated questions
                    </li>
                    <li className="flex items-center gap-2">
                      <FaUsers className="w-4 h-4 text-purple-400" /> Invite up
                      to 12 players
                    </li>
                  </ul>
                  <div className="mt-6 flex items-center gap-2 text-purple-300 font-semibold">
                    <span>Start Creating</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Join Room Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setGameMode("join")}
                className="group cursor-pointer relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-900/50 via-blue-800/30 to-teal-900/50 p-8 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-teal-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-2xl bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors">
                      <FaGamepad className="w-8 h-8 text-cyan-300" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        Join Battle
                      </h3>
                      <p className="text-cyan-200">Enter an existing arena</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      <FaBolt className="w-4 h-4 text-cyan-400" /> Jump into
                      action instantly
                    </li>
                    <li className="flex items-center gap-2">
                      <FaTrophy className="w-4 h-4 text-cyan-400" /> Compete for
                      the top spot
                    </li>
                    <li className="flex items-center gap-2">
                      <FaStar className="w-4 h-4 text-cyan-400" /> Earn points
                      and glory
                    </li>
                  </ul>
                  <div className="mt-6 flex items-center gap-2 text-cyan-300 font-semibold">
                    <span>Join Now</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Create Room Form */}
          <AnimatePresence>
            {gameMode === "create" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-6 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setGameMode(null)}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
                  >
                    ← Back
                  </button>
                  <h2 className="text-3xl font-bold text-white">
                    🛡️ Create Battle Room
                  </h2>
                </div>

                <form onSubmit={createRoom} className="space-y-6">
                  {/* Basic Info */}
                  <div className="rounded-2xl border border-purple-500/30 bg-purple-900/20 p-6 backdrop-blur-xl">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <FaCrown className="w-6 h-6 text-purple-400" />
                      Host Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">
                          Your Name *
                        </label>
                        <input
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                          placeholder="Enter your battle name"
                          value={createPayload.hostDisplayName}
                          onChange={(e) =>
                            setCreatePayload({
                              ...createPayload,
                              hostDisplayName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">
                          Battle Topic
                        </label>
                        <input
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                          placeholder="e.g., Technology, History (optional)"
                          value={createPayload.topic}
                          onChange={(e) =>
                            setCreatePayload({
                              ...createPayload,
                              topic: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Game Settings */}
                  <div className="rounded-2xl border border-blue-500/30 bg-blue-900/20 p-6 backdrop-blur-xl">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <FaCog className="w-6 h-6 text-blue-400" />
                      Battle Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-2">
                          Language
                        </label>
                        <select
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                          value={createPayload.language}
                          onChange={(e) =>
                            setCreatePayload({
                              ...createPayload,
                              language: e.target.value,
                            })
                          }
                        >
                          <option value="en">🇺🇸 English</option>
                          <option value="id">🇮🇩 Bahasa Indonesia</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-blue-200 mb-2 flex items-center gap-2">
                          <FaUsers className="w-4 h-4" />
                          Max Players: {createPayload.capacity}
                        </label>
                        <input
                          type="range"
                          min={2}
                          max={12}
                          value={createPayload.capacity}
                          onChange={(e) =>
                            setCreatePayload({
                              ...createPayload,
                              capacity: Number(e.target.value),
                            })
                          }
                          className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-xs text-blue-300 mt-1">
                          2-12 players
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-blue-200 mb-2 flex items-center gap-2">
                          <FaBolt className="w-4 h-4" />
                          Questions: {createPayload.numQuestions}
                        </label>
                        <input
                          type="range"
                          min={3}
                          max={10}
                          value={createPayload.numQuestions}
                          onChange={(e) =>
                            setCreatePayload({
                              ...createPayload,
                              numQuestions: Number(e.target.value),
                            })
                          }
                          className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-xs text-blue-300 mt-1">
                          3-10 rounds
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-blue-200 mb-2 flex items-center gap-2">
                          <FaClock className="w-4 h-4" />
                          Round Time: {createPayload.roundTimeSec}s
                        </label>
                        <input
                          type="range"
                          min={15}
                          max={180}
                          step={15}
                          value={createPayload.roundTimeSec}
                          onChange={(e) =>
                            setCreatePayload({
                              ...createPayload,
                              roundTimeSec: Number(e.target.value),
                            })
                          }
                          className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-xs text-blue-300 mt-1">
                          15s - 3min per question
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <FaCrown className="w-5 h-5" />
                      )}
                      {loading ? "Creating..." : "Create Battle Room"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Join Room Form */}
          <AnimatePresence>
            {gameMode === "join" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl mx-auto"
              >
                <div className="mb-6 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setGameMode(null)}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
                  >
                    ← Back
                  </button>
                  <h2 className="text-3xl font-bold text-white">
                    ⚔️ Join Battle
                  </h2>
                </div>

                <div className="rounded-2xl border border-cyan-500/30 bg-cyan-900/20 p-8 backdrop-blur-xl">
                  <div className="text-center mb-6">
                    <FaGamepad className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                    <p className="text-cyan-200 text-lg">
                      {joinRoomId
                        ? "Ready to join this battle!"
                        : "Enter the Room ID to join an existing battle"}
                    </p>
                    {joinRoomId && (
                      <p className="text-cyan-300 text-sm mt-2">
                        Room ID:{" "}
                        <code className="bg-white/10 px-2 py-1 rounded">
                          {joinRoomId}
                        </code>
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-cyan-200 mb-2">
                        Your Name *
                      </label>
                      <input
                        className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all text-center text-lg"
                        placeholder="Enter your battle name"
                        value={joinPlayerName}
                        onChange={(e) => setJoinPlayerName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-cyan-200 mb-2">
                        Room ID *
                      </label>
                      <input
                        className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all text-center text-xl font-mono"
                        placeholder="room-xxxx-xxxx"
                        value={joinRoomId}
                        onChange={(e) => setJoinRoomId(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleJoinRoom()}
                      disabled={
                        loading || !joinRoomId.trim() || !joinPlayerName.trim()
                      }
                      className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <FaGamepad className="w-5 h-5" />
                      )}
                      {loading ? "Joining..." : "Join Battle"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Room Created Success View */}
          <AnimatePresence>
            {createdRoomId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl mx-auto"
              >
                <div className="mb-6 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedRoomId(null);
                      setGameMode(null);
                      setLog("");
                    }}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
                  >
                    ← Back
                  </button>
                  <h2 className="text-3xl font-bold text-white">
                    🏆 Room Created
                  </h2>
                </div>

                <div className="rounded-2xl border border-green-500/30 bg-green-900/20 p-8 backdrop-blur-xl text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <FaTrophy className="w-10 h-10 text-green-400" />
                  </motion.div>

                  <h2 className="text-3xl font-bold text-white mb-2">
                    Room created successfully!
                  </h2>

                  <p className="text-green-200 mb-6">
                    Room ID: <span className="font-bold">{createdRoomId}</span>
                  </p>

                  <p className="text-green-300 mb-6">
                    Share this Room ID with your friends:
                  </p>

                  <div className="flex items-center justify-center gap-3 mb-8">
                    <code className="bg-white/10 px-4 py-3 rounded-xl text-white text-lg font-mono">
                      {createdRoomId}
                    </code>
                    <button
                      onClick={copyRoomId}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors flex items-center gap-2"
                    >
                      <FaCopy className="w-4 h-4" />
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        // Join directly with host name - ensure it's a valid string
                        const hostName = createPayload.hostDisplayName?.trim();
                        if (hostName) {
                          // Skip session creation since it was already done during room creation
                          handleJoinRoom(hostName, true);
                        } else {
                          setLog("Host name is required to join the room");
                        }
                      }}
                      disabled={loading}
                      className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <FaCrown className="w-5 h-5" />
                      )}
                      {loading ? "Joining..." : "Join as Host"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          {log && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="p-4 rounded-xl border text-center bg-red-900/20 border-red-500/30 text-red-300">
                {log}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BattleLanding() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p>Loading battle interface...</p>
          </div>
        </div>
      }
    >
      <BattleLandingContent />
    </Suspense>
  );
}
