import CardBox from "@/components/CardBox";
import GoldDivider from "@/components/GoldDivider";
import SectionLabel from "@/components/SectionLabel";
import { assassinate } from "@/services/api";
import { messagesAtom } from "@/store/chat";
import { AssassinationResponse } from "@/types/api.types";
import type { PlayerDetails } from "@/types/game.types";
import { useSetAtom } from "jotai";
import { useState } from "react";

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
  const addMessages = useSetAtom(messagesAtom);

  const handleClick = async () => {
    if (player.role === "assassin") {
      setAssassinName(player.name);
      if (!target) return;
    }
    const res = await handleAssassination();
    onReveal(res);
  };

  const handleAssassination = async () => {
    const res = await assassinate({
      name: target,
    });
    addMessages(res.messages);
    setAssassinName(
      res?.players?.find((p) => p.role === "assassin")?.name || "",
    );
    return res;
  };

  return (
    <div className="max-w-lg mx-auto px-5 py-10 text-center">
      <div className="mb-8">
        <div className="text-5xl mb-3 animate-bounce">🗡</div>
        <div className="text-xs text-red-500 tracking-hero font-serif">
          FINAL JUDGMENT
        </div>
        <h2 className="cinzel text-red-400 text-3xl mt-2">The Assassination</h2>

        {player.role === "assassin" ? (
          <p className="text-gray-400 font-serif text-sm leading-relaxed mt-3">
            Good has prevailed on the quests... but the blade still threatens.
            <br />
            <span className="text-red-500">
              The Assassin must identify Merlin.
            </span>
          </p>
        ) : (
          <CardBox className="border-red-950/60 text-center">
            <p className="font-serif text-gray-300 text-sm leading-relaxed mb-2">
              Good has triumphed on the quests...
            </p>
            <p className="font-serif text-red-400 text-sm leading-relaxed">
              But <span className="cinzel text-red-300">{assassinName}</span>{" "}
              steps forward from the shadows. One blade remains.
            </p>
            <GoldDivider />
            <p className="font-serif text-gray-500 text-xs italic">
              Even in victory, you are not safe. I know who Merlin is.
            </p>
          </CardBox>
        )}
      </div>

      {player.role === "assassin" && (
        <div className="bg-red-950/20 border border-red-950 rounded-2xl p-6 mb-6">
          <SectionLabel className="text-red-500 text-center">
            SELECT THE TARGET
          </SectionLabel>
          <div className="grid grid-cols-2 gap-2.5">
            {playerNames
              .filter((name) => name !== assassinName)
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
      )}

      <button
        disabled={player.role === "assassin" && !target}
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
