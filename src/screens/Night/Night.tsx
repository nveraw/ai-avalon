import type { PlayerDetails } from "@/types/Player";
import { useState } from "react";
import Knowledge from "./Knowledge";
import RoleCard from "./RoleCard";

type NightProps = {
  player: PlayerDetails;
  allPlayers: PlayerDetails[];
  onDone: () => void;
}

const Night = ({
  player,
  allPlayers,
  onDone,
}: NightProps) => {
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
