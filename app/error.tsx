"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw, Home, ChevronDown, ChevronUp, Terminal } from "lucide-react";
import { Button } from "./components/ui/Button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log the error for debugging
    console.error("Application Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full glass-card p-8 text-center space-y-6"
      >
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-outfit tracking-tight text-foreground">Something went wrong</h1>
          <p className="text-foreground opacity-70 text-lg max-w-md mx-auto">
            An unexpected error occurred while processing your request. Our technical team has been notified.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button
            onClick={() => reset()}
            variant="primary"
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Try Again
          </Button>
          <Link href="/">
            <Button
              variant="glass"
              icon={<Home className="w-4 h-4" />}
            >
              Go Back Home
            </Button>
          </Link>
        </div>

        <div className="pt-6 border-t border-white/5">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 mx-auto text-sm text-foreground opacity-50 hover:opacity-100 transition-opacity"
          >
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showDetails ? "Hide technical details" : "Show more details for developers"}
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-6 p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 text-left font-mono text-xs overflow-auto max-h-80 shadow-2xl">
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Terminal className="w-4 h-4" />
                      <span className="uppercase tracking-widest font-bold text-[10px]">Developer Console</span>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-red-400 font-bold mb-1.5 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        Exception:
                      </p>
                      <p className="text-gray-100 bg-white/5 p-3 rounded-lg border border-white/5 leading-relaxed wrap-break-word">
                        {error.message || "No error message available"}
                      </p>
                    </div>

                    {error.stack && (
                      <div>
                        <p className="text-blue-400 font-bold mb-1.5">Stack Trace:</p>
                        <pre className="text-gray-400 whitespace-pre-wrap p-3 bg-white/5 rounded-lg border border-white/5 leading-relaxed text-[11px] selection:bg-blue-500/30">
                          {error.stack}
                        </pre>
                      </div>
                    )}

                    {error.digest && (
                      <div className="pt-2 flex items-center gap-2 text-[10px] text-gray-500">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Digest ID: {error.digest}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
