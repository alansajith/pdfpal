"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PDFUploader from "@/components/PDFUploader";
import Link from "next/link";
import { Trash2, MessageCircle } from "lucide-react";

interface PDF {
  id: string;
  file_name: string;
  uploaded_at: string;
  storage_path?: string;
  file_size?: number;
  num_pages?: number;
}

export default function DashboardPage() {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPDFs = async () => {
    setLoading(true);
    setError(null);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setError("You must be signed in to view your PDFs.");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("pdfs")
      .select("id, file_name, uploaded_at, storage_path, file_size, num_pages")
      .eq("user_id", user.id)
      .order("uploaded_at", { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setPdfs(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPDFs();
  }, []);

  const handleDelete = async (pdf: PDF) => {
    setDeletingId(pdf.id);
    setError(null);
    setSuccess(null);
    // Delete from storage
    if (pdf.storage_path) {
      console.log("Deleting from storage:", pdf.storage_path);
      const { error: storageError } = await supabase.storage
        .from("pdfs")
        .remove([pdf.storage_path]);
      if (storageError) {
        console.log("Storage error:", storageError);
        setError("Failed to delete file from storage: " + storageError.message);
        setDeletingId(null);
        return;
      }
    }
    // Delete from database
    const { error: dbError } = await supabase
      .from("pdfs")
      .delete()
      .eq("id", pdf.id);
    if (dbError) {
      setError("Failed to delete from database: " + dbError.message);
    } else {
      setSuccess("PDF deleted successfully.");
      fetchPDFs();
    }
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center justify-start py-12 px-4">
      <div className="w-full max-w-2xl relative">
        <h1 className="text-4xl font-bold text-center mb-2 text-blue-900">
          Your PDF Library
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Upload and manage your PDF documents. Click a file to chat with it on
          the chat page.
        </p>
        <div className="bg-white/60 backdrop-blur rounded-2xl shadow-xl p-8 mb-8 flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-4 text-blue-800">
            Upload a PDF
          </h2>
          <PDFUploader
            onUploadSuccess={(newPdf) => {
              setPdfs((prev) => [newPdf, ...prev]);
              setError(null);
              setSuccess(null);
            }}
          />
        </div>
        <div className="bg-white/60 backdrop-blur rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">
            Your Uploaded PDFs
          </h2>
          {error && (
            <div className="text-center text-red-600 mb-2">{error}</div>
          )}
          {success && (
            <div className="text-center text-green-600 mb-2">{success}</div>
          )}
          {loading ? (
            <div className="text-center text-gray-700 font-semibold">
              Loading...
            </div>
          ) : pdfs.length === 0 ? (
            <div className="text-center text-gray-700 font-semibold">
              No PDFs uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pdfs.map((pdf) => (
                <div
                  key={pdf.id}
                  className="rounded-2xl bg-white shadow-lg p-6 flex flex-col gap-4 border border-gray-100 relative"
                >
                  {/* Dustbin icon button */}
                  <button
                    className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-red-100 transition-colors"
                    title="Delete PDF"
                    aria-label="Delete PDF"
                    onClick={() => handleDelete(pdf)}
                    disabled={deletingId === pdf.id}
                  >
                    <Trash2 width={20} height={20} className="text-red-500" />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 p-3 flex items-center justify-center">
                      <svg
                        width="32"
                        height="32"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          width="24"
                          height="24"
                          rx="8"
                          fill="url(#pdfcard_linear)"
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
                        <defs>
                          <linearGradient
                            id="pdfcard_linear"
                            x1="0"
                            y1="0"
                            x2="24"
                            y2="24"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="#fb923c" />
                            <stop offset="1" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                      {pdf.file_name}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-gray-600 text-base">
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>
                        {pdf.file_size
                          ? (pdf.file_size / (1024 * 1024)).toFixed(2) + " MB"
                          : "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pages:</span>
                      <span>{pdf.num_pages ?? "Unknown"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uploaded:</span>
                      <span>{new Date(pdf.uploaded_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <Link href={`/chat?pdfId=${pdf.id}`} className="mt-4">
                    <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold text-lg shadow hover:from-green-600 hover:to-green-400 transition-all">
                      <MessageCircle
                        width={22}
                        height={22}
                        className="text-white"
                      />
                      Chat with PDF
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
