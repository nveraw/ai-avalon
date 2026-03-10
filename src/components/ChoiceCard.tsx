import { ButtonHTMLAttributes } from "react";

interface ChoiceCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  label: string;
  description?: string;
  variant: "good" | "evil";
}

const variantStyles = {
  good: {
    border: "border-green-900 hover:border-green-600",
    bg: "bg-green-950/20 hover:bg-green-950/40",
    label: "text-green-400",
  },
  evil: {
    border: "border-red-900 hover:border-red-600",
    bg: "bg-red-950/20 hover:bg-red-950/40",
    label: "text-red-400",
  },
};

const ChoiceCard = ({
  icon,
  label,
  description,
  variant,
  onClick,
  disabled,
}: ChoiceCardProps) => {
  const variantClass = variantStyles[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 py-8 rounded-2xl border-2 flex flex-col items-center gap-3
        cursor-pointer transition-all group ${variantClass.border} ${variantClass.bg}
        disabled:border-indigo-950/50 disabled:bg-slate-950/40 disabled:cursor-not-allowed`}
    >
      <span className="text-5xl group-hover:scale-110 transition-transform duration-200 in-disabled:opacity-30">
        {icon}
      </span>
      <span
        className={`cinzel text-sm tracking-widest ${variantClass.label} in-disabled:opacity-70`}
      >
        {label}
      </span>
      {description && (
        <span className="text-gray-400 text-xs font-serif in-disabled:opacity-50">
          {description}
        </span>
      )}
    </button>
  );
};

export default ChoiceCard;
