import type { ButtonHTMLAttributes, ReactNode } from "react";

interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const GoldButton = ({
  onClick,
  disabled,
  children,
  className = "",
}: GoldButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`cinzel w-full py-4 rounded-xl border font-serif tracking-widest uppercase transition-all ${
      disabled
        ? "border-indigo-950 bg-slate-950 text-gray-600 cursor-not-allowed"
        : "bg-linear-[135deg,#78350f,#451a03] cursor-pointer hover:brightness-110 text-[#fde68a]"
    } ${className}`}
  >
    {children}
  </button>
);

export default GoldButton;
