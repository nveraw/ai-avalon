import type { ReactNode } from "react";

const Header = ({
  title,
  subtitle,
  children,
  description,
  hasFollowup,
}: {
  title: string;
  children?: ReactNode;
  subtitle?: string;
  description?: string;
  hasFollowup?: boolean
}) => (
  <>
    <p
      className={`text-violet-500 font-serif text-xs tracking-hero ${subtitle ? "mb-2" : ""}`}
    >
      {title}
    </p>

    {children}

    <p
      className={`cinzel text-amber-400 text-xl ${description || hasFollowup ? "mb-2" : "mb-6"}`}
    >
      {subtitle}
    </p>

    <p className="font-serif text-gray-500 text-sm leading-relaxed">
      {description}
    </p>
  </>
);

export default Header;
