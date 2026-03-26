import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { SessionProviderWrapper } from "./components/SessionProviderWrapper";
import { ReduxProvider } from "./lib/redux/ReduxProvider";
import { NotificationCenter } from "./components/NotificationCenter";

const outfit = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Intern Management System",
  description: "Complete Intern Management System using Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${inter.variable} font-sans antialiased`}
      >
        <ReduxProvider>
          <SessionProviderWrapper>
            {children}
            <NotificationCenter />
          </SessionProviderWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
}
