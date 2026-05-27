import type { Metadata } from "next";
import "./globals.css";
import TopNav from "../components/TopNav";
import MobileBottomNav from "../components/MobileBottomNav";
import AboutOverlay from "../components/AboutOverlay";
import { ViewModeProvider } from "../context/ViewModeContext";
import { FilterProvider } from "../context/FilterContext";
import { VoteProvider } from "../context/VoteContext";

export const metadata: Metadata = {
  title: "Culture Connect",
  description: "Discover, vote on, and shape community cultural offerings.",
  openGraph: {
    title: "Culture Connect",
    description: "Discover, vote on, and shape community cultural offerings.",
    url: "https://culture-connect-group19.vercel.app",
    siteName: "Culture Connect",
    images: [
      {
        url: "https://culture-connect-group19.vercel.app/og-image.png",
        width: 512,
        height: 333,
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Culture Connect",
    description: "Discover, vote on, and shape community cultural offerings.",
    images: ["https://culture-connect-group19.vercel.app/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col relative bg-[#0C0B0A]" suppressHydrationWarning>
        <ViewModeProvider>
          <FilterProvider>
            <VoteProvider>
              <TopNav />
              <main className="flex-1 w-full">
                {children}
              </main>
              <AboutOverlay />
              <MobileBottomNav />
            </VoteProvider>
          </FilterProvider>
        </ViewModeProvider>
      </body>
    </html>
  );
}
