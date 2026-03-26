"use client";

import React, { useState, useId } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  compact?: boolean;
  options?: { value: string; label: string }[];
  children?: React.ReactNode;
}

export function Select({
  label,
  error,
  compact = false,
  className = "",
  options,
  children,
  value,
  disabled = false,
  ...props
}: SelectProps) {
  const [isFocused, setIsFocused] = useState(false);
  const selectId = useId();
  const hasValue = value !== undefined && value !== null && value.toString().length > 0;

  return (
    <div className={`relative ${compact ? "" : "mb-6"} ${className}`}>
      <div className="relative group">
        <label
          htmlFor={selectId}
          className={`
            absolute -top-2 left-3 text-[10px] font-bold bg-white px-1 z-10 uppercase tracking-widest transition-colors
            ${error ? "text-red-500" : isFocused ? "text-blue-600" : "text-gray-400"}
          `}
        >
          {label}
        </label>

        <div className="relative">
          <select
            id={selectId}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`
              w-full px-4 py-3 border rounded-xl text-sm transition-all outline-none appearance-none bg-white
              ${error ? "border-red-500 ring-red-500/10 focus:ring-red-500/20" : 
                isFocused ? "border-blue-500 ring-4 ring-blue-500/10" : "border-gray-200 hover:border-gray-300"}
              ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}
              text-gray-900 font-medium
            `}
            value={value}
            {...props}
          >
            {options ? options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            )) : children}
          </select>
          
          <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${isFocused ? "text-blue-600" : "text-gray-400"}`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-1 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-widest animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
