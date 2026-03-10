type PlayerRowProps = {
  name: string;
  status?: string;
};

const PlayerRow = ({ name, status }: PlayerRowProps) => (
  <div className="flex items-center gap-3 px-1 py-1">
    <div
      className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-800
      flex items-center justify-center text-slate-300 font-serif font-bold text-sm shrink-0"
    >
      {name[0]}
    </div>
    <span className="text-gray-400 font-serif text-sm flex-1">{name}</span>
    {status && (
      <span className="text-indigo-700 text-xs font-serif italic animate-pulse [animation-duration:3s]">
        {status}
      </span>
    )}
  </div>
);

export default PlayerRow;
