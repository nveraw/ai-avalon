import OutcomeBanner from "@/components/OutcomeBanner";
import { VotedStatus } from "@/types/quest.types";

type CardRevealProps = {
  humanName: string;
  playerNames: string[]; // team excluding the human player
  showResult: boolean;
  approved: boolean;
  allVotesMap: Record<string, VotedStatus | null>;
  visibleCards: number;
};

const CardReveal = ({
  humanName,
  playerNames,
  showResult,
  approved,
  allVotesMap,
  visibleCards,
}: CardRevealProps) => (
  <>
    <div className="flex gap-3 justify-center flex-wrap mb-6">
      {playerNames.map((name, i) => {
        const vote = allVotesMap[name];
        const visible = i < visibleCards;
        const isHuman = name === humanName;
        return (
          <div key={i} className="text-center">
            <div
              className={`w-18 h-24 rounded-xl flex flex-col items-center justify-center gap-2 ${
                isHuman
                  ? "ring-2 ring-amber-500/50 ring-offset-1 ring-offset-transparent"
                  : ""
              } ${
                visible
                  ? vote === "approve"
                    ? "bg-reveal-good border-green-600"
                    : "bg-reveal-evil border-red-600"
                  : "bg-indigo-950/40 border-indigo-900"
              } border-2 transition-all duration-500`}
            >
              {visible ? (
                <>
                  <span className="text-2xl">
                    {vote === "approve" ? "✅" : "❌"}
                  </span>
                  <span className="text-xs text-white font-serif tracking-wider uppercase">
                    {vote}
                  </span>
                </>
              ) : (
                <span className="text-xl text-indigo-700">?</span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1.5 font-serif">
              {name}
            </div>
            {isHuman && (
              <div className="text-xs text-amber-600 font-serif">you</div>
            )}
          </div>
        );
      })}
    </div>

    {showResult && (
      <OutcomeBanner
        success={approved}
        icon={approved ? "⚔" : "🚫"}
        label={`TEAM ${approved ? "APPROVED" : "REJECTED"}`}
        description={
          approved
            ? "The fellowship advances to the quest."
            : "The proposal has been refused. Leadership passes on."
        }
      />
    )}
  </>
);

export default CardReveal;
