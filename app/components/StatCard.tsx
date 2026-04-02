"use client";

import React from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: "blue" | "yellow" | "red" | "green" | "purple";
  delay?: number;
}

const colorStyles = {
  blue: {
    gradient: "from-blue-500/10 to-blue-600/5",
    border: "border-blue-500/20",
    glow: "hover:shadow-blue-500/10",
    icon: "text-blue-600",
  },
  yellow: {
    gradient: "from-yellow-500/10 to-yellow-600/5",
    border: "border-yellow-500/20",
    glow: "hover:shadow-yellow-500/10",
    icon: "text-yellow-600",
  },
  red: {
    gradient: "from-red-500/10 to-red-600/5",
    border: "border-red-500/20",
    glow: "hover:shadow-red-500/10",
    icon: "text-red-600",
  },
  green: {
    gradient: "from-emerald-500/10 to-emerald-600/5",
    border: "border-emerald-500/20",
    glow: "hover:shadow-emerald-500/10",
    icon: "text-emerald-600",
  },
  purple: {
    gradient: "from-purple-500/10 to-purple-600/5",
    border: "border-purple-500/20",
    glow: "hover:shadow-purple-500/10",
    icon: "text-purple-600",
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export function StatCard({
  label,
  value,
  icon,
  color = "blue",
  delay = 0
}: StatCardProps) {
  const colors = colorStyles[color];

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{
        duration: 0.4,
        delay: delay * 0.1,
        ease: "easeOut",
      }}
      whileHover={{ y: -2, scale: 1.01, transition: { duration: 0.2 } }}
      className={`
        glass-card relative overflow-hidden group
        bg-linear-to-br ${colors.gradient}
        border-l-4 ${colors.border}
        p-7 cursor-pointer
        ${colors.glow}
        hover:border-opacity-100
        transition-all duration-300
        shadow-sm hover:shadow-lg
      `}
    >
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-[10px] font-black dm-text-muted uppercase tracking-[0.2em] mb-2 transition-colors">
            {label}
          </h3>
          <p className="text-3xl font-black dm-text tracking-tighter leading-none">
            {value}
          </p>
        </div>

        {icon && (
          <div className={`
            flex items-center justify-center
            w-11 h-11 rounded-xl
            ${colors.icon} backdrop-blur-sm
            shadow-sm border dm-border
            transition-transform duration-500
            group-hover:scale-110
          `}>
             {React.isValidElement(icon) 
              ? React.cloneElement(icon as React.ReactElement<any>, { size: 20, strokeWidth: 2.5 }) 
              : icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
