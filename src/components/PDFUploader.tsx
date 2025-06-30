"use client";
import React, { useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface PDF {
  id: string;
  file_name: string;
  uploaded_at: string;
  storage_path?: string;
}

interface PDFUploaderProps {
  onUploadSuccess?: (pdf: PDF) => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onUploadSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setMessage("Please select a PDF file.");
      return;
    }
    if (file.type !== "application/pdf") {
      setMessage("Only PDF files are allowed.");
      return;
    }
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
        if (fileInputRef.current) fileInputRef.current.value = "";
        setSelectedFileName("");
        // Fetch the new PDF row from Supabase and call onUploadSuccess
        const { data: pdfRows, error: pdfFetchError } = await supabase
          .from("pdfs")
          .select("id, file_name, uploaded_at, storage_path")
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
    <div className="flex flex-col gap-2 w-full max-w-md">
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          disabled={uploading || processing}
          className="hidden"
          onChange={(e) => {
            setMessage(null);
            setSelectedFileName(e.target.files?.[0]?.name || "");
          }}
        />
        <button
          type="button"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold shadow transition-colors"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || processing}
        >
          Choose PDF File
        </button>
        <span className="text-gray-700 text-sm font-medium truncate max-w-[140px]">
          {selectedFileName || "No file chosen"}
        </span>
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded font-semibold shadow transition-colors disabled:opacity-50"
        onClick={handleUpload}
        disabled={uploading || processing}
      >
        {uploading
          ? "Uploading..."
          : processing
          ? "Processing..."
          : "Upload PDF"}
      </button>
      {message && (
        <div
          className={`text-base mt-2 font-semibold transition-opacity duration-500 animate-fade-in 
            ${message.toLowerCase().includes("success") ? "text-green-600" : ""}
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
