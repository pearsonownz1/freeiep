import type { Metadata } from "next";
import { IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600"],
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
    <html lang="en" className={`${plex.variable} ${serif.variable}`}>
      <body
        className={`${plex.className} min-h-screen antialiased`}
        style={{
          ["--font-sans" as string]: "var(--font-plex), 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",
          ["--font-serif" as string]: "var(--font-source-serif), 'Source Serif 4', Georgia, serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
