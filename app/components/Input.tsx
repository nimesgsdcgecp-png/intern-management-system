"use client";

import React, { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "glass";
  showPasswordToggle?: boolean;
  labelPosition?: "float" | "top" | "hidden";
  compact?: boolean;
}

/**
 * A premium, animated input component with floating labels and validation states.
 */
export function Input({
  type = "text",
  label,
  required = false,
  className = "",
  error,
  success,
  disabled = false,
  leftIcon,
  rightIcon,
  variant = "default",
  showPasswordToggle = false,
  labelPosition = "float",
  compact = false,
  value,
  placeholder,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputId = useId();

  const isPassword = type === "password";
  const actualType = isPassword && showPassword ? "text" : type;
  const hasValue = value !== undefined && value !== null && value.toString().length > 0;

  // Determine label behavior based on placeholder presence and labelPosition prop
  const hasPlaceholder = !!placeholder;
  const shouldUseTopLabel = labelPosition === "top" || (labelPosition === "float" && hasPlaceholder);
  const shouldHideLabel = labelPosition === "hidden";
  const shouldFloat = !shouldUseTopLabel && !shouldHideLabel && (isFocused || hasValue || type === "date" || type === "datetime-local");

  const borderColor = error ? "border-red-500 ring-4 ring-red-500/10" : 
                    success ? "border-emerald-500 ring-4 ring-emerald-500/10" : 
                    isFocused ? "border-blue-500 ring-4 ring-blue-500/10" : "border-gray-200 hover:border-gray-300";

  const iconColor = error ? "text-red-500" : 
                   success ? "text-emerald-500" : 
                   isFocused ? "text-blue-500" : "text-gray-400";

  return (
    <div className={`relative ${compact ? "" : "mb-6"} ${className}`}>
      <div className="relative group">
        {/* Left Icon */}
        {leftIcon && (
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 ${iconColor}`}>
            {leftIcon}
          </div>
        )}

        {/* Input Field */}
        <input
          id={inputId}
          type={actualType}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-3 border rounded-xl text-sm transition-all outline-none bg-white font-medium
            ${borderColor}
            ${leftIcon ? "pl-10" : ""}
            ${(rightIcon || (isPassword && showPasswordToggle)) ? "pr-10" : ""}
            ${(isFocused || error || success) ? "ring-2" : ""}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
          value={value}
          {...props}
        />

        {/* Label */}
        {label && !shouldHideLabel && (
          <>
            {shouldUseTopLabel ? (
              /* Top Label (when placeholder exists) */
              <label
                htmlFor={inputId}
                className={`
                  absolute -top-2 left-3 text-[10px] font-bold bg-white px-1 z-10 uppercase tracking-widest transition-colors
                  ${leftIcon ? "left-10" : "left-3"}
                  ${error ? "text-red-500" : success ? "text-emerald-500" : isFocused ? "text-blue-600" : "text-gray-400"}
                `}
              >
                {label} {required && <span className="text-red-500">*</span>}
              </label>
            ) : (
              /* Floating Label (original behavior) */
              <motion.label
                htmlFor={inputId}
                animate={{
                  y: shouldFloat ? -24 : 0,
                  scale: shouldFloat ? 0.85 : 1,
                  color: shouldFloat ? "#3b82f6" : "#6b7280"
                }}
                className={`
                  absolute left-3 font-medium pointer-events-none z-10 origin-left transition-colors
                  ${leftIcon ? "left-10" : "left-4"}
                  ${shouldFloat ? "top-0 px-1 bg-white" : "top-1/2 -translate-y-1/2"}
                `}
              >
                {label} {required && <span className="text-red-500">*</span>}
              </motion.label>
            )}
          </>
        )}

        {/* Right Action/Icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`p-1 hover:bg-gray-100 rounded-md transition ${iconColor}`}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
          {rightIcon && <div className={iconColor}>{rightIcon}</div>}
          {error && <AlertCircle className="w-4 h-4 text-red-500" />}
          {success && !error && <CheckCircle className="w-4 h-4 text-emerald-500" />}
        </div>
      </div>

      {/* Validation Message */}
      <AnimatePresence>
        {(error || success) && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-1.5 text-xs font-medium flex items-center gap-1 ${error ? "text-red-600" : "text-emerald-600"}`}
          >
            {error ? <AlertCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
            {error || success}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
