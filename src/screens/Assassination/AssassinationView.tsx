import CardBox from "../../components/CardBox";
import GoldDivider from "../../components/GoldDivider";

const AssassinationView = ({ assassinName }: { assassinName: string }) => (
  <>
    <div className="text-6xl mb-5">🗡</div>
    <div className="text-xs text-red-500 tracking-hero font-serif mb-2">
      FINAL JUDGMENT
    </div>
    <h2 className="cinzel text-red-400 text-3xl mb-6">The Assassination</h2>
    <CardBox className="border-red-950/60 text-center">
      <p className="font-serif text-gray-300 text-sm leading-relaxed mb-2">
        Good has triumphed on the quests...
      </p>
      <p className="font-serif text-red-400 text-sm leading-relaxed">
        But <span className="cinzel text-red-300">{assassinName}</span> steps
        forward from the shadows. One blade remains.
      </p>
      <GoldDivider />
      <p className="font-serif text-gray-500 text-xs italic">
        "Even in victory, you are not safe. I know who Merlin is."
      </p>
    </CardBox>
  </>
);

export default AssassinationView;
