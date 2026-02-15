import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex-sans",
  weight: ["400", "500", "600", "700"]
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Portfolio - Nuno Castilho",
  description:
    "Digital HQ and technical portfolio for Nuno Castilho. Senior software engineering, cloud-native delivery, and consultancy projects.",
  metadataBase: new URL("https://zonumi.com"),
  icons: {
    icon: "/branding/brand/zonumi-menu-icon.png",
    shortcut: "/branding/brand/zonumi-menu-icon.png",
    apple: "/branding/brand/zonumi-menu-icon.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plexSans.variable} ${jetBrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
