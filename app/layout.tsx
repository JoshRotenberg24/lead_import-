import type { Metadata } from "next";
import "./globals.css";
import { AuthSessionProvider } from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "Lead Import Tool",
  description: "Upload and clean CSV files for AgentWebsite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
