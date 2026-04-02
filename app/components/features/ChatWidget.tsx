"use client";

import { useEffect, useState, useRef } from "react";
import { Sparkles, SendHorizontal } from "lucide-react";

const API_URL = "http://localhost:8000/api/v0/ask";

const SUGGESTIONS = [
  "List all active interns",
  "How many tasks are pending?",
  "Show completed tasks",
  "Interns by department",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const setWelcome = () => {
    setShowSuggestions(true);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        type: "text",
        content:
          "👋 Hello! I'm your **Assistant**. Ask me anything about interns, tasks, or reports.",
      },
    ]);
  };

  useEffect(() => {
    if (open && messages.length === 0) {
      setWelcome();
    }
  }, [open]);

  const sendMessage = async (question: string, fromSuggestion = false) => {
    const q = question.trim();
    if (!q || loading) return;

    setShowSuggestions(false);

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", type: "text", content: q },
    ]);

    setInput("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Query failed");

      const hasData = data.results?.length > 0;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          type: hasData ? "data" : "text",
          content: hasData
            ? `📊 Found **${data.results.length}** record(s)`
            : "⚠️ No records found",
          columns: data.columns,
          rows: data.results,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          type: "error",
          content: "❌ " + (err.message || "Something went wrong"),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderText = (text: string) =>
    text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
      i % 2 ? <strong key={i}>{part}</strong> : part
    );

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="group fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full
            bg-linear-to-br from-indigo-600 to-purple-600 text-white shadow-xl
            hover:shadow-indigo-500/40 hover:scale-110 active:scale-95
            transition-all duration-300 ease-out"
        type="button"
      >
        {/* Glow Ring */}
        <span className="absolute inset-0 rounded-full bg-indigo-500 opacity-20 blur-lg group-hover:opacity-40 transition"></span>

        {/* Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 relative z-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 20l1.2-3.2A7.94 7.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed z-50 flex flex-col backdrop-blur-xl bg-white/80 border border-gray-100 shadow-2xl rounded-4xl transition-all duration-300
        ${open ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}
        ${isMaximized
            ? "bottom-10 right-10 w-[620px] h-[650px]"
            : "bottom-20 right-6 w-[380px] h-[520px]"
          }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-900 text-white rounded-t-4xl shrink-0">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Internship Management System AI
          </span>

          <div className="flex gap-3 text-lg">
            <button onClick={setWelcome} className="hover:scale-110 transition" type="button">🔄</button>
            <button onClick={() => setIsMaximized((v) => !v)} className="hover:scale-110 transition" type="button">
              {isMaximized ? "🗕" : "🗖"}
            </button>
            <button onClick={() => setOpen(false)} className="hover:scale-110 transition" type="button">✕</button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl text-sm max-w-[90%] shadow-sm transition
                ${msg.role === "user"
                    ? "bg-linear-to-r from-indigo-500 to-purple-600 text-white"
                    : "bg-white/80 backdrop-blur border border-white/50"
                  }`}
              >
                <div className="leading-relaxed">{renderText(msg.content)}</div>

                {/* Suggestions */}
                {msg.id === "welcome" && showSuggestions && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s, true)}
                        className="text-xs px-3 py-1.5 bg-indigo-50/50 border border-indigo-100 rounded-full hover:bg-indigo-100 hover:scale-105 transition duration-200 text-indigo-700"
                        type="button"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {/* Data Table */}
                {msg.type === "data" && msg.rows?.length > 0 && (
                  <div className="mt-4 overflow-hidden rounded-xl border bg-white shadow-inner">
                    <div className="overflow-auto max-h-[300px]">
                      <table className="text-xs w-full">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            {msg.columns.map((col: string) => (
                              <th
                                key={col}
                                className="px-4 py-3 text-left font-semibold border-b text-gray-700 uppercase tracking-tight"
                              >
                                {col.replace(/_/g, ' ')}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {msg.rows.slice(0, 15).map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                              {msg.columns.map((col: string) => (
                                <td key={col} className="px-4 py-2.5 border-b text-gray-600">
                                  {row[col] === null || row[col] === undefined ? "—" : String(row[col])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Animation */}
          {loading && (
            <div className="flex gap-1.5 px-3 py-2 bg-white/50 w-max rounded-full border border-white/30 backdrop-blur-sm self-start">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="p-4 flex gap-3 border-t bg-white/80 backdrop-blur-md rounded-b-2xl shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            className="flex-1 border border-indigo-100 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white/50 backdrop-blur-sm transition-all"
            placeholder="Ask AI about interns, tasks, etc..."
          />
          <button
            onClick={() => sendMessage(input)}
            className="bg-slate-900 text-white w-10 h-10 rounded-xl hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-indigo-100"
            type="button"
          >
            <SendHorizontal width={18} height={18} />
          </button>
        </div>
      </div>
    </>
  );
}