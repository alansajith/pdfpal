import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import { gemini } from "@/lib/geminiClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { pdfId, question } = req.body;
    if (!pdfId || !question) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Fetch all chunks and their embeddings for the PDF
    const { data: chunks, error } = await supabase
      .from("pdf_chunks")
      .select("content, embedding")
      .eq("pdf_id", pdfId)
      .order("chunk_index", { ascending: true });
    if (error || !chunks || chunks.length === 0) {
      return res.status(404).json({ error: "No content found for this PDF" });
    }

    // Generate embedding for the user question
    const embeddingModel = gemini.getGenerativeModel({
      model: "embedding-001",
    });
    const queryEmbeddingResult = await embeddingModel.embedContent({
      content: { role: "user", parts: [{ text: question }] },
    });
    const queryEmbedding = queryEmbeddingResult.embedding?.values;
    if (!queryEmbedding) {
      return res
        .status(500)
        .json({ error: "Failed to generate query embedding" });
    }

    // Compute cosine similarity between query and each chunk
    function cosineSimilarity(a: number[], b: number[]) {
      let dot = 0.0,
        normA = 0.0,
        normB = 0.0;
      for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
      }
      return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    const scoredChunks = chunks
      .filter(
        (c) =>
          Array.isArray(c.embedding) &&
          c.embedding.length === queryEmbedding.length
      )
      .map((c) => ({
        ...c,
        score: cosineSimilarity(queryEmbedding, c.embedding),
      }));
    scoredChunks.sort((a, b) => b.score - a.score);
    const topChunks = scoredChunks.slice(0, 3);
    const context = topChunks.map((c) => c.content).join("\n\n");
    const prompt = `Context from PDF:\n${context}\n\nUser question: ${question}\n\nAnswer:`;

    // Call Gemini (Gemini 2.0 Flash)
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    console.log("Gemini result:", result);
    let answer = "No answer generated.";
    try {
      const candidate =
        result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
      const text =
        typeof candidate === "string"
          ? candidate
          : typeof result.response?.text === "string"
          ? result.response?.text
          : undefined;
      answer = text ? text.trim() : "No answer generated.";
    } catch {
      answer = "No answer generated.";
    }

    return res.status(200).json({ answer });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
