import { PLAYER_ROLES } from "../../constants/player";
import type { PlayerDetails } from "../../types/player";
import CardBox from "../../components/CardBox";
import Header from "../../components/Header";

type RoleCardProps = {
  player: PlayerDetails;
  onContinue: () => void;
  hasKnowledge: boolean;
}

const RoleCard = ({
  player,
  onContinue,
  hasKnowledge,
}: RoleCardProps) => {
  const role = PLAYER_ROLES[player.role];
  const isEvil = role?.team === "evil";

  return (
    <div className="max-w-sm mx-auto px-5 py-8 text-center">
      <Header title="YOUR ROLE" subtitle={`${player.name}, your fate is sealed.`} />

      <div
        className="flex justify-center my-8"
        style={{ perspective: "900px" }}
      >
        <div className="w-50 h-70 transition-transform duration-200">
          <div className="relative w-full h-full">
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-[#4a3f6b] ${
                isEvil
                  ? "bg-[radial-gradient(circle_at_30%_20%,#2d0a0a,#0a0305)] border-[#7f1d1d] shadow-[0_0_40px_#dc262633]"
                  : "bg-[radial-gradient(circle_at_30%_20%,#052e16,#0a0f1e)] border-[#166534] shadow-[0_0_40px_#16a34a33]"
              }`}
            >
              <div className="text-6xl mb-3 select-none">{role?.icon}</div>
              <div
                className={`cinzel text-2xl font-bold mb-1 ${isEvil ? "text-red-300" : "text-emerald-300"}`}
              >
                {role?.name}
              </div>
              <div
                className={`text-xs tracking-hero font-serif uppercase px-4 py-1 rounded-full mt-1
                ${isEvil ? "bg-red-950/60 text-red-500" : "bg-emerald-950/60 text-emerald-600"}`}
              >
                {isEvil ? "⚔ Evil" : "✦ Good"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <CardBox
          className={`text-left border ${isEvil ? "border-red-950" : "border-emerald-950"}`}
        >
          <div
            className={`text-xs tracking-widest font-serif mb-2 ${isEvil ? "text-red-500" : "text-emerald-500"}`}
          >
            YOUR MISSION
          </div>
          <p className="font-serif text-slate-300 text-sm leading-relaxed">
            {role?.mission}
          </p>
        </CardBox>

        <button
          onClick={onContinue}
          className={`w-full py-4 rounded-xl border cinzel text-sm tracking-widest cursor-pointer transition-all ${
            isEvil
              ? "border-red-800 bg-red-950/40 text-red-300 hover:brightness-110"
              : "border-indigo-700 bg-indigo-950/50 text-indigo-300 hover:brightness-110"
          }`}
        >
          {hasKnowledge
            ? "See what the night reveals →"
            : "Understood — I'm ready →"}
        </button>
      </div>
    </div>
  );
};

export default RoleCard;
