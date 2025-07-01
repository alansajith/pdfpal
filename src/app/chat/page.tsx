"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ChatBox from "@/components/ChatBox";
import PDFUploader from "@/components/PDFUploader";

interface PDF {
  id: string;
  file_name: string;
  file_size?: number;
  num_pages?: number;
}

export default function ChatPage() {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [selectedPdfId, setSelectedPdfId] = useState<string>("");
  const [showUploader, setShowUploader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch PDFs on mount
  useEffect(() => {
    const fetchPDFs = async () => {
      setLoading(true);
      setError(null);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        setError("You must be signed in to chat with your PDFs.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("pdfs")
        .select("id, file_name, file_size, num_pages")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false });
      if (error) {
        setError(error.message);
      } else {
        setPdfs(data || []);
      }
      setLoading(false);
    };
    fetchPDFs();
  }, []);

  // Set selectedPdfId only on initial load or when pdfs change and selectedPdfId is empty
  useEffect(() => {
    if (pdfs.length > 0 && !selectedPdfId) {
      setSelectedPdfId(pdfs[0].id);
    }
  }, [pdfs, selectedPdfId]);

  const handleUploadSuccess = (pdf: PDF) => {
    setPdfs((prev) => [pdf, ...prev]);
    setShowUploader(false);
    setSelectedPdfId(pdf.id);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen w-full flex justify-center pt-24  overflow-hidden">
      <div className="flex flex-row w-full max-w-5xl h-[calc(100vh-6rem)] bg-transparent rounded-2xl shadow-none pb-5 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 h-full bg-white/80 border-r border-gray-200 flex flex-col p-4 gap-4 overflow-hidden">
          <h2 className="text-lg font-bold text-gray-700 mb-2">
            Your Documents
          </h2>
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
            {loading ? (
              <div className="text-gray-500 text-center">Loading...</div>
            ) : error ? (
              <div className="text-red-600 text-center">{error}</div>
            ) : pdfs.length === 0 ? (
              <div className="text-gray-500 text-center">No PDFs found.</div>
            ) : (
              pdfs.map((pdf) => (
                <button
                  key={pdf.id}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left border transition-all ${
                    selectedPdfId === pdf.id
                      ? "bg-gradient-to-r from-orange-100 to-pink-100 border-orange-300"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedPdfId(pdf.id)}
                >
                  <span
                    className={`rounded-xl p-2 ${
                      selectedPdfId === pdf.id
                        ? "bg-gradient-to-br from-orange-400 to-pink-500"
                        : "bg-gradient-to-br from-purple-400 to-blue-400"
                    }`}
                  >
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <rect
                        width="24"
                        height="24"
                        rx="8"
                        fill="currentColor"
                        opacity="0.15"
                      />
                      <path
                        d="M8 7a2 2 0 012-2h4a2 2 0 012 2v10a2 2 0 01-2 2h-4a2 2 0 01-2-2V7z"
                        stroke="#fff"
                        strokeWidth="2"
                      />
                      <path
                        d="M9 9h6"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9 13h6"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9 17h2"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <div className="flex flex-col flex-1">
                    <span className="font-semibold text-gray-900 truncate">
                      {pdf.file_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {pdf.num_pages ?? "-"} pages &bull;{" "}
                      {pdf.file_size
                        ? (pdf.file_size / (1024 * 1024)).toFixed(1) + " MB"
                        : "-"}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
          <button
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl py-3 text-gray-700 font-semibold bg-white hover:bg-gray-50 transition-all"
            onClick={() => setShowUploader((v) => !v)}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 4v16m8-8H4"
                stroke="#555"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Upload PDF
          </button>
          {showUploader && (
            <div className="mt-4">
              <PDFUploader onUploadSuccess={handleUploadSuccess} />
            </div>
          )}
        </div>
        {/* Main Chat Area */}
        <div className="flex-1 h-full flex flex-col overflow-hidden">
          <div className="w-full h-full flex-1 flex flex-col">
            {!selectedPdfId ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="rounded-full bg-green-100 p-4 mb-4">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                    <rect
                      width="24"
                      height="24"
                      rx="8"
                      fill="#22c55e"
                      opacity="0.15"
                    />
                    <path
                      d="M8 7a2 2 0 012-2h4a2 2 0 012 2v10a2 2 0 01-2 2h-4a2 2 0 01-2-2V7z"
                      stroke="#22c55e"
                      strokeWidth="2"
                    />
                    <path
                      d="M9 9h6"
                      stroke="#22c55e"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9 13h6"
                      stroke="#22c55e"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9 17h2"
                      stroke="#22c55e"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="text-xl font-semibold text-gray-700 mb-2 text-center">
                  Hello! I'm your PDF assistant. Upload a document or ask me
                  anything about your existing PDFs.
                </div>
                <div className="text-gray-400 text-sm">Just now</div>
              </div>
            ) : (
              <ChatBox pdfId={selectedPdfId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
