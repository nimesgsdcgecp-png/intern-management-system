"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const variantStyles = {
  primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500/50",
  secondary: "bg-white text-gray-700 border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-300/50",
  danger: "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md hover:shadow-lg focus:ring-red-500/50",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-200/50",
  glass: "glass-surface text-gray-700 border-white/20 shadow-lg hover:bg-white/80 focus:ring-blue-500/50",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

/**
 * A premium, animated button component with support for variants, sizes, icons, and loading states.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      disabled={isDisabled}
      className={`
        relative inline-flex items-center justify-center font-medium border transition-all
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />
      )}

      {/* Left Icon */}
      {!loading && icon && iconPosition === "left" && (
        <span className="mr-2 flex items-center shrink-0 transition-transform group-hover:scale-110">
          {icon}
        </span>
      )}

      <span className="truncate">{children}</span>

      {/* Right Icon */}
      {!loading && icon && iconPosition === "right" && (
        <span className="ml-2 flex items-center shrink-0 transition-transform group-hover:scale-110">
          {icon}
        </span>
      )}

      {/* Glass/Glow Effects */}
      {variant === 'primary' && !isDisabled && (
        <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
      )}
      {variant === 'glass' && (
        <div className="absolute inset-0 rounded-xl bg-linear-to-t from-transparent via-white/5 to-white/10 pointer-events-none" />
      )}
    </motion.button>
  );
}
