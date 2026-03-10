type LoadingStateProps = {
  icon: string;
  title: string;
  subtitle?: string;
};

const LoadingState = ({ icon, title, subtitle }: LoadingStateProps) => (
  <div className="text-center py-10">
    <div className="text-5xl mb-5 animate-bounce [animation-duration:3s]">
      {icon}
    </div>
    <div className="cinzel text-amber-400 text-lg mb-2">{title}</div>
    {subtitle && <p className="font-serif text-gray-500 text-sm">{subtitle}</p>}
    <div className="flex gap-1.5 justify-center mt-6">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full bg-amber-700 animate-pulse`}
          style={{ animationDelay: `${i * 0.25}s` }}
        />
      ))}
    </div>
  </div>
);

export default LoadingState;
