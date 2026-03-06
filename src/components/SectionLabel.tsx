import type { ReactNode } from "react";

interface SectionLabelProps { children: ReactNode; className?: string; }

const SectionLabel = ({ children, className = "" }: SectionLabelProps) => (
  <div className={`text-xs tracking-widest font-serif mb-4 ${className}`}>{children}</div>
);

export default SectionLabel;