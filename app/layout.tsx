import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FreeIEP — the IEP workspace anyone can use",
  description: "Clocks, goals, and a family view. No card. No district wait. Not the official IEP.",
  icons: { icon: "/mark.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body
        className={`${sans.className} min-h-screen antialiased`}
        style={{
          ["--font-sans" as string]: "var(--font-jakarta), 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
          ["--font-serif" as string]: "var(--font-source-serif), 'Source Serif 4', ui-serif, Georgia, serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
