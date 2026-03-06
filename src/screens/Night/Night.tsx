import { useState } from "react";
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
  const hasKnowledge = String(player.role).indexOf("loyal") === -1;
  const phases = hasKnowledge ? ["role", "knowledge"] : ["role"];

  const next = () => {
    if (phase < phases.length - 1) {
      setPhase((i) => i + 1);
    } else {
      onDone();
    }
  };

  return (
    <div className="min-h-56px relative">
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
