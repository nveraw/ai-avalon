import { useEffect, useState } from "react";
import type { PlayerDetails } from "../types/player";
import GoldButton from "../components/GoldButton";

type TeamSelectionProps = {
  allPlayers: PlayerDetails[];
  teamSize: number;
  leader: PlayerDetails;
  player: PlayerDetails;
  onConfirm: (selected: PlayerDetails[]) => void;
};

const TeamSelection = ({
  allPlayers,
  player,
  teamSize,
  leader,
  onConfirm,
}: TeamSelectionProps) => {
  // ── Human IS the leader: interactive picker ──────────────────────────────
  const [selected, setSelected] = useState<PlayerDetails[]>([]);
  const handleToggleSelection = (p: PlayerDetails) => {
    if (selected.includes(p))
      setSelected((s) => s.filter((x) => x !== p));
    else if (selected.length < teamSize) setSelected((s) => [...s, p]);
  };

  // ── Human is NOT leader: AI picks, human watches ─────────────────────────
  const [aiPhase, setAiPhase] = useState<"thinking" | "reveal" | "done">(
    "thinking",
  );

  // run once per mount
  useEffect(() => {
    if (leader.name === player.name) return;

    // Simulate AI "thinking" then pick randomly
    const thinkDelay = 1600;
    const timer = setTimeout(() => {
      // Random pick of teamSize indices from all players
      const pool = allPlayers.map((_, i) => i);
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const pick = shuffled.slice(0, teamSize);
      setAiPhase("reveal");

      // Stagger highlight each picked player
      pick.forEach((playerIdx, i) => {
        setTimeout(() => setSelected(s => [...s, allPlayers[playerIdx]]), i * 420);
      });

      // Transition to "done" after all revealed
      setTimeout(() => setAiPhase("done"), pick.length * 420 + 600);
    }, thinkDelay);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buttonLabel = leader.name !== player.name
  ? aiPhase === "done" ? "⚔️ Send This Fellowship" : "Picking..."
  : selected.length === teamSize ? "⚔️ Propose This Team" : `Select ${teamSize - selected.length} more knight${teamSize - selected.length !== 1 ? "s" : ""}`;

  return (
    <div className="max-w-lg mx-auto px-5 py-8">
      <div className="text-center mb-7">
        <div className="text-[11px] text-purple-600 tracking-[4px] font-serif">
          TEAM SELECTION
        </div>
        {leader.name === player.name ? (
          <>
            <h2 className="cinzel text-amber-400 text-2xl mt-2">
              Choose Your Fellowship
            </h2>
            <p className="text-gray-500 font-serif text-sm mt-1">
              <span className="text-violet-400">{leader.name}</span> must choose{" "}
              {teamSize} knights
            </p>
          </>
        ) : (
          <>
            <h2 className="cinzel text-amber-400 text-2xl mt-2">
              {aiPhase === "thinking"
                ? "The Leader Deliberates..."
                : "Fellowship Chosen"}
            </h2>
            <p className="text-gray-500 font-serif text-sm mt-1">
              <span className="text-violet-400">{leader.name}</span> is choosing{" "}
              {teamSize} knights
            </p>
          </>
        )}
      </div>

      {/* Thinking spinner */}
      {leader !== player && aiPhase === "thinking" && (
        <div className="text-center py-8">
          <div className="text-5xl mb-5">👑</div>
          <p className="font-serif text-gray-500 text-sm mb-4">
            {leader.name} studies the table in silence...
          </p>
          <div className="flex gap-1.5 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className=""
                style={{ animationDelay: `${i * 0.25}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Player grid — lights up as AI picks */}
      <div
        className={`${aiPhase === "reveal" || aiPhase === "done" ? "" : ""}`}
      >
        <div className="grid grid-cols-2 gap-3 mb-7">
          {allPlayers.map((p) => {
            const isRevealed = selected.includes(p);
            const isLeaderToken = p.name === leader.name;
            return (
              <div
                role="button"
                key={p.name}
                onClick={() => {
                  if (leader.name === player.name) handleToggleSelection(p);
                }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-500 ${
                  isRevealed
                    ? "bg-amber-950/20 border-amber-700 shadow-[0_0_14px_#d4af3722]"
                    : isLeaderToken
                      ? "bg-violet-950/20 border-violet-800"
                      : "bg-slate-950 border-indigo-950 opacity-50"
                } ${leader.name === player.name ? "cursor-pointer" : ""}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-serif font-bold text-slate-200 border-2 transition-all duration-500 ${
                    isRevealed
                      ? "border-amber-400 token-selected"
                      : isLeaderToken
                        ? "border-violet-500 token-base"
                        : "border-indigo-800 token-base"
                  }`}
                >
                  {isLeaderToken ? "👑" : p.name[0]}
                </div>
                <div className="flex-1">
                  <div
                    className={`font-serif text-sm transition-colors duration-300
                    ${isRevealed ? "text-amber-200" : "text-slate-400"}`}
                  >
                    {p.name}
                  </div>
                  {isLeaderToken && (
                    <div className="text-[10px] text-violet-400">Leader</div>
                  )}
                </div>
                {isRevealed && (
                  <span className="">
                    ✦
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Slot indicators */}
        <div className="flex gap-2.5 justify-center mb-7">
          {Array.from({ length: teamSize }).map((_, i) => {
            return (
              <div
                key={i}
                className={`w-11 h-11 rounded-full flex items-center justify-center
                text-sm font-serif font-bold border-2 transition-all duration-500
                ${
                  selected[i] !== undefined
                    ? "border-amber-400 bg-amber-950/20 text-amber-400"
                    : "border-indigo-900 bg-slate-950/80 text-indigo-800"
                }`}
              >
                {selected[i] !== undefined ? selected[i].name[0] : "?"}
              </div>
            );
          })}
        </div>

        <GoldButton
          onClick={() => onConfirm(selected)}
          disabled={selected.length !== teamSize}
        >
          {buttonLabel}
        </GoldButton>
      </div>
    </div>
  );
};

export default TeamSelection;
