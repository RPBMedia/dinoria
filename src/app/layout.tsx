import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import { Providers } from "./providers";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dinoria — The Dinosaur Quiz Adventure",
    template: "%s · Dinoria",
  },
  description:
    "Name that dinosaur! A beautiful prehistoric quiz adventure for kids and dinosaur fans. Play instantly, beat the clock, build streaks and climb the leaderboard.",
  keywords: [
    "dinosaur quiz",
    "dinosaur game for kids",
    "learn dinosaurs",
    "dinosaur trivia",
    "Dinoria",
  ],
  openGraph: {
    title: "Dinoria — The Dinosaur Quiz Adventure",
    description:
      "Name that dinosaur! Beat the clock, build streaks and climb the leaderboard.",
    type: "website",
    siteName: "Dinoria",
    locale: "en_US",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Dinoria — name that dinosaur quiz game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dinoria — The Dinosaur Quiz Adventure",
    description:
      "Name that dinosaur! Beat the clock, build streaks and climb the leaderboard.",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
