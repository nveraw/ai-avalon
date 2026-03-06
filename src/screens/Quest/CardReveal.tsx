import type { CompletedQuestStatus } from "@/types/Quest";

type QuestRevealProps = {
  allCards: CompletedQuestStatus[];
  revealedCount: number;
  showResult: boolean;
};

const QuestReveal = ({
  allCards,
  revealedCount,
  showResult,
}: QuestRevealProps) => {
  const failed = allCards.includes("fail");

  return (
    <>
      <p className="font-serif text-gray-500 text-xs mb-5 tracking-widest uppercase">
        Cards revealed — shuffled &amp; anonymous
      </p>

      <div className="flex gap-3 justify-center flex-wrap mb-7">
        {allCards.map((card, i) => {
          const visible = i < revealedCount;
          return (
            <div
              key={i}
              className={`w-16 h-24 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all duration-500 ${
                visible
                  ? card === "success"
                    ? "bg-reveal-good border-green-600"
                    : "bg-reveal-evil border-red-600"
                  : "bg-indigo-950/40 border-indigo-900"
              }`}
            >
              {visible ? (
                <>
                  <span className="text-3xl">
                    {card === "success" ? "⚔" : "💀"}
                  </span>
                  <span
                    className={`text-xs font-serif tracking-wider uppercase ${
                      card === "success" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {card}
                  </span>
                </>
              ) : (
                <span className="text-2xl text-indigo-800">?</span>
              )}
            </div>
          );
        })}
      </div>

      {showResult && (
        <div
          className={`p-6 rounded-2xl border-2 ${
            failed
              ? "bg-red-950/40 border-red-600"
              : "bg-green-950/40 border-green-600"
          }`}
        >
          <div className="text-5xl mb-2">{failed ? "💀" : "⚔"}</div>
          <div
            className={`cinzel text-xl tracking-widest ${failed ? "text-red-400" : "text-emerald-400"}`}
          >
            QUEST {failed ? "FAILED" : "SUCCEEDED"}
          </div>
          <p className="font-serif text-gray-500 text-xs mt-2">
            {failed
              ? "A traitor's blade found its mark in the dark."
              : "The knights return victorious. Camelot endures — for now."}
          </p>
        </div>
      )}
    </>
  );
};

export default QuestReveal;
