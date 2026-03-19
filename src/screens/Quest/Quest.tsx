import CardBox from "@/components/CardBox";
import GoldButton from "@/components/GoldButton";
import Header from "@/components/Header";
import LoadingState from "@/components/LoadingState";
import { PLAYER_ROLES } from "@/constants/playerRoles";
import { submitQuest } from "@/services/api";
import { messagesAtom } from "@/store/chat";
import { QuestResponse } from "@/types/api.types";
import type { PlayerDetails } from "@/types/game.types";
import type { CompletedQuestStatus } from "@/types/quest.types";
import { useSetAtom } from "jotai";
import { useState } from "react";
import CardPicker from "./CardPicker";
import CardReveal from "./CardReveal";

type QuestPhase = "pick" | "waiting" | "reveal" | "result";

type QuestProps = {
  team: string[];
  player: PlayerDetails;
  onResult: (card: QuestResponse) => void;
};

const Quest = ({ team, player, onResult }: QuestProps) => {
  const addMessages = useSetAtom(messagesAtom);

  const [phase, setPhase] = useState<QuestPhase>("pick");
  const [data, setData] = useState<QuestResponse>();
  const [revealedCount, setRevealedCount] = useState(0);

  const humanOnTeam = team.includes(player.name);

  const submitCard = async (card?: CompletedQuestStatus) => {
    setPhase("waiting");
    const res = await submitQuest({ humanCard: card ?? null });
    setData(res);
    addMessages(res.messages);

    setTimeout(() => setPhase("reveal"), 900);
    res.cards.forEach((_, i) => {
      setTimeout(() => setRevealedCount(i + 1), 1100 + i * 350);
    });
    setTimeout(() => setPhase("result"), 1100 + res.cards.length * 350 + 400);
  };

  const humanIsEvil =
    !!player.role && PLAYER_ROLES[player.role].team === "evil";

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
              key={teamPlayer}
              className={`px-3 py-1 rounded-full text-xs font-serif border ${
                teamPlayer === player.name
                  ? "bg-amber-950/30 border-amber-700 text-amber-300"
                  : "bg-indigo-950/40 border-indigo-800 text-gray-400"
              }`}
            >
              {teamPlayer}
              {teamPlayer === player.name ? " (you)" : ""}
            </span>
          ))}
        </div>
      </div>

      {phase === "pick" &&
        (humanOnTeam ? (
          <CardPicker
            player={player}
            teammates={team.filter((name) => name !== player.name)}
            humanIsEvil={humanIsEvil}
            onPick={submitCard}
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
            <GoldButton onClick={() => submitCard()}>
              Watch the quest unfold →
            </GoldButton>
          </CardBox>
        ))}

      {phase === "waiting" && (
        <LoadingState
          icon="⚔"
          title="The knights advance..."
          subtitle="Cards are being played in secret."
        />
      )}

      {(phase === "reveal" || phase === "result") && (
        <CardReveal
          allCards={data?.cards || []}
          revealedCount={revealedCount}
          showResult={phase === "result"}
        />
      )}

      {phase === "result" && (
        <GoldButton
          className="mt-6"
          disabled={!data}
          onClick={() => data && onResult(data)}
        >
          CONTINUE
        </GoldButton>
      )}
    </div>
  );
};

export default Quest;
