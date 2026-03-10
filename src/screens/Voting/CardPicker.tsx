import CardBox from "@/components/CardBox";
import ChoiceCard from "@/components/ChoiceCard";
import PlayerRow from "@/components/PlayerRow";
import { VotedStatus } from "@/types/quest.types";

type CardPickerProps = {
  humanName: string;
  playerNames: string[]; // team excluding the human player
  onPick: (card: VotedStatus) => void;
};

const CardPicker = ({ humanName, playerNames, onPick }: CardPickerProps) => (
  <>
    <CardBox className="mb-5 text-center">
      <div className="text-xs text-purple-400 tracking-widest font-serif mb-3">
        YOUR VOTE, {humanName.toUpperCase()}
      </div>
      <p className="font-serif text-gray-400 text-sm mb-6 leading-relaxed">
        Do you support this team being sent on the quest?
      </p>
      <div className="flex gap-4">
        <ChoiceCard
          onClick={() => onPick("approve")}
          variant="good"
          icon="✅"
          label="APPROVE"
          description="Send them on the quest"
        />
        <ChoiceCard
          onClick={() => onPick("reject")}
          variant="evil"
          icon="❌"
          label="REJECT"
          description="Refuse this fellowship"
        />
      </div>
    </CardBox>

    <CardBox className="play">
      <div className="text-xs text-purple-400 tracking-widest font-serif mb-3">
        OTHER PLAYERS
      </div>
      <div className="grid gap-2">
        {playerNames
          .filter((p) => p !== humanName)
          .map((name) => (
            <PlayerRow key={name} name={name} status="waiting..." />
          ))}
      </div>
    </CardBox>
  </>
);

export default CardPicker;
