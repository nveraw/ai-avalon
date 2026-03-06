const PlayerToken = ({ name, isSelected, isLeader }: {name: string, isSelected?: boolean, isLeader: boolean}) => (
  <div
    className={`flex flex-col items-center gap-1.5 transition-all duration-300
      ${isSelected ? "-translate-y-2" : ""}`}
  >
    <div className={`relative w-13 h-13 rounded-full flex items-center justify-center
      text-xl font-bold font-serif text-slate-200 transition-all
      token-base
      ${isSelected ? "border-2 border-amber-400 shadow-[0_0_16px_#d4af3788]" : ""}
      ${isLeader  ? "border-2 border-violet-400" : ""}
      ${!isSelected && !isLeader ? "border-2 border-indigo-800" : ""}`}
    >
      {isLeader && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm aspect-square">👑</span>
      )}
      {name[0].toUpperCase()}
    </div>
    <span className={`text-[11px] font-serif ${isSelected ? "text-amber-400" : "text-gray-400"}`}>
      {name}
    </span>
  </div>
);

export default PlayerToken;