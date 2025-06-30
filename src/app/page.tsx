"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BotIcon, FileKeyIcon, ZapIcon } from "lucide-react";

export default function Home() {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#e0e7ff] via-[#f3e8ff] to-[#c3cfe2] flex flex-col items-center px-2 pb-12 font-sans">
      {/* Hero Section */}
      <header className="w-full max-w-5xl mx-auto flex flex-col items-center pt-24 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-br from-[#7b61ff] to-[#5f47c7] rounded-2xl p-3 shadow-xl">
            <Image src="/file.svg" alt="PDF Pal Logo" width={40} height={40} />
          </div>
          <span className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#7b61ff] to-[#5f47c7] bg-clip-text text-transparent tracking-tight drop-shadow">
            PDF Pal
          </span>
        </div>
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#e0e7ff] to-[#f3e8ff] text-[#7b61ff] font-semibold text-base shadow-md backdrop-blur">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41m12.02 0l1.41-1.41M6.34 6.34L4.93 4.93"
                stroke="#7b61ff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Powered by Gemini AI
          </span>
        </div>
        <h1
          className="text-6xl md:text-7xl font-extrabold text-[#7b61ff] text-center mb-6 leading-tight drop-shadow-lg"
          style={{ fontFamily: "Poppins, Inter, sans-serif" }}
        >
          Chat with Your
          <br />
          Documents! <span className="inline-block align-middle">🐻</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 text-center max-w-2xl mb-10 font-medium">
          Upload your PDFs, chat with them using Gemini AI, and manage your
          documents securely with Supabase.{" "}
          <span className="font-bold text-gray-900">
            Fast, private, and easy to use.
          </span>
        </p>
        <div className="flex gap-6 mb-12">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-gradient-to-r from-[#7b61ff] to-[#5f47c7] hover:from-[#5f47c7] hover:to-[#7b61ff] text-white font-bold py-4 px-10 rounded-full shadow-xl text-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7b61ff] focus:ring-offset-2 backdrop-blur-sm"
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path
                d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 22h6"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Dashboard
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-600 hover:to-green-400 text-white font-bold py-4 px-10 rounded-full shadow-xl text-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 backdrop-blur-sm"
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Chat
          </Link>
        </div>
        <div className="mt-10">
          <div className="mx-auto w-32 h-32 bg-white/70 backdrop-blur rounded-3xl shadow-2xl flex items-center justify-center relative">
            <Image src="/file.svg" alt="PDF Icon" width={70} height={70} />
            <span className="absolute -top-3 -right-3 bg-gradient-to-br from-[#7b61ff] to-[#5f47c7] text-white rounded-full p-3 shadow-lg border-2 border-white">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 5v14m7-7H5"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="w-full max-w-6xl mx-auto mt-12 flex flex-col items-center">
        <h2
          className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-6"
          style={{ fontFamily: "Poppins, Inter, sans-serif" }}
        >
          Why Choose PDF Pal?
        </h2>
        <p className="text-xl text-gray-600 text-center mb-14 max-w-2xl font-medium">
          Experience the future of document interaction with our cutting-edge
          features
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
          {/* Feature 1 */}
          <div className="bg-white/70 backdrop-blur rounded-2xl shadow-2xl p-10 flex flex-col items-center text-center">
            <div className="bg-gradient-to-br from-[#7b61ff] to-[#a78bfa] rounded-xl p-5 mb-5 shadow-lg">
              <BotIcon className="w-10 h-10 text-white" />
            </div>
            <h3
              className="text-2xl text-gray-900 font-semibold mb-3"
              style={{ fontFamily: "Poppins, Inter, sans-serif" }}
            >
              AI-Powered Chat
            </h3>
            <p className="text-gray-600 text-lg font-medium">
              Leverage Gemini AI to have natural conversations with your PDFs.
              Ask questions, get summaries, and extract insights instantly.
            </p>
          </div>
          {/* Feature 2 */}
          <div className="bg-white/70 backdrop-blur rounded-2xl shadow-2xl p-10 flex flex-col items-center text-center">
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-5 mb-5 shadow-lg">
              <FileKeyIcon className="w-10 h-10 text-white" />
            </div>
            <h3
              className="text-2xl font-bold mb-3 text-gray-900"
              style={{ fontFamily: "Poppins, Inter, sans-serif" }}
            >
              Secure Storage
            </h3>
            <p className="text-gray-600 text-lg font-medium">
              Your documents are safely stored with Supabase&apos;s
              enterprise-grade security. Privacy and data protection guaranteed.
            </p>
          </div>
          {/* Feature 3 */}
          <div className="bg-white/70 backdrop-blur rounded-2xl shadow-2xl p-10 flex flex-col items-center text-center">
            <div className="bg-gradient-to-br from-[#7b61ff] to-[#a78bfa] rounded-xl p-5 mb-5 shadow-lg">
              <ZapIcon className="w-10 h-10 text-white" />
            </div>
            <h3
              className="text-2xl font-bold mb-3 text-gray-900"
              style={{ fontFamily: "Poppins, Inter, sans-serif" }}
            >
              Lightning Fast
            </h3>
            <p className="text-gray-600 text-lg font-medium">
              Get instant responses to your queries. Our optimized
              infrastructure ensures smooth and rapid document processing.
            </p>
          </div>
        </div>
      </section>
      <footer className="mt-16 text-gray-500 text-base text-center w-full">
        &copy; {year ?? "----"} PDF Pal. Powered by Next.js, Supabase, and
        Gemini.
      </footer>
    </div>
  );
}
