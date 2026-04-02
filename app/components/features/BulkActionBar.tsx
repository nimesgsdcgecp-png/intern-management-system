"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, Download, UserPlus, CheckCircle } from "lucide-react";
import { Button } from "../ui/Button";

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  onExport?: () => void;
  actions?: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: "primary" | "secondary" | "danger" | "ghost";
  }[];
}

export function BulkActionBar({ 
  selectedCount, 
  onClear, 
  onDelete, 
  onExport,
  actions = []
}: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: 100, opacity: 0, x: "-50%" }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl"
        >
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-4 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 pl-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                <span className="text-sm font-black tracking-tighter">{selectedCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white text-xs font-black uppercase tracking-widest leading-none">Items Selected</span>
                <button 
                  onClick={onClear}
                  className="text-slate-400 hover:text-white text-[10px] font-bold flex items-center gap-1 mt-1 transition-colors group"
                >
                  <X className="w-3 h-3 group-hover:rotate-90 transition-transform" /> Clear Selection
                </button>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-700/50 hidden sm:block" />

            <div className="flex items-center gap-2 pr-2">
              {actions.map((action, i) => (
                <Button
                  key={i}
                  variant={action.variant || "secondary"}
                  size="sm"
                  onClick={action.onClick}
                  className="rounded-xl flex items-center gap-2 h-11 px-5"
                >
                  {action.icon}
                  <span className="hidden md:inline">{action.label}</span>
                </Button>
              ))}

              {onExport && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onExport}
                  className="rounded-xl bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 h-11 px-5 flex items-center gap-2 group"
                >
                  <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> 
                  <span className="hidden md:inline">Export CSV</span>
                </Button>
              )}

              <Button
                variant="danger"
                size="sm"
                onClick={onDelete}
                className="rounded-xl bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white h-11 px-5 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> 
                <span>Delete Selected</span>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
