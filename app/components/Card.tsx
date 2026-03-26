"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: "default" | "glass" | "bordered" | "floating";
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const variantStyles = {
  default: "bg-white shadow-md border border-gray-100",
  glass: "glass-card border-white/20 backdrop-blur-md",
  bordered: "bg-white border-2 border-gray-100 shadow-sm hover:border-blue-500/30",
  floating: "bg-white shadow-xl border border-gray-50 hover:-translate-y-1",
};

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

/**
 * A premium, animated card component for containing dashboard content.
 */
export function Card({
  children,
  title,
  subtitle,
  variant = "default",
  interactive = false,
  padding = "md",
  className = "",
  onClick,
  ...props
}: CardProps) {
  const isInteractive = interactive || !!onClick;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={isInteractive ? { y: -2, transition: { duration: 0.2 } } : {}}
      whileTap={isInteractive ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        relative rounded-2xl transition-all duration-300 overflow-hidden
        ${variantStyles[variant]}
        ${isInteractive ? "cursor-pointer" : ""}
        ${paddingStyles[padding]}
        ${className}
      `}
      {...props}
    >
      {/* Visual Accents for Glass variant */}
      {variant === "glass" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
        </div>
      )}

      {/* Header Section */}
      {(title || subtitle) && (
        <div className="mb-5 relative z-10">
          {title && (
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>

      {/* Interactive Overlay */}
      {isInteractive && (
        <div className="absolute inset-0 bg-black/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
      )}
    </motion.div>
  );
}
