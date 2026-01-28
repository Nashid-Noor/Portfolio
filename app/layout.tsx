import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from "@/components/navigation";
import { ChatWidget } from "@/components/chat/chat-widget";
import { getSiteContent } from "@/lib/content";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteContent();
  return {
    title: {
      default: `${site.name} | ${site.title}`,
      template: `%s | ${site.name}`,
    },
    description: site.tagline,
    keywords: ["portfolio", "data science", "machine learning", "ML engineer"],
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = getSiteContent();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-background flex flex-col">

            <main className="flex-1 flex flex-col">{children}</main>

          </div>
          <ChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
