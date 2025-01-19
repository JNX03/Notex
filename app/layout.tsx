import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NoteX - Jnx03",
  description: "Explore a comprehensive collection of study notes curated by Jxxn03z. Enhance your learning journey with NoteX!",
  keywords: "study notes, NoteX, Jnx03, Jxxn03z, learning resources, educational notes, study materials",
  authors: [
    { name: "Jxxn03z", url: "https://notex.jnx03.xyz/" }
  ],
  openGraph: {
    title: "NoteX - Jnx03",
    description: "Dive into NoteX, the ultimate hub for study notes and learning resources by Jxxn03z. Your knowledge companion!",
    url: "https://notex.jnx03.xyz/",
    siteName: "NoteX - Jnx03",
    images: [
      {
        url: "https://notex.jnx03.xyz/images/8.png",
        width: 1200,
        height: 630,
        alt: "NoteX Study Notes",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NoteX - Jnx03",
    description: "Uncover detailed study notes crafted by Jxxn03z with NoteX. Boost your learning experience!",
    images: [
      "https://notex.jnx03.xyz/images/8.png"
    ],
  },
  viewport: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://notex.jnx03.xyz/" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            <AppSidebar />
            <main className="pl-56 min-h-screen">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
