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
    className={`cinzel w-full py-4 rounded-xl border font-serif tracking-widest uppercase transition-all bg-linear-[135deg,#78350f,#451a03] cursor-pointer hover:brightness-110 text-[#fde68a] ${
        className} disabled:border-indigo-950 disabled:bg-slate-950 disabled:text-gray-600 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

export default GoldButton;
