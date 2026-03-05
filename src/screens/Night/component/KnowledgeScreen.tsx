import GoldButton from "../../../components/GoldButton";
import { PLAYER_ROLES } from "../../../constants/player";
import type { PlayerDetails, PlayerRole } from "../../../types/player";

function buildKnowledge(myRole: PlayerRole, allPlayers: PlayerDetails[]) {
  if (myRole === "merlin") {
    return {
      flavour: "Your eyes open to the darkness...",
      desc: "These servants of evil are known to you. Remember their faces — but guard your knowledge carefully.",
      type: "evil",
      players: allPlayers
        .filter(
          (p: PlayerDetails) =>
            !["mordred", "oberon"].includes(p.role) &&
            PLAYER_ROLES[p.role]?.team === "evil",
        )
        .map((p: PlayerDetails) => ({
          name: p.name,
          label: "Servant of Evil",
          icon: "🔱",
        })),
    };
  }

  if (myRole === "percival") {
    return {
      flavour: "Two figures emerge from the veil...",
      desc: "One wields the light of Merlin. The other wears a mask. You cannot tell them apart.",
      type: "ambiguous",
      players: allPlayers
        .filter((p: PlayerDetails) => ["merlin", "morgana"].includes(p.role))
        .map((p: PlayerDetails) => ({
          name: p.name,
          label: "Merlin?",
          icon: "✨",
        })),
    };
  }

  if (PLAYER_ROLES[myRole]?.team === "evil" && myRole !== "oberon") {
    return {
      flavour: "Your allies step out of the shadows...",
      desc: "These players stand with you in darkness. Their exact roles are hidden — even from each other.",
      type: "evil",
      players: allPlayers
        .filter(
          (p: PlayerDetails) =>
            p.role !== "oberon" &&
            p.role !== myRole &&
            PLAYER_ROLES[p.role]?.team === "evil",
        )
        .map((p: PlayerDetails) => ({
          name: p.name,
          label: "Evil Ally",
          icon: "🔱",
        })),
    };
  }

  return {
    flavour: "The night reveals nothing to you.",
    desc:
      myRole === "oberon"
        ? "You are Oberon — isolated, unknown. Your allies do not know you, and you do not know them."
        : "You are a loyal servant. No special knowledge is granted to you. Watch, listen, and deduce.",
    type: "none",
    players: [],
  };
}

const KnowledgeScreen = ({
  player,
  allPlayers,
  onDone,
}: {player: PlayerDetails; allPlayers: PlayerDetails[], onDone: () => void}) => {
  const knowledge = buildKnowledge(player.role, allPlayers);

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

  return (
    <div className="max-w-sm mx-auto px-5 py-8 text-center">
      <div className="text-[10px] text-purple-700 tracking-[4px] font-serif mb-2">
        NIGHT VISION
      </div>
      <div
        className={`atmospheric-orb w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl
        border-2 mb-5 animate-bounce [animation-duration:3s] ${
          knowledge.type === "evil"
            ? "bg-[radial-gradient(circle,#3b0a0a,#050310)] border-red-900 shadow-[0_0_40px_#7f1d1d55]"
            : knowledge.type === "ambiguous"
              ? "bg-[radial-gradient(circle,#1e0a3d,#050310)] border-violet-800 shadow-[0_0_40px_#6d28d955]"
              : "bg-[radial-gradient(circle,#1a0a3d,#050310)] border-indigo-900 shadow-[0_0_30px_#1e1b4b55]"
        }`}
      >
        {knowledge.type === "evil" ? "🔱" : knowledge.type === "ambiguous" ? "✦" : "🌑"}
      </div>

      <h2 className="cinzel text-amber-400 text-xl mb-2">{knowledge.flavour}</h2>
      <p className="font-serif text-gray-400 text-sm leading-relaxed mb-6">
        {knowledge.desc}
      </p>

      {knowledge.players.length > 0 ? (
        <div
          className={`grid gap-2.5 mb-6 ${knowledge.players.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
        >
          {knowledge.players.map((p, i) => (
            <div
              key={i}
              className={`border rounded-xl p-4 animate-pulse [animation-duration:3s] ${cardStyle}`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center
                text-xl font-serif font-bold text-slate-200 border-2 mx-auto mb-3 ${iconBg}`}
              >
                {p.name[0]}
              </div>
              <div className="cinzel text-slate-100 text-sm mb-1">{p.name}</div>
              <div
                className={`text-[10px] tracking-widest font-serif
                ${knowledge.type === "evil" ? "text-red-400" : "text-violet-400"}`}
              >
                {p.label}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-6">
          <p className="font-serif text-gray-600 text-sm italic">
            No one reveals themselves to you tonight.
          </p>
        </div>
      )}

      <div className="warning flex items-start gap-3 bg-amber-950/20 border border-amber-900/40 rounded-xl px-4 py-3 mb-5 text-left">
        <span className="text-amber-500 text-base mt-0.5 shrink-0">⚠</span>
        <p className="font-serif text-amber-200/60 text-xs leading-relaxed">
          Memorise this. Once you proceed, this screen closes forever. Pass the
          device face-down to the next player.
        </p>
      </div>

      <GoldButton onClick={onDone}>I've seen enough</GoldButton>
    </div>
  );
};

export default KnowledgeScreen;