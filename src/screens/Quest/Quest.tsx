import { useState } from "react";
import type { PlayerDetails } from "../../types/player";
import CardBox from "../../components/CardBox";
import GoldButton from "../../components/GoldButton";
import type { CompletedQuestStatus } from "../../types/quest";
import { PLAYER_ROLES } from "../../constants/player";
import Header from "../../components/Header";

type QuestPhase = "pick" | "waiting" | "reveal" | "result";

type QuestProps = {
  team: PlayerDetails[];
  player: PlayerDetails;
  onResult: (card: CompletedQuestStatus) => void;
};

const Quest = ({ team, player, onResult }: QuestProps) => {
  const [phase, setPhase] = useState<QuestPhase>("pick");
  const [allCards, setAllCards] = useState<CompletedQuestStatus[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const humanOnTeam = team.includes(player);

  // TODO ai Bot card logic: good bots always play success; evil bots may play fail
  const getBotCard = (member: PlayerDetails): CompletedQuestStatus => {
    const isEvil = PLAYER_ROLES[member.role].team === "evil";
    return isEvil && Math.random() > 0.3 ? "fail" : "success";
  };

  const submitCard = (card?: "fail" | "success") => {
    setPhase("waiting");

    // Build all cards (bot cards auto-assigned)
    const cards = team.map((p) => {
      if (card && p.name === player.name) return card;
      return getBotCard(p);
    });

    // Shuffle for dramatic reveal
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setAllCards(shuffled);

    if (!card) setPhase("waiting");

    // Stagger reveal
    setTimeout(() => setPhase("reveal"), 900);
    shuffled.forEach((_, i) => {
      setTimeout(() => setRevealedCount(i + 1), 1100 + i * 350);
    });
    const failed = shuffled.includes("fail");
    setTimeout(() => setShowResult(true), 1100 + shuffled.length * 350 + 400);
    setTimeout(
      () => onResult(failed ? "fail" : "success"),
      1100 + shuffled.length * 350 + 2200,
    );
  };

  const failed = allCards.includes("fail");
  const humanIsEvil = PLAYER_ROLES[player.role].team === "evil";

  return (
    <div className="max-w-lg mx-auto px-5 py-8 text-center">
      {/* Header */}
      <div className="mb-7">
        <Header title="QUEST IN PROGRESS" subtitle="Cast Your Fate" hasFollowup={true} />

        {/* Team on this quest */}
        <div className="flex gap-2 justify-center flex-wrap mt-3">
          {team.map((teamPlayer) => (
            <span
              key={teamPlayer.name}
              className={`px-3 py-1 rounded-full text-xs font-serif border
              ${
                teamPlayer.name === player.name
                  ? "bg-amber-950/30 border-amber-700 text-amber-300"
                  : "bg-indigo-950/40 border-indigo-800 text-gray-400"
              }`}
            >
              {teamPlayer.name}
              {teamPlayer.name === player.name ? " (you)" : ""}
            </span>
          ))}
        </div>
      </div>

      {/* ── PHASE: human picks their card ── */}
      {phase === "pick" && (
        <>
          {humanOnTeam ? (
            <>
              <CardBox className="mb-5 text-center">
                <div className="text-xs text-purple-600 tracking-widest font-serif mb-3">
                  YOUR CARD, {player.name.toUpperCase()}
                </div>
                <p className="font-serif text-gray-400 text-sm mb-6 leading-relaxed">
                  Choose wisely. Your card is played in secret — no one will
                  know which you chose.
                </p>
                <div className="flex gap-4">
                  {/* Success */}
                  <button
                    onClick={() => submitCard("success")}
                    className="flex-1 py-8 rounded-2xl border-2 border-green-900 bg-green-950/20
                      flex flex-col items-center gap-3 cursor-pointer transition-all
                      hover:border-green-600 hover:bg-green-950/40 hover:shadow-[0_0_24px_#16a34a33] group"
                  >
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-200">
                      ⚔
                    </span>
                    <span className="cinzel text-green-400 text-sm tracking-widest">
                      SUCCESS
                    </span>
                    <span className="text-gray-600 text-xs font-serif">
                      Advance the quest
                    </span>
                  </button>
                  {/* Fail */}
                  <button
                    onClick={() => submitCard("fail")}
                    disabled={!humanIsEvil}
                    title={
                      !humanIsEvil
                        ? "Loyal knights cannot betray the quest"
                        : undefined
                    }
                    className={`flex-1 py-8 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                      humanIsEvil
                        ? "border-red-900 bg-red-950/20 cursor-pointer hover:border-red-600 hover:bg-red-950/40 hover:shadow-[0_0_24px_#dc262633] group"
                        : "border-indigo-950/50 bg-slate-950/40 cursor-not-allowed opacity-30"
                    }`}
                  >
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-200">
                      💀
                    </span>
                    <span className="cinzel text-red-400 text-sm tracking-widest">
                      FAIL
                    </span>
                    <span className="text-gray-600 in-disabled:text-white text-xs font-serif">
                      {humanIsEvil
                        ? "Sabotage the quest"
                        : "Not available to loyal knights"}
                    </span>
                  </button>
                </div>
              </CardBox>

              {team.filter((teamPlayer) => teamPlayer !== player).length >
                0 && (
                <CardBox className="bot-card">
                  <div className="text-xs text-purple-600 tracking-widest font-serif mb-3">
                    FELLOW KNIGHTS
                  </div>
                  <div className="grid gap-2">
                    {team
                      .filter((teamPlayer) => teamPlayer !== player)
                      .map((teamPlayer) => (
                        <div
                          key={teamPlayer.name}
                          className="flex items-center gap-3 px-1 py-1"
                        >
                          <div
                            className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-800
                          flex items-center justify-center text-slate-300 font-serif font-bold text-sm shrink-0"
                          >
                            {teamPlayer.name[0]}
                          </div>
                          <span className="text-gray-400 font-serif text-sm flex-1">
                            {teamPlayer.name}
                          </span>
                          <span className="text-indigo-700 text-xs font-serif italic animate-pulse [animation-duration:3s]">
                            ready to play...
                          </span>
                        </div>
                      ))}
                  </div>
                </CardBox>
              )}
            </>
          ) : (
            /* Human not on team — just observer */
            <CardBox className="mb-5 text-center">
              <div className="text-4xl mb-4">👁</div>
              <div className="cinzel text-amber-400 text-base mb-2">
                You watch from afar
              </div>
              <p className="font-serif text-gray-500 text-sm leading-relaxed mb-5">
                You were not selected for this quest.
                <br />
                The chosen knights play their cards in secret.
              </p>
              <GoldButton onClick={() => submitCard()}>
                Watch the quest unfold →
              </GoldButton>
            </CardBox>
          )}
        </>
      )}

      {/* ── PHASE: bots playing ── */}
      {phase === "waiting" && (
        <div className="text-center py-10">
          <div className="text-5xl mb-5 animate-bounce [animation-duration:3s]">
            ⚔
          </div>
          <div className="cinzel text-amber-400 text-lg mb-2">
            The knights advance...
          </div>
          <p className="font-serif text-gray-500 text-sm">
            Cards are being played in secret.
          </p>
          <div className="flex gap-1.5 justify-center mt-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-amber-700 animate-pulse"
                style={{ animationDelay: `${i * 0.25}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── PHASE: reveal cards one by one ── */}
      {(phase === "reveal" || phase === "result") && (
        <div>
          <p className="font-serif text-gray-500 text-xs mb-5 tracking-widest uppercase">
            Cards revealed — shuffled &amp; anonymous
          </p>

          {/* Card row */}
          <div className="flex gap-3 justify-center flex-wrap mb-7">
            {allCards.map((card, i) => {
              const visible = i < revealedCount;
              return (
                <div
                  key={i}
                  className={`w-16 h-24 rounded-xl flex flex-col items-center justify-center gap-2
                    border-2 transition-all duration-500
                    ${
                      visible
                        ? card === "success"
                          ? "bg-[linear-gradient(circle_at_135%,#052e16,#166534)] border-green-600 shadow-[0_0_20px_#16a34a44]"
                          : "bg-[linear-gradient(circle_at_135%,#2d0a0a,#7f1d1d)] border-red-600 shadow-[0_0_20px_#dc262644]"
                        : "bg-indigo-950/40 border-indigo-900"
                    }`}
                >
                  {visible ? (
                    <>
                      <span className="text-3xl">
                        {card === "success" ? "⚔" : "💀"}
                      </span>
                      <span
                        className={`text-xs font-serif tracking-wider uppercase
                          ${card === "success" ? "text-green-400" : "text-red-400"}`}
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

          {/* Result banner */}
          {showResult && (
            <div
              className={`p-6 rounded-2xl border-2
              ${
                failed
                  ? "bg-red-950/40 border-red-600 shadow-[0_0_40px_#dc262633]"
                  : "bg-green-950/40 border-green-600 shadow-[0_0_40px_#16a34a33]"
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
        </div>
      )}
    </div>
  );
};

export default Quest;
