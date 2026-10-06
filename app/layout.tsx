import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAVS — Rainy AI Video Studio",
  description: "Монгол хэл дээрх AI video & image creative studio"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn">
      <body>{children}</body>
    </html>
  );
}
