type OutcomeBannerProps = {
  success: boolean;
  icon: string;
  label: string;
  description: string;
};

const OutcomeBanner = ({
  success,
  icon,
  label,
  description,
}: OutcomeBannerProps) => (
  <div
    className={`p-5 rounded-2xl border-2 text-center ${
      success
        ? "bg-green-950/40 border-green-700"
        : "bg-red-950/40 border-red-800"
    }`}
  >
    <div className="text-4xl mb-2">{icon}</div>
    <div
      className={`cinzel text-xl tracking-widest ${success ? "text-green-400" : "text-red-400"}`}
    >
      {label}
    </div>
    <p className="font-serif text-gray-500 text-xs mt-2">{description}</p>
  </div>
);

export default OutcomeBanner;
