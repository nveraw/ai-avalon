import CardBox from "@/components/CardBox";
import GoldButton from "@/components/GoldButton";
import Header from "@/components/Header";
import PlayerToken from "@/components/PlayerToken";
import SectionLabel from "@/components/SectionLabel";
import { QUEST_SIZES } from "@/constants/questConfigs";
import type { PlayerDetails } from "@/types/Player";
import type { QuestStatus } from "@/types/Quest";
import QuestShield from "./QuestShield";

interface BoardProps {
    players: PlayerDetails[];
    questResults: QuestStatus[];
    round: number;
    leader: PlayerDetails;
    rejectCount: number;
    onSelectTeam: () => void;
}

const Board = ({ players, questResults, round, leader, rejectCount, onSelectTeam }: BoardProps) => {
  const questSizes = QUEST_SIZES[players.length] ?? QUEST_SIZES[7];

  return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      <div className="header text-center mb-6">
        <Header title={`ROUND ${round} OF 5`} subtitle="The Round Table" />
      </div>

      <CardBox className="quest-track mb-4">
        <SectionLabel className="text-purple-400">QUEST TRACK</SectionLabel>
        <div className="flex justify-between items-end">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="text-center">
              <QuestShield status={questResults[i] || "pending"} index={i} />
              <div className="text-xs text-indigo-500 mt-1.5 font-serif">{questSizes[i]}P</div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-10 mt-5">
          <div className="text-center">
            <div className="text-3xl text-emerald-400 cinzel">{questResults.filter(q => q === "success").length}</div>
            <div className="text-xs text-emerald-400 tracking-widest">VICTORIES</div>
          </div>
          <div className="w-px bg-indigo-950" />
          <div className="text-center">
            <div className="text-3xl text-red-400 cinzel">{questResults.filter(q => q === "fail").length}</div>
            <div className="text-xs text-red-400 tracking-widest">FAILURES</div>
          </div>
        </div>
      </CardBox>

      <div className="rejection-tracker bg-slate-950/80 border border-indigo-800 rounded-xl px-5 py-3.5 mb-4
        flex items-center gap-4">
        <div className="text-xs text-purple-400 tracking-widest font-serif whitespace-nowrap">REJECTIONS</div>
        <div className="flex gap-1.5">
          {Array.from({ length: questSizes.length }).map((_, i) => (
            <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-sm border transition-all ${i < rejectCount
                ? "bg-red-950 border-red-600"
                : "bg-indigo-950 border-indigo-900"}`}>
              {i < rejectCount ? "💢" : ""}
            </div>
          ))}
        </div>
        {rejectCount >= 4 && (
          <div className="text-red-400 text-xs">⚠ ONE MORE = EVIL WINS</div>
        )}
      </div>

      <CardBox className="players mb-5">
        <SectionLabel className="text-purple-400">KNIGHTS OF THE REALM</SectionLabel>
        <div className="flex flex-wrap gap-5 justify-center">
          {players.map((p) => <PlayerToken key={p.name} name={p.name} isLeader={p.name === leader.name} />)}
        </div>
      </CardBox>

      <GoldButton onClick={onSelectTeam}>
        👑 Leader Selects Team ({questSizes[round - 1]} players)
      </GoldButton>
    </div>
  );
};

export default Board;