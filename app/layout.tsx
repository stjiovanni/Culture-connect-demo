import type { Metadata } from "next";
import "./globals.css";
import TopNav from "../components/TopNav";
import MobileBottomNav from "../components/MobileBottomNav";
import AboutOverlay from "../components/AboutOverlay";
import { ViewModeProvider } from "../context/ViewModeContext";
import { FilterProvider } from "../context/FilterContext";
import { VoteProvider } from "../context/VoteContext";

export const metadata: Metadata = {
  title: "CultureConnect Demo",
  description: "A cultural discovery platform",
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
