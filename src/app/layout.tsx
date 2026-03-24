import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Shifa-Connect | Gestion Médicale",
    template: "%s | Shifa-Connect",
  },
  description: "Plateforme de gestion de cabinet médical pour médecins généralistes algériens. Gérez vos patients, consultations, ordonnances et rendez-vous.",
  keywords: ["Shifa-Connect", "الشفاء كونيكت", "gestion médicale", "cabinet médical", "Algérie", "médecin généraliste", "ordonnance", "consultation"],
  authors: [{ name: "Selma Haci" }],
  icons: {
    icon: "/image.png",
  },
  openGraph: {
    title: "Shifa-Connect | Gestion Médicale",
    description: "Plateforme de gestion de cabinet médical pour médecins généralistes algériens",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Noto Sans Arabic for RTL support */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
          <SonnerToaster position="top-center" expand={false} richColors />
        </Providers>
      </body>
    </html>
  );
}
