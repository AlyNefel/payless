import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Payless Car Rental Tunisie — Your Journey. Your Freedom.",
  description: "Location de voitures en Tunisie. Véhicules neufs et économiques à Tunis-Carthage, Monastir, Enfidha, Hammamet, Sousse, Sfax.",
  other: {
    "darkreader-lock": "",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="darkreader-lock" content="true" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
