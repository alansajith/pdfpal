"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ChatBox from "@/components/ChatBox";

interface PDF {
  id: string;
  file_name: string;
}

export default function ChatPage() {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [selectedPdfId, setSelectedPdfId] = useState<string>("");
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
        .select("id, file_name")
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl bg-white/60 backdrop-blur rounded-2xl shadow-xl p-8 flex flex-col items-center relative">
        <h2 className="text-4xl font-bold mb-2 text-blue-900 text-center">
          Chat with your PDF
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Select a PDF and ask questions about its content. Powered by Gemini
          2.0 Flash.
        </p>
        <div className="w-full mb-6">
          {loading ? (
            <div className="text-center text-gray-500">Loading PDFs...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : pdfs.length === 0 ? (
            <div className="text-center text-gray-500">
              No PDFs found. Please upload one in the dashboard.
            </div>
          ) : (
            <select
              className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={selectedPdfId}
              onChange={(e) => setSelectedPdfId(e.target.value)}
              disabled={loading || pdfs.length === 0}
            >
              {pdfs.map((pdf) => (
                <option key={pdf.id} value={pdf.id}>
                  {pdf.file_name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="w-full">
          {selectedPdfId && <ChatBox pdfId={selectedPdfId} />}
        </div>
      </div>
    </div>
  );
}
