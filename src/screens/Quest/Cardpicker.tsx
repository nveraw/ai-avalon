import type { PlayerDetails } from "../../types/player";
import CardBox from "../../components/CardBox";

type CardPickerProps = {
  player: PlayerDetails;
  teammates: PlayerDetails[]; // team excluding the human player
  humanIsEvil: boolean;
  onPick: (card: "success" | "fail") => void;
};

const CardPicker = ({ player, teammates, humanIsEvil, onPick }: CardPickerProps) => (
  <>
    <CardBox className="mb-5 text-center">
      <div className="text-xs text-purple-400 tracking-widest font-serif mb-3">
        YOUR CARD, {player.name.toUpperCase()}
      </div>
      <p className="font-serif text-gray-400 text-sm mb-6 leading-relaxed">
        Choose wisely. Your card is played in secret — no one will know which you chose.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => onPick("success")}
          className="flex-1 py-8 rounded-2xl border-2 border-green-900 bg-green-950/20
            flex flex-col items-center gap-3 cursor-pointer transition-all
            hover:border-green-600 hover:bg-green-950/40 group"
        >
          <span className="text-5xl group-hover:scale-110 transition-transform duration-200">⚔</span>
          <span className="cinzel text-green-400 text-sm tracking-widest">SUCCESS</span>
          <span className="text-gray-600 text-xs font-serif">Advance the quest</span>
        </button>

        <button
          onClick={() => onPick("fail")}
          disabled={!humanIsEvil}
          title={!humanIsEvil ? "Loyal knights cannot betray the quest" : undefined}
          className="flex-1 py-8 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all
                        border-red-900 bg-red-950/20 cursor-pointer hover:border-red-600 hover:bg-red-950/40 group
                        disabled:border-indigo-950/50 disabled:bg-slate-950/40 disabled:ursor-not-allowed"
        >
          <span className="text-5xl group-hover:scale-110 transition-transform duration-200 in-disabled:opacity-30">💀</span>
          <span className="cinzel text-red-400 text-sm tracking-widest in-disabled:opacity-70">FAIL</span>
          <span className="text-gray-400 in-disabled:text-white text-xs font-serif in-disabled:opacity-50">
            {humanIsEvil ? "Sabotage the quest" : "Not available to loyal knights"}
          </span>
        </button>
      </div>
    </CardBox>

    {teammates.length > 0 && (
      <CardBox>
        <div className="text-xs text-purple-400 tracking-widest font-serif mb-3">
          FELLOW KNIGHTS
        </div>
        <div className="grid gap-2">
          {teammates.map((p) => (
            <div key={p.name} className="flex items-center gap-3 px-1 py-1">
              <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-800
                flex items-center justify-center text-slate-300 font-serif font-bold text-sm shrink-0">
                {p.name[0]}
              </div>
              <span className="text-gray-400 font-serif text-sm flex-1">{p.name}</span>
              <span className="text-indigo-700 text-xs font-serif italic animate-pulse [animation-duration:3s]">
                ready to play...
              </span>
            </div>
          ))}
        </div>
      </CardBox>
    )}
  </>
);

export default CardPicker;