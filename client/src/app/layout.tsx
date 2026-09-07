import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HoneyChain | Blockchain-based Honey Traceability",
  description: "From Hive to Home, Verified on Blockchain. Ensuring quality and origin of pure honey.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-body bg-cream text-brown min-h-screen flex flex-col`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

