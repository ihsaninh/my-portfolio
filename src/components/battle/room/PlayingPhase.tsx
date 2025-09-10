"use client";

import { motion } from "framer-motion";
import { FaClock, FaGamepad } from "react-icons/fa";

import { useBattleStore } from "@/src/lib/battle-store";

export function PlayingPhase() {
  const { isProgressing, state } = useBattleStore();

  return (
    <div className="text-center space-y-4">
      {isProgressing ? (
        <>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <FaClock className="w-16 h-16 text-orange-400 mx-auto" />
          </motion.div>
          <h3 className="text-xl font-semibold text-white">
            {state?.room?.num_questions &&
            state?.room?.status === "active" &&
            !state.activeRound
              ? "Calculating Final Results..."
              : "Preparing Next Round..."}
          </h3>
          <p className="text-gray-300">
            {state?.room?.num_questions &&
            state?.room?.status === "active" &&
            !state.activeRound
              ? "The battle is finishing up. Final scores are being calculated."
              : "The next question is being prepared automatically."}
          </p>
        </>
      ) : (
        <>
          <FaGamepad className="w-16 h-16 text-purple-400 mx-auto" />
          <h3 className="text-xl font-semibold text-white">Get Ready!</h3>
          <p className="text-gray-300">The next round is about to begin...</p>
        </>
      )}
    </div>
  );
}
