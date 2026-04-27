import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Client Project Tracker | Alessandra Ensley — Creative Studio",
  description: "Real-time collaborative client project management for agencies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
