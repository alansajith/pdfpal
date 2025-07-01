import React, { useState, useEffect, useRef } from "react";
import { BotIcon } from "lucide-react";

interface ChatBoxProps {
  pdfId: string;
}

interface Message {
  role: "user" | "ai";
  text: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ pdfId }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset chat when pdfId changes
  useEffect(() => {
    setMessages([]);
    setInput("");
    setError(null);
  }, [pdfId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { role: "user", text: input }]);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfId, question: input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setMessages((msgs) => [...msgs, { role: "ai", text: data.answer }]);
      setInput("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Only show the welcome message if there are no messages
  const showWelcome = messages.length === 0;

  return (
    <div className="flex flex-col w-full h-full ">
      <div className="flex flex-col w-full h-full bg-white rounded-r-2xl shadow-xl border border-gray-200 p-0">
        <div className="flex-1 flex flex-col justify-start px-6 pt-6 pb-2 overflow-y-auto">
          {showWelcome ? (
            <div className="flex items-start gap-3 mb-2">
              <span className="inline-flex items-center gap-1">
                <BotIcon className="w-4 h-4 inline-block text-[#7b61ff] align-middle" />
                :
              </span>
              <div className="flex flex-col">
                <div className="bg-white rounded-xl px-4 py-3 shadow border border-gray-100 text-gray-800 text-base max-w-[340px]">
                  Hello! I&apos;m your PDF assistant. Upload a document or ask
                  me anything about your existing PDFs.
                </div>
                <span className="text-xs text-gray-400 mt-1 ml-1">
                  Just now
                </span>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                } mb-2`}
              >
                <div
                  className={
                    msg.role === "user"
                      ? "bg-blue-100 text-blue-900 px-4 py-2 rounded-lg max-w-[80%]"
                      : "bg-gray-100 text-black px-4 py-2 rounded-lg max-w-[80%]"
                  }
                >
                  <b>
                    {msg.role === "user" ? (
                      "You:"
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <BotIcon className="w-4 h-4 inline-block text-[#7b61ff] align-middle" />
                        :
                      </span>
                    )}
                  </b>{" "}
                  {msg.text}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        {error && <div className="text-red-600 text-sm mb-2 px-6">{error}</div>}
        <div className="flex items-center gap-2 px-4 py-3 border-t bg-white rounded-b-2xl">
          <input
            type="text"
            className="flex-1 border px-3 py-2 rounded-lg text-black bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Ask me anything about your PDFs..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            disabled={loading}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 hover:bg-blue-700 transition"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M3 12l18-7-7 18-2.5-7L3 12z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
