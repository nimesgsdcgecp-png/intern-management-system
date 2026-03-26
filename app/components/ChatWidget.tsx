// ai assistant component - a floating chat widget that allows users to ask questions about the interns, tasks, departments, and mentors. It sends the question to the backend API and displays the response in a chat-like interface. The assistant can also show data tables if the response contains tabular data.

export const ChatWidget = () => {
  return <div>Chat Widget</div>;
};

// "use client";

// import { useEffect, useState, useRef } from "react";

// const API_URL = "http://localhost:8000/api/v0/ask";

// const SUGGESTIONS = [
//   "List all active interns",
//   "How many tasks are pending?",
//   "Show completed tasks",
//   "Interns by department",
// ];

// export function ChatWidget() {
//   const [open, setOpen] = useState(false);
//   const [isMaximized, setIsMaximized] = useState(false);
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [showSuggestions, setShowSuggestions] = useState(true);

//   const endRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     endRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const setWelcome = () => {
//     setShowSuggestions(true);
//     setMessages([
//       {
//         id: "welcome",
//         role: "assistant",
//         type: "text",
//         content:
//           "👋 Hello! I'm your **InternHub AI**. Ask anything about interns, tasks, or reports.",
//       },
//     ]);
//   };

//   useEffect(() => {
//     if (open && messages.length === 0) {
//       setWelcome();
//     }
//   }, [open]);

//   const sendMessage = async (question: string, fromSuggestion = false) => {
//     const q = question.trim();
//     if (!q || loading) return;

//      setShowSuggestions(false);

//     setMessages((prev) => [
//       ...prev,
//       { id: Date.now(), role: "user", type: "text", content: q },
//     ]);

//     setInput("");
//     setLoading(true);

//     try {
//       const res = await fetch(API_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ question: q }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.detail || "Query failed");

//       const hasData = data.results?.length > 0;

//       setMessages((prev) => [
//         ...prev,
//         {
//           id: Date.now() + 1,
//           role: "assistant",
//           type: hasData ? "data" : "text",
//           content: hasData
//             ? `📊 Found **${data.results.length}** record(s)`
//             : "⚠️ No records found",
//           columns: data.columns,
//           rows: data.results,
//         },
//       ]);
//     } catch (err: any) {
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: Date.now() + 1,
//           role: "assistant",
//           type: "error",
//           content: "❌ " + err.message,
//         },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderText = (text: string) =>
//     text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
//       i % 2 ? <strong key={i}>{part}</strong> : part
//     );

//   return (
//     <>
//       {/* Floating Button */}
//       <button
//             onClick={() => setOpen((v) => !v)}
//             className="group fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full
//             bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl
//             hover:shadow-indigo-500/40 hover:scale-110 active:scale-95
//             transition-all duration-300 ease-out"
//             >
//             {/* Glow Ring */}
//             <span className="absolute inset-0 rounded-full bg-indigo-500 opacity-20 blur-lg group-hover:opacity-40 transition"></span>

//             {/* Icon */}
//             <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="w-6 h-6 relative z-10"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth={2}
//             >
//                 <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 20l1.2-3.2A7.94 7.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
//                 />
//             </svg>
//       </button>

//       {/* Chat Panel */}
//       <div
//         className={`fixed z-50 flex flex-col backdrop-blur-xl bg-white/70 border border-white/30 shadow-2xl rounded-2xl transition-all duration-300
//         ${open ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}
//         ${
//           isMaximized
//             ? "bottom-10 right-10 w-[620px] h-[650px]"
//             : "bottom-20 right-6 w-[380px] h-[520px]"
//         }`}
//       >
//         {/* Header */}
//         <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-2xl">
//           <span className="font-semibold tracking-wide">
//             🤖 InternHub AI 
//           </span>

//           <div className="flex gap-3 text-lg">
//             <button onClick={setWelcome}>🔄</button>
//             <button onClick={() => setIsMaximized((v) => !v)}>
//               {isMaximized ? "🗕" : "🗖"}
//             </button>
//             <button onClick={() => setOpen(false)}>✕</button>
//           </div>
//         </div>

//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {messages.map((msg) => (
//             <div
//               key={msg.id}
//               className={`flex ${
//                 msg.role === "user" ? "justify-end" : "justify-start"
//               }`}
//             >
//               <div
//                 className={`px-4 py-2 rounded-2xl text-sm max-w-[85%] shadow-md transition
//                 ${
//                   msg.role === "user"
//                     ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
//                     : "bg-white/80 backdrop-blur border"
//                 }`}
//               >
//                 <p>{renderText(msg.content)}</p>

//                 {/* Suggestions */}
//                 {msg.id === "welcome" && showSuggestions && (
//                   <div className="flex flex-wrap gap-2 mt-3">
//                     {SUGGESTIONS.map((s) => (
//                       <button
//                         key={s}
//                         onClick={() => sendMessage(s, true)}
//                         className="text-xs px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-full hover:scale-105 hover:shadow transition"
//                       >
//                         {s}
//                       </button>
//                     ))}
//                   </div>
//                 )}

