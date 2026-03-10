import CardBox from "@/components/CardBox";
import ChoiceCard from "@/components/ChoiceCard";
import PlayerRow from "@/components/PlayerRow";
import type { PlayerDetails } from "@/types/game.types";
import { CompletedQuestStatus } from "@/types/quest.types";

type CardPickerProps = {
  player: PlayerDetails;
  teammates: string[]; // team excluding the human player
  humanIsEvil: boolean;
  onPick: (card: CompletedQuestStatus) => void;
};

const CardPicker = ({
  player,
  teammates,
  humanIsEvil,
  onPick,
}: CardPickerProps) => (
  <>
    <CardBox className="mb-5 text-center">
      <div className="text-xs text-purple-400 tracking-widest font-serif mb-3">
        YOUR CARD, {player.name.toUpperCase()}
      </div>
      <p className="font-serif text-gray-400 text-sm mb-6 leading-relaxed">
        Choose wisely. Your card is played in secret — no one will know which
        you chose.
      </p>
      <div className="flex gap-4">
        <ChoiceCard
          onClick={() => onPick("success")}
          variant="good"
          icon="⚔"
          label="SUCCESS"
          description="Advance the quest"
        />
        <ChoiceCard
          onClick={() => onPick("fail")}
          title={
            !humanIsEvil ? "Loyal knights cannot betray the quest" : undefined
          }
          disabled={!humanIsEvil}
          variant="evil"
          icon="💀"
          label="FAIL"
          description={
            humanIsEvil
              ? "Sabotage the quest"
              : "Not available to loyal knights"
          }
        />
      </div>
    </CardBox>

    {teammates.length > 0 && (
      <CardBox>
        <div className="text-xs text-purple-400 tracking-widest font-serif mb-3">
          FELLOW KNIGHTS
        </div>
        <div className="grid gap-2">
          {teammates.map((name) => (
            <PlayerRow key={name} name={name} status="ready to play..." />
          ))}
        </div>
      </CardBox>
    )}
  </>
);

export default CardPicker;
