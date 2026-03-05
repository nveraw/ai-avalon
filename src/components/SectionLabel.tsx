import type { CommonProps } from "../types/componentProps";

const SectionLabel = ({ children, className = "" }: CommonProps) => (
  <div className={`text-xs tracking-widest font-serif mb-4 ${className}`}>{children}</div>
);

export default SectionLabel;