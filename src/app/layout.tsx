import StarField from "@/components/StarField";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Avalon",
  description: "The Resistance: Avalon",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏰</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen min-w-178.25 overflow-auto text-slate-200 app-bg">
          <StarField />
          {children}
        </div>
      </body>
    </html>
  );
}
