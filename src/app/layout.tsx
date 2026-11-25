import type { Metadata, Viewport } from "next";
import { THEME_INIT_SCRIPT } from "@/shared/lib/theme";
import "@/styles/index.css";

export const metadata: Metadata = {
  title: "Efficht — School Management",
  description: "A professional school management workspace.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#105c59",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Sets light or dark before the page is drawn. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
