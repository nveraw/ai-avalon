import SectionLabel from "@/components/SectionLabel";
import { assassinate } from "@/lib/api";
import { addMessagesAtom } from "@/store/chat";
import { AssassinationResponse } from "@/types/api.types";
import type { PlayerDetails } from "@/types/player.types";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import AssassinationView from "./AssassinationView";

type AssassinationProps = {
  player: PlayerDetails;
  playerNames: string[];
  onReveal: (res: AssassinationResponse) => void;
};

const Assassination = ({
  player,
  playerNames,
  onReveal,
}: AssassinationProps) => {
  const [target, setTarget] = useState<string>("");
  const [assassinName, setAssassinName] = useState<string>("");
  const [data, setData] = useState<AssassinationResponse>();
  const addMessages = useSetAtom(addMessagesAtom);

  useEffect(() => {
    if (player.role !== "assassin") {
      handleAssassination();
    } else {
      setAssassinName(player.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  const handleClick = async () => {
    if (player.role === "assassin") {
      handleAssassination();
    } else {
      setTarget(data?.targetName || "");
    }
  };

  const handleAssassination = async () => {
    const res = await assassinate({
      name: target,
    });
    addMessages(res.messages);
    setData(res);
    setAssassinName(
      data?.players?.find((p) => p.role === "assassin")?.name || "",
    );
  };

  // !TRICK:
  // when bot assassinate, there is no target until user click button
  // when user assassinate, there is no data until user click button
  // only when button is clicked, will we move to the next screen
  useEffect(() => {
    if (target && data?.targetName) {
      onReveal(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, data]);

  if (player.role !== "assassin") {
    return <AssassinationView assassinName={assassinName} />;
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-10 text-center">
      <div className="mb-8">
        <div className="text-5xl mb-3 animate-bounce">🗡</div>
        <div className="text-xs text-red-500 tracking-hero font-serif">
          FINAL JUDGMENT
        </div>
        <h2 className="cinzel text-red-400 text-3xl mt-2">The Assassination</h2>
        <p className="text-gray-400 font-serif text-sm leading-relaxed mt-3">
          Good has prevailed on the quests... but the blade still threatens.
          <br />
          <span className="text-red-500">
            The Assassin must identify Merlin.
          </span>
        </p>
      </div>

      <div className="bg-red-950/20 border border-red-950 rounded-2xl p-6 mb-6">
        <SectionLabel className="text-red-500 text-center">
          SELECT THE TARGET
        </SectionLabel>
        <div className="grid grid-cols-2 gap-2.5">
          {playerNames
            .filter((name) => name === assassinName)
            .map((name) => (
              <div
                key={name}
                onClick={() => setTarget(name)}
                className={`p-3.5 rounded-xl cursor-pointer transition-all border font-serif text-sm ${
                  target === name
                    ? "bg-red-800/30 border-red-600 text-red-300"
                    : "bg-slate-950/80 border-red-950/50 text-gray-400 hover:border-red-900"
                }`}
              >
                <div className="text-xl mb-1">
                  {target === name ? "🎯" : "👤"}
                </div>
                {name}
              </div>
            ))}
        </div>
      </div>

      <button
        disabled={target === null}
        onClick={handleClick}
        className="w-full py-4 rounded-xl cinzel text-base tracking-widest transition-all border
          bg-linear-to-br from-red-900 to-red-950 border-red-600 text-red-300 cursor-pointer hover:brightness-110
          disabled:bg-slate-950 disabled:border-red-950/30 disabled:text-gray-600 disabled:cursor-not-allowed"
      >
        🗡 Strike the Killing Blow
      </button>
    </div>
  );
};

export default Assassination;
