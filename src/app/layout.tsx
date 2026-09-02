import type { Metadata, Viewport } from "next";
import "./globals.css";
import { profile } from "@/config/linktree";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: `💜 ${profile.title}`,
  description: profile.introDescription,
  openGraph: {
    title: profile.title,
    description: profile.introDescription,
    images: ["/assets/room4.png"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
