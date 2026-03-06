import type { ReactNode } from "react";

interface CardBoxProps { children: ReactNode; className?: string; }

const CardBox = ({ children, className = "" }: CardBoxProps) => (
  <div className={`bg-slate-950/80 border border-indigo-800 rounded-2xl p-5 backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

export default CardBox;