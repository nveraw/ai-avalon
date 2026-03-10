import { InitGameResponse } from "@/types/api.types";
import { useState } from "react";
import Knowledge from "./Knowledge";
import RoleCard from "./RoleCard";

type NightProps = {
  playerNames: string[];
  knowledge: InitGameResponse;
  onDone: () => void;
};

const Night = ({ playerNames, onDone, knowledge }: NightProps) => {
  const [phase, setPhase] = useState(0); // role | knowledge
  const hasKnowledge = knowledge?.humanRole.indexOf("loyal") === -1;
  const phases = hasKnowledge ? ["role", "knowledge"] : ["role"];

  const next = () => {
    if (phase < phases.length - 1) {
      setPhase((i) => i + 1);
    } else if (knowledge) {
      onDone();
    }
  };

  if (!knowledge) return null;

  return (
    <div className="min-h-56px relative">
      {phases[phase] === "role" && (
        <RoleCard
          name={playerNames[0]}
          humanRole={knowledge.humanRole}
          hasKnowledge={hasKnowledge}
          onContinue={next}
        />
      )}
      {phases[phase] === "knowledge" && (
        <Knowledge
          humanRole={knowledge.humanRole}
          playerRevelation={knowledge.playerRevelation}
          onDone={next}
        />
      )}
    </div>
  );
};

export default Night;
