"use client";
import React, { useRef, useState, DragEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

interface PDF {
  id: string;
  file_name: string;
  uploaded_at: string;
  storage_path?: string;
  file_size?: number;
  num_pages?: number;
}

interface PDFUploaderProps {
  onUploadSuccess?: (pdf: PDF) => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onUploadSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = (file: File) => {
    if (file.type !== "application/pdf") {
      setMessage("Only PDF files are allowed.");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setMessage(null);
    handleUpload(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (uploading || processing) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setMessage(null);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setMessage("You must be signed in to upload.");
      setUploading(false);
      return;
    }
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from("pdfs")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });
    setUploading(false);
    if (error) {
      setMessage(`Upload failed: ${error.message}`);
      return;
    } else {
      setMessage("Upload successful! Processing PDF...");
      setProcessing(true);
      // Call API to process PDF
      const res = await fetch("/api/pdf/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          fileName: file.name,
          storagePath: filePath,
        }),
      });
      const data = await res.json();
      setProcessing(false);
      if (!res.ok) {
        setMessage(`Processing failed: ${data.error || "Unknown error"}`);
      } else {
        setMessage("PDF processed and indexed successfully!");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        // Fetch the new PDF row from Supabase and call onUploadSuccess
        const { data: pdfRows, error: pdfFetchError } = await supabase
          .from("pdfs")
          .select(
            "id, file_name, uploaded_at, storage_path, file_size, num_pages"
          )
          .eq("user_id", user.id)
          .eq("file_name", file.name)
          .order("uploaded_at", { ascending: false })
          .limit(1);
        if (
          !pdfFetchError &&
          pdfRows &&
          pdfRows.length > 0 &&
          onUploadSuccess
        ) {
          onUploadSuccess(pdfRows[0]);
        }
      }
    }
  };

  return (
    <div
      className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[320px] border-2 border-dashed border-gray-300 rounded-2xl bg-white/80 p-12 text-center transition-all duration-200 hover:border-blue-400"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      tabIndex={0}
      aria-label="PDF upload area"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 p-6 mb-2 flex items-center justify-center">
          {/* Use a heroicon or fallback svg */}
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
            <rect width="24" height="24" rx="8" fill="url(#paint0_linear)" />
            <path
              d="M12 17V7m0 0l-4 4m4-4l4 4"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient
                id="paint0_linear"
                x1="0"
                y1="0"
                x2="24"
                y2="24"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#60a5fa" />
                <stop offset="1" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <p className="text-lg text-gray-500 mb-4">
          Drag and drop your PDF files here, or click to browse
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleBrowse}
          disabled={uploading || processing}
        />
        <button
          type="button"
          className="mt-2 px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg shadow transition-all duration-200 hover:from-purple-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || processing}
        >
          Choose Files
        </button>
        {selectedFile && (
          <div className="mt-4 text-base text-black font-semibold">
            {selectedFile.name}
          </div>
        )}
        {message && (
          <div
            className={`mt-4 text-base font-semibold transition-opacity duration-500 animate-fade-in 
              ${
                message.toLowerCase().includes("success")
                  ? "text-green-600"
                  : ""
              }
              ${
                message.toLowerCase().includes("fail") ||
                message.toLowerCase().includes("error")
                  ? "text-red-600"
                  : ""
              }
              ${
                message.toLowerCase().includes("processing")
                  ? "text-blue-600"
                  : ""
              }
            `}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFUploader;

<style jsx global>{`
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  .animate-fade-in {
    animation: fade-in 0.7s;
  }
`}</style>;
