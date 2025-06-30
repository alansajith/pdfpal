import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import pdfParse from "pdf-parse";
import { gemini } from "@/lib/geminiClient";

// Helper to split text into chunks of ~1000 characters
function splitTextIntoChunks(text: string, chunkSize = 1000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { userId, fileName, storagePath } = req.body;
    if (!userId || !fileName || !storagePath) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Download PDF from Supabase Storage
    const { data, error } = await supabase.storage
      .from("pdfs")
      .download(storagePath);
    if (error || !data) {
      return res.status(500).json({ error: "Failed to download PDF" });
    }
    const buffer = Buffer.from(await data.arrayBuffer());

    // Extract text from PDF
    const parsed = await pdfParse(buffer);
    const extractedText = parsed.text;

    // Store PDF metadata in 'pdfs' table
    const { data: pdfRow, error: pdfError } = await supabase
      .from("pdfs")
      .insert([
        {
          user_id: userId,
          file_name: fileName,
          storage_path: storagePath,
          extracted_text: extractedText,
        },
      ])
      .select()
      .single();
    if (pdfError || !pdfRow) {
      return res.status(500).json({ error: "Failed to insert PDF metadata" });
    }

    // Split text into chunks and store in 'pdf_chunks'
    const chunks = splitTextIntoChunks(extractedText);
    // Generate embeddings for each chunk
    const embeddingModel = gemini.getGenerativeModel({
      model: "embedding-001",
    });
    const chunkRows = [];
    for (let idx = 0; idx < chunks.length; idx++) {
      const content = chunks[idx];
      let embedding = null;
      try {
        const embeddingResult = await embeddingModel.embedContent({
          content: { role: "user", parts: [{ text: content }] },
        });
        embedding = embeddingResult.embedding?.values || null;
      } catch {
        embedding = null;
      }
      chunkRows.push({
        pdf_id: pdfRow.id,
        chunk_index: idx,
        content,
        embedding,
      });
    }
    const { error: chunkError } = await supabase
      .from("pdf_chunks")
      .insert(chunkRows);
    if (chunkError) {
      return res.status(500).json({ error: "Failed to insert PDF chunks" });
    }

    return res
      .status(200)
      .json({ status: "ok", pdfId: pdfRow.id, chunkCount: chunks.length });
  } catch (err: unknown) {
    return res
      .status(500)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
}
