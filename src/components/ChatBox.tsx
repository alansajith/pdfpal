import React, { useState, useEffect, useRef } from "react";

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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl h-[60vh] bg-white/70 rounded-xl shadow-lg p-4 relative">
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={
              msg.role === "user"
                ? "self-end bg-blue-100 text-blue-900 px-3 py-2 rounded-lg max-w-[80%]"
                : "self-start bg-gray-100 text-black px-3 py-2 rounded-lg max-w-[80%]"
            }
          >
            <b>{msg.role === "user" ? "You" : "Gemini"}:</b> {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      <div className="flex gap-2 mt-2 sticky bottom-0 bg-white/80 p-2 rounded-xl shadow">
        <input
          type="text"
          className="flex-1 border px-2 py-1 rounded text-black"
          placeholder="Ask a question about your PDF..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          disabled={loading}
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
