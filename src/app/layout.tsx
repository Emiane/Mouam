import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mouam's Hairstyle | Braids à Liège",
  description: "Coiffures afro, knotless et tresses sur rendez-vous à Liège.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/mouams-logo-192.png", sizes: "192x192", type: "image/png" },
      { url: "/mouams-logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/mouams-logo-192.png",
    apple: "/mouams-logo-180.png",
  },
  appleWebApp: {
    capable: true,
    title: "Mouam's Hairstyle",
    statusBarStyle: "default",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}