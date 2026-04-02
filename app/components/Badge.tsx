"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "indigo" | "slate";
  className?: string;
}

const colorMap = {
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  green: "bg-emerald-50 text-emerald-600 border-emerald-100",
  red: "bg-rose-50 text-rose-600 border-rose-100",
  yellow: "bg-amber-50 text-amber-600 border-amber-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  slate: "bg-slate-50 text-slate-600 border-slate-100",
};

export const Badge: React.FC<BadgeProps> = ({ children, color = "slate", className = "" }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorMap[color]} ${className}`}>
      {children}
    </span>
  );
};
