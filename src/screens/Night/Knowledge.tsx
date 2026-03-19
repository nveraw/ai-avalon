import GoldButton from "@/components/GoldButton";
import Header from "@/components/Header";
import { PLAYER_ROLES } from "@/constants/playerRoles";
import type { PlayerRole } from "@/types/game.types";

type KnowledgeProps = {
  knowledge: {
    humanRole: PlayerRole;
    playerRevelation: string[];
  };
  onDone: () => void;
};

const Knowledge = ({
  knowledge: { humanRole, playerRevelation },
  onDone,
}: KnowledgeProps) => {
  const knowledge = PLAYER_ROLES[humanRole].knowledge;

  const cardStyle =
    {
      evil: "bg-red-950/25 border-red-900/60",
      ambiguous: "bg-violet-950/25 border-violet-800/60",
      none: "bg-indigo-950/20 border-indigo-900/40",
    }[knowledge.type] || "bg-indigo-950/20 border-indigo-900/40";

  const iconBg = {
    evil: "bg-red-950 border-red-800",
    ambiguous: "bg-violet-950 border-violet-700",
    none: "bg-indigo-950 border-indigo-800",
  }[knowledge.type];

  const orbBgBorder = {
    evil: "bg-[radial-gradient(circle,#3b0a0a,#050310)] border-red-900",
    ambiguous: "bg-[radial-gradient(circle,#1e0a3d,#050310)] border-violet-800",
    none: "bg-[radial-gradient(circle,#1a0a3d,#050310)] border-indigo-900",
  }[knowledge.type];

  return (
    <div className="max-w-sm mx-auto px-5 py-8 text-center">
      <Header
        title="NIGHT VISION"
        subtitle={knowledge.flavour}
        description={knowledge.desc}
      >
        <div
          className={`atmospheric-orb w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl ${
            orbBgBorder
          } border-2 mt-5 animate-bounce [animation-duration:3s]`}
        >
          {knowledge.type === "evil"
            ? "🔱"
            : knowledge.type === "ambiguous"
              ? "✦"
              : "🌑"}
        </div>
      </Header>

      {playerRevelation.length > 0 ? (
        <div
          className={`grid gap-2.5 my-6 ${playerRevelation.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
        >
          {playerRevelation.map((name) => (
            <div
              key={name}
              className={`border rounded-xl p-4 animate-pulse [animation-duration:3s] ${cardStyle}`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  iconBg
                } text-xl font-serif font-bold text-slate-200 border-2 mx-auto mb-3`}
              >
                {name[0]}
              </div>
              <div className="cinzel text-slate-100 text-sm mb-1">{name}</div>
              <div
                className={`text-xs tracking-widest font-serif ${
                  knowledge.type === "evil" ? "text-red-400" : "text-violet-400"
                }`}
              >
                {knowledge.seenPlayer}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="my-6">
          <p className="font-serif text-gray-600 text-sm italic">
            No one reveals themselves to you tonight.
          </p>
        </div>
      )}

      <div className="warning flex items-start gap-3 bg-amber-950/20 border border-amber-500/40 rounded-xl px-4 py-3 mb-5 text-left">
        <span className="text-amber-500 text-base mt-0.5 shrink-0">⚠</span>
        <p className="font-serif text-amber-200/60 text-xs leading-relaxed">
          Memorise this. Once you proceed, this screen closes forever. Pass the
          device face-down to the next player.
        </p>
      </div>

      <GoldButton onClick={onDone}>I&apos;ve seen enough</GoldButton>
    </div>
  );
};

export default Knowledge;
