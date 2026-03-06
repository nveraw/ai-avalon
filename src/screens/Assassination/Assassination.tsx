import { useEffect, useState } from "react";
import type { PlayerDetails } from "../../types/player";
import SectionLabel from "../../components/SectionLabel";
import AssassinationView from "./AssassinationView";

type AssassinationProps = {
  player: PlayerDetails;
  allPlayers: PlayerDetails[];
  onReveal: (toKill: PlayerDetails) => void;
};

const Assassination = ({
  player,
  allPlayers,
  onReveal,
}: AssassinationProps) => {
  const [target, setTarget] = useState<PlayerDetails | null>(null);

  useEffect(() => {
    // ai bot choose merlin to assassinate
    // setTimeout(() => onReveal(), 2200);
  }, []);

  const assassin = allPlayers.find((p) => p.role === "assassin")?.name

  if (!assassin) return null;

  if (player.role !== "assassin") {
    return (
      <AssassinationView assassinName={assassin} />
    );
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
          {allPlayers.filter(p => p.role !== "assassin").map((player) => (
            <div
              key={player.name}
              onClick={() => setTarget(player)}
              className={`p-3.5 rounded-xl cursor-pointer transition-all border font-serif text-sm
                ${
                  target?.name === player.name
                    ? "bg-red-800/30 border-red-600 text-red-300 shadow-[0_0_12px_#dc262633]"
                    : "bg-slate-950/80 border-red-950/50 text-gray-400 hover:border-red-900"
                }`}
            >
              <div className="text-xl mb-1">
                {target?.name === player.name ? "🎯" : "👤"}
              </div>
              {player.name}
            </div>
          ))}
        </div>
      </div>

      <button
        disabled={target === null}
        onClick={() => {
          if (target !== null) onReveal(target);
        }}
        className={`w-full py-4 rounded-xl cinzel text-base tracking-widest transition-all border
          ${
            target !== null
              ? "bg-linear-to-br from-red-900 to-red-950 border-red-600 text-red-300 cursor-pointer hover:brightness-110 shadow-[0_0_20px_#dc262622]"
              : "bg-slate-950 border-red-950/30 text-gray-600 cursor-not-allowed"
          }`}
      >
        🗡 Strike the Killing Blow
      </button>
    </div>
  );
};

export default Assassination;
