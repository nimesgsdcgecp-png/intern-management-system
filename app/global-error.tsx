"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Terminal } from "lucide-react";
import { Button } from "./components/ui/Button";

/**
 * Fallback error UI for errors that occur in the root layout.
 * This replaces the entire page structure, including html and body.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-4 bg-[#020617] font-sans text-slate-100 antialiased overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#0f172a] border border-[#1e293b] rounded-4xl p-10 text-center shadow-2xl shadow-blue-500/10 relative overflow-hidden"
        >
          {/* Decorative background glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex justify-center mb-8 relative">
            <div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20 ring-4 ring-orange-500/5">
              <AlertTriangle className="w-12 h-12 text-orange-500" />
            </div>
          </div>

          <h1 className="text-2xl font-bold font-outfit mb-4 text-white tracking-tight">System Initialization Error</h1>
          <p className="text-slate-400 mb-8 leading-relaxed text-sm">
            A critical error occurred while starting the application core.
            This usually indicates a problem with the main layout or providers.
          </p>

          <div className="space-y-6 relative">
            <Button
              onClick={() => reset()}
              variant="primary"
              className="w-full py-4 text-base shadow-lg shadow-blue-600/20"
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Recover Application
            </Button>

            <div className="mt-8 p-4 rounded-2xl bg-black/60 border border-slate-800/50 text-left font-mono text-[10px] text-slate-500 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3 text-slate-400 border-b border-white/5 pb-2">
                <Terminal className="w-3 h-3 text-blue-400" />
                <span className="uppercase tracking-widest font-bold text-[9px]">Standard Error Output</span>
              </div>
              <div className="max-h-32 overflow-auto custom-scrollbar pr-2 leading-relaxed">
                <p className="text-red-400/90 font-bold mb-1 underline decoration-red-400/20 underline-offset-2">
                  {error.name || "Error"}: {error.message || "Unknown error occurred"}
                </p>
                {error.stack && (
                  <pre className="text-[9px] opacity-40 whitespace-pre-wrap mt-2 select-all">
                    {error.stack}
                  </pre>
                )}
                {error.digest && (
                  <div className="mt-3 flex items-center gap-2 text-[8px] border-t border-white/5 pt-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Digest</span>
                    <span className="opacity-60">{error.digest}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </body>
    </html>
  );
}
