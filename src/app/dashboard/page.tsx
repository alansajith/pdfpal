"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PDFUploader from "@/components/PDFUploader";
import Link from "next/link";

interface PDF {
  id: string;
  file_name: string;
  uploaded_at: string;
  storage_path?: string;
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
      .select("id, file_name, uploaded_at, storage_path")
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
            <ul className="divide-y divide-gray-200">
              {pdfs.map((pdf) => (
                <li
                  key={pdf.id}
                  className="py-4 flex justify-between items-center hover:bg-blue-50 transition-colors rounded px-2"
                >
                  <div>
                    <span className="text-lg text-gray-900 font-medium">
                      {pdf.file_name}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {new Date(pdf.uploaded_at).toLocaleString()}
                    </span>
                  </div>
                  <button
                    className={`ml-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow transition-colors ${
                      deletingId === pdf.id
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={() => handleDelete(pdf)}
                    disabled={deletingId === pdf.id}
                  >
                    {deletingId === pdf.id ? "Deleting..." : "Delete"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Link
        href="/chat"
        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-colors z-50"
      >
        Go to Chat
      </Link>
    </div>
  );
}