//                 {/* Data Table */}
//                 {msg.type === "data" && msg.rows?.length > 0 && (
//                   <div className="mt-3 overflow-auto max-h-60 rounded-xl border bg-white">
//                     <table className="text-xs w-full">
//                       <thead className="bg-gray-100 sticky top-0">
//                         <tr>
//                           {msg.columns.map((col: string) => (
//                             <th
//                               key={col}
//                               className="px-3 py-2 text-left font-semibold border-b"
//                             >
//                               {col}
//                             </th>
//                           ))}
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {msg.rows.slice(0, 10).map((row: any, i: number) => (
//                           <tr key={i} className="hover:bg-gray-50">
//                             {msg.columns.map((col: string) => (
//                               <td key={col} className="px-3 py-2 border-b">
//                                 {row[col] ?? "—"}
//                               </td>
//                             ))}
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}

//           {/* Typing Animation */}
//           {loading && (
//             <div className="flex gap-1 px-2">
//               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
//               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
//               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
//             </div>
//           )}

//           <div ref={endRef} />
//         </div>

//         {/* Input */}
//         <div className="p-3 flex gap-2 border-t bg-white/60 backdrop-blur">
//           <input
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
//             className="flex-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
//             placeholder="Type your question..."
//           />
//           <button
//             onClick={() => sendMessage(input)}
//             className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 rounded-lg hover:scale-105 active:scale-95 transition"
//           >
//             ➤
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }






// "use client";

// import { useEffect, useState, useRef } from "react";

// const API_URL = "http://localhost:8000/api/v0/ask";
// const SUGGESTIONS = [
//   "List all active interns",
//   "How many tasks are pending?",
//   "Show completed tasks",
//   "Interns by department",
// ];

// export function ChatWidget() {
//   const [open, setOpen] = useState(false);
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   useEffect(() => {
//     if (open) {
//       setTimeout(() => inputRef.current?.focus(), 320);
//       if (messages.length === 0) {
//         setMessages([
//           {
//             id: "welcome",
//             role: "assistant",
//             type: "text",
//             content:
//               "Hello! I'm your **InternHub** data assistant. Ask me anything about interns, tasks, departments, or mentors. I'll query the database instantly.",
//             timestamp: new Date(),
//           },
//         ]);
//       }
//     }
//   }, [open]);

//   const sendMessage = async (question: string) => {
//     const q = question.trim();
//     if (!q || loading) return;

//     setMessages((prev) => [
//       ...prev,
//       {
//         id: Date.now().toString(),
//         role: "user",
//         type: "text",
//         content: q,
//         timestamp: new Date(),
//       },
//     ]);
//     setInput("");
//     setLoading(true);

//     try {
//       const res = await fetch(API_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ question: q }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.detail || "Query failed");

//       const hasData = data.results?.length > 0;
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: (Date.now() + 1).toString(),
//           role: "assistant",
//           type: hasData ? "data" : "text",
//           content: hasData
//             ? `Found **${data.results.length}** record${data.results.length !== 1 ? "s" : ""} matching your query.`
//             : "No records found for that query.",
//           columns: data.columns,
//           rows: data.results,
//           timestamp: new Date(),
//         },
//       ]);
//     } catch (err: any) {
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: (Date.now() + 1).toString(),
//           role: "assistant",
//           type: "error",
//           content: `Something went wrong: ${err.message}`,
//           timestamp: new Date(),
//         },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderText = (text: string) =>
//     text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
//       i % 2 === 1 ? (
//         <strong key={i} className="font-bold text-gray-900">
//           {part}
//         </strong>
//       ) : (
//         part
//       )
//     );

//   return (
//     <>
//       {/* Trigger Button */}
//       <button
//         onClick={() => setOpen((v) => !v)}
//         className={`fixed bottom-8 right-8 z-50 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 ${
//           open
//             ? "bg-gray-100 border border-gray-200 text-gray-700"
//             : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl"
//         }`}
//       >
//         {open ? (
//           <svg
//             width="18"
//             height="18"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2.5"
//           >
//             <path d="M18 6L6 18M6 6l12 12" />
//           </svg>
//         ) : (
//           <>
//             <svg
//               width="18"
//               height="18"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//             >
//               <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
//             </svg>
//             <span>Ask AI</span>
//           </>
//         )}
//       </button>

//       {/* Chat Panel */}
//       <div
//         className={`fixed bottom-24 right-8 z-50 w-96 max-h-96 bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
//           open
//             ? "scale-100 opacity-100 pointer-events-auto"
//             : "scale-95 opacity-0 pointer-events-none"
//         }`}
//       >
//         {/* Header */}
//         <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
//               <svg
//                 width="16"
//                 height="16"
//                 viewBox="0 0 24 24"
//                 fill="white"
//               >
//                 <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
//               </svg>
//             </div>
//             <div>
//               <p className="font-bold text-white text-sm">Data Assistant</p>
//               <div className="flex items-center gap-1 text-xs text-white/80 mt-1">
//                 <span className="w-2 h-2 bg-green-300 rounded-full"></span>
//                 Connected
//               </div>
//             </div>
//           </div>
//           <button
//             onClick={() => {
//               setMessages([]);
//               setTimeout(
//                 () =>
//                   setMessages([
//                     {
//                       id: "r",
//                       role: "assistant",
//                       type: "text",
//                       content:
//                         "Chat cleared. What would you like to explore?",
//                       timestamp: new Date(),
//                     },
//                   ]),
//                 60
//               );
//             }}
//             className="p-1 hover:bg-white/20 rounded-lg transition text-xs text-white"
//           >
//             <svg
//               width="14"
//               height="14"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//             >
//               <polyline points="3 6 5 6 21 6" />
//               <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
//             </svg>
//           </button>
//         </div>

//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
//           {messages.map((msg) => (
//             <div
//               key={msg.id}
//               className={`flex gap-2 ${
//                 msg.role === "user" ? "flex-row-reverse" : "flex-row"
//               }`}
//             >
//               {msg.role === "assistant" && (
//                 <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
//                   <svg
//                     width="12"
//                     height="12"
//                     viewBox="0 0 24 24"
//                     fill="white"
//                   >
//                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
//                   </svg>
//                 </div>
//               )}
//               <div
//                 className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
//                   msg.role === "user"
//                     ? "bg-indigo-500 text-white rounded-tr-none"
//                     : msg.type === "error"
//                     ? "bg-red-50 text-red-600 border border-red-200 rounded-tl-none"
//                     : "bg-white border border-gray-200 text-gray-900 rounded-tl-none"
//                 }`}
//               >
//                 <p className="leading-relaxed">
//                   {msg.role === "user" || msg.type !== "text"
//                     ? msg.content
//                     : renderText(msg.content)}
//                 </p>

//                 {/* Data Table */}
//                 {msg.type === "data" && msg.rows?.length > 0 && (
//                   <div className="mt-3 -mx-3 -mb-2">
//                     <div className="overflow-x-auto max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
//                       <table className="text-xs border-collapse whitespace-nowrap">
//                         <thead className="sticky top-0">
//                           <tr>
//                             {msg.columns.map((col) => (
//                               <th
//                                 key={col}
//                                 className="px-2 py-2 bg-gray-100 border border-gray-200 text-left font-semibold text-gray-700 min-w-max"
//                               >
//                                 {col.replace(/_/g, " ")}
//                               </th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {msg.rows.slice(0, 8).map((row, i) => (
//                             <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
//                               {msg.columns.map((col) => (
//                                 <td
//                                   key={col}
//                                   className="px-2 py-1.5 border border-gray-200 text-gray-600 min-w-max max-w-xs"
//                                   title={row[col] === null ? "" : String(row[col])}
//                                 >
//                                   {row[col] === null ? "—" : String(row[col]).slice(0, 25)}
//                                 </td>
//                               ))}
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                     {msg.rows.length > 8 && (
//                       <p className="text-xs text-gray-500 mt-1">
//                         +{msg.rows.length - 8} more rows
//                       </p>
//                     )}
//                   </div>
//                 )}

//                 <span className="text-xs opacity-70 mt-1 block">
//                   {msg.timestamp.toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </span>
//               </div>
//             </div>
//           ))}

//           {/* Typing Indicator */}
//           {loading && (
//             <div className="flex gap-2">
//               <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
//                 <svg
//                   width="12"
//                   height="12"
//                   viewBox="0 0 24 24"
//                   fill="white"
//                 >
//                   <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
//                 </svg>
//               </div>
//               <div className="bg-white border border-gray-200 rounded-lg rounded-tl-none px-3 py-2 flex gap-1">
//                 <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
//                 <span
//                   className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
//                   style={{ animationDelay: "0.1s" }}
//                 ></span>
//                 <span
//                   className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
//                   style={{ animationDelay: "0.2s" }}
//                 ></span>
//               </div>
//             </div>
//           )}

//           <div ref={messagesEndRef} />
//         </div>

//         {/* Suggestions */}
//         {messages.length <= 1 && (
//           <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-2">
//             {SUGGESTIONS.map((s) => (
//               <button
//                 key={s}
//                 onClick={() => sendMessage(s)}
//                 className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-full text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition"
//               >
//                 {s}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* Input */}
//         <div className="border-t border-gray-200 p-2 flex gap-2 flex-shrink-0 bg-white">
//           <input
//             ref={inputRef}
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter" && !e.shiftKey) {
//                 e.preventDefault();
//                 sendMessage(input);
//               }
//             }}
//             placeholder="Ask about data…"
//             disabled={loading}
//             className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
//           />
//           <button
//             onClick={() => sendMessage(input)}
//             disabled={loading || !input.trim()}
//             className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition"
//           >
//             <svg
//               width="16"
//               height="16"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//             >
//               <line x1="22" y1="2" x2="11" y2="13" />
//               <polygon points="22 2 15 22 11 13 2 9 22 2" />
//             </svg>
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }