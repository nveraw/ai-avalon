import { useState } from "react";
import type { PlayerDetails } from "../../types/player";
import CardBox from "../../components/CardBox";
import GoldButton from "../../components/GoldButton";
import type { CompletedQuestStatus } from "../../types/quest";
import { PLAYER_ROLES } from "../../constants/player";
import Header from "../../components/Header";
import CardReveal from "./CardReveal";
import CardPicker from "./Cardpicker";
import BotPlaying from "./BotPlaying";

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

  const runReveal = (cards: CompletedQuestStatus[]) => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setAllCards(shuffled);

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

  const handlePick = (card: "success" | "fail") => {
    setPhase("waiting");
    const cards = team.map((p) =>
      p.name === player.name ? card : getBotCard(p),
    );
    runReveal(cards);
  };

  const handleWatch = () => {
    setPhase("waiting");
    const cards = team.map(getBotCard);
    runReveal(cards);
  };

  const humanIsEvil = PLAYER_ROLES[player.role].team === "evil";

  return (
    <div className="max-w-lg mx-auto px-5 py-8 text-center">
      <div className="mb-7">
        <Header
          title="QUEST IN PROGRESS"
          subtitle="Cast Your Fate"
          hasFollowup={true}
        />

        <div className="flex gap-2 justify-center flex-wrap mt-3">
          {team.map((teamPlayer) => (
            <span
              key={teamPlayer.name}
              className={`px-3 py-1 rounded-full text-xs font-serif border ${
                teamPlayer.name === player.name
                  ? "bg-amber-950/30 border-amber-700 text-amber-300"
                  : "bg-indigo-950/40 border-indigo-800 text-gray-400"
              }`}
            >
              {teamPlayer.name}{teamPlayer.name === player.name ? " (you)" : ""}
            </span>
          ))}
        </div>
      </div>

      {phase === "pick" && (
        <>
          {humanOnTeam ? (
            <CardPicker
              player={player}
              teammates={team.filter((p) => p.name !== player.name)}
              humanIsEvil={humanIsEvil}
              onPick={handlePick}
            />
          ) : (
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
              <GoldButton onClick={handleWatch}>
                Watch the quest unfold →
              </GoldButton>
            </CardBox>
          )}
        </>
      )}

      {phase === "waiting" && <BotPlaying />}

      {(phase === "reveal" || phase === "result") && (
        <CardReveal
          allCards={allCards}
          revealedCount={revealedCount}
          showResult={showResult}
        />
      )}
    </div>
  );
};

export default Quest;
