"use client";
import Image from "next/image";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Modern SaaS-style Header */}
        <header className="sticky top-0 z-50 w-full flex items-center justify-between px-8 py-4  backdrop-blur shadow-lg rounded-full">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#7b61ff] to-[#5f47c7] rounded-xl p-2">
              <Image
                src="/file.svg"
                alt="PDF Pal Logo"
                width={32}
                height={32}
              />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-[#7b61ff] to-[#5f47c7] bg-clip-text text-transparent tracking-tight">
              <Link href="/">PDF Pal</Link>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-lg font-semibold text-black hover:text-[#7b61ff] transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/chat"
              className="px-6 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-[#7b61ff] to-[#5f47c7] shadow hover:from-[#5f47c7] hover:to-[#7b61ff] transition-colors text-lg"
            >
              Start Chatting
            </Link>

            {user ? (
              <button
                onClick={handleSignOut}
                className="ml-2 px-6 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg transition-transform duration-200 hover:scale-105 hover:from-purple-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/auth"
                className="ml-2 px-6 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-green-400 to-blue-500 shadow-lg transition-transform duration-200 hover:scale-105 hover:from-blue-500 hover:to-green-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                Sign In
              </Link>
            )}
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
