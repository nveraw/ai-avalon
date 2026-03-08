import { startGame } from "@/lib/api";
import { InitGameResponse } from "@/types/api.types";
import { useEffect, useState } from "react";
import Knowledge from "./Knowledge";
import RoleCard from "./RoleCard";

type NightProps = {
  playerNames: string[];
  onDone: (res: InitGameResponse) => void;
};

const Night = ({ playerNames, onDone }: NightProps) => {
  const [data, setData] = useState<InitGameResponse>();
  const [phase, setPhase] = useState(0); // role | knowledge
  const hasKnowledge = data?.humanRole.indexOf("loyal") === -1;
  const phases = hasKnowledge ? ["role", "knowledge"] : ["role"];

  // run once for starting game
  useEffect(() => {
    const fetchData = async () => {
      const res = await startGame({ playerNames });
      setData(res);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const next = () => {
    if (phase < phases.length - 1) {
      setPhase((i) => i + 1);
    } else if (data) {
      onDone(data);
    }
  };

  if (!data) return null;

  return (
    <div className="min-h-56px relative">
      {phases[phase] === "role" && (
        <RoleCard
          name={playerNames[0]}
          humanRole={data.humanRole}
          hasKnowledge={hasKnowledge}
          onContinue={next}
        />
      )}
      {phases[phase] === "knowledge" && (
        <Knowledge
          humanRole={data.humanRole}
          playerRevelation={data.playerRevelation}
          onDone={next}
        />
      )}
    </div>
  );
};

export default Night;
