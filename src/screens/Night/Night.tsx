import { useState } from "react";
import { PLAYER_ROLES } from "../../constants/player";
import RoleCard from "./RoleCard";
import Knowledge from "./Knowledge";
import type { PlayerDetails } from "../../types/player";

const Night = ({
  player,
  allPlayers,
  onDone,
}: {
  player: PlayerDetails;
  allPlayers: PlayerDetails[];
  onDone: () => void;
}) => {
  const [phase, setPhase] = useState(0); // role | knowledge
  const hasKnowledge = PLAYER_ROLES[player.role]?.hasKnowledge ?? false;
  const phases = hasKnowledge ? ["role", "knowledge"] : ["role"];

  const next = () => {
    if (phase < phases.length - 1) {
      setPhase((i) => i + 1);
    } else {
      onDone();
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] relative">
      <div className="progress-bar max-w-sm mx-auto px-5 pt-4">
        <div className="flex gap-1.5 mb-1">
          {phases.map((p, i) => (
            <div
              key={p}
              className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                i < phase
                  ? "bg-violet-600"
                  : i === phase
                    ? "bg-amber-400"
                    : "bg-indigo-950"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs font-serif text-gray-700 tracking-widest px-0.5">
          <span>
            PHASE {phase + 1} OF {phases.length}
          </span>
          <span>{phases[phase].toUpperCase()}</span>
        </div>
      </div>

      {phases[phase] === "role" && (
        <RoleCard
          player={player}
          hasKnowledge={hasKnowledge}
          onContinue={next}
        />
      )}
      {phases[phase] === "knowledge" && (
        <Knowledge
          player={player}
          allPlayers={allPlayers}
          onDone={next}
        />
      )}
    </div>
  );
};

export default Night;
