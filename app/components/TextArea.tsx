"use client";

import React, { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  compact?: boolean;
}

export function TextArea({
  label,
  error,
  compact = false,
  className = "",
  value,
  disabled = false,
  rows = 4,
  ...props
}: TextAreaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textAreaId = useId();
  const hasValue = value !== undefined && value !== null && value.toString().length > 0;

  return (
    <div className={`relative ${compact ? "" : "mb-6"} ${className}`}>
      <div className="relative group">
        <label
          htmlFor={textAreaId}
          className={`
            absolute -top-2 left-3 text-[10px] font-bold px-1 z-10 uppercase tracking-widest transition-colors
            ${error ? "text-red-500" : isFocused ? "text-blue-600" : "dm-text-muted"}
          `}
          style={{ background: 'var(--dm-input-bg)' }}
        >
          {label}
        </label>

        <textarea
          id={textAreaId}
          disabled={disabled}
          rows={rows}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-3 border rounded-xl text-sm transition-all outline-none dm-input resize-none
            ${error ? "border-red-500 ring-red-500/10 focus:ring-red-500/20" : 
              isFocused ? "border-blue-500 ring-4 ring-blue-500/10" : ""}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            font-medium leading-relaxed
          `}
          value={value}
          {...props}
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-1 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
