import CardBox from "@/components/CardBox";
import GoldButton from "@/components/GoldButton";
import GoldDivider from "@/components/GoldDivider";
import SectionLabel from "@/components/SectionLabel";
import { PLAYER_ROLES } from "@/constants/playerRoles";
import type { PlayerDetails, PlayerTeam } from "@/types/player.types";

type ResultsProps = {
  winner: PlayerTeam;
  allPlayers: PlayerDetails[];
  assassinated?: string;
  onRestart: () => void;
};

const Results = ({
  winner,
  allPlayers,
  assassinated,
  onRestart,
}: ResultsProps) => {
  const good = winner === "good";

  return (
    <div className="max-w-lg mx-auto px-5 py-10 text-center">
      <div
        className={`px-6 py-12 rounded-3xl mb-6 border-2 ${
          good
            ? "bg-[radial-gradient(ellipse_at_top,rgba(5,46,22,0.8), rgba(10,12,25,0.95))] border-green-700"
            : "bg-[radial-gradient(ellipse_at_top,rgba(127,29,29,0.8), rgba(10,12,25,0.95))] border-red-700"
        }`}
      >
        <div className="text-7xl mb-4 animate-bounce">{good ? "🏆" : "💀"}</div>
        <div
          className={`text-xs tracking-hero font-serif mb-2 ${good ? "text-green-300" : "text-red-300"}`}
        >
          {good ? "ARTHUR'S KINGDOM PREVAILS" : "DARKNESS DESCENDS"}
        </div>
        <h1
          className={`cinzel-deco text-4xl tracking-widest mb-0 ${
            good
              ? "text-emerald-400 [text-shadow:0_0_30px_#34d39977]"
              : "text-red-400 [text-shadow:0_0_30px_#f8717177]"
          }`}
        >
          {good ? "GOOD WINS" : "EVIL WINS"}
        </h1>
        <GoldDivider />
        <p className="text-gray-400 font-serif text-sm leading-relaxed m-0">
          {good
            ? "The knights of the Round Table have completed their quests. Camelot endures."
            : "The shadows have consumed the realm. Mordred's treachery has triumphed."}
        </p>
      </div>

      <CardBox className="mb-6">
        <SectionLabel className="text-purple-400 text-center">
          ROLE REVEAL
        </SectionLabel>
        <div className="grid grid-cols-2 gap-2.5">
          {allPlayers.map((player) => {
            return (
              <div
                key={player.name}
                className={`p-3 rounded-xl border relative ${
                  player.name === assassinated ? "ring-2 ring-red-500/60" : ""
                } ${
                  PLAYER_ROLES[player.role].team === "good"
                    ? "bg-green-950/30 border-green-900"
                    : "bg-red-950/30 border-red-950"
                }`}
              >
                {player.name === assassinated && (
                  <div
                    className={
                      "absolute -top-2 -right-2 text-xs rounded-full px-1.5 py-0.5 font-serif border bg-red-950 border-red-700 text-red-400"
                    }
                  >
                    🗡
                  </div>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">
                    {PLAYER_ROLES[player.role].icon}
                  </span>
                  <span className="text-slate-200 font-serif text-sm">
                    {player.name}
                  </span>
                </div>
                <div
                  className={`text-xs font-serif text-[${PLAYER_ROLES[player.role].color}]`}
                >
                  {PLAYER_ROLES[player.role].name}
                </div>
              </div>
            );
          })}
        </div>
      </CardBox>

      <GoldButton onClick={onRestart}>⚔️ Play Again</GoldButton>
    </div>
  );
};

export default Results;
