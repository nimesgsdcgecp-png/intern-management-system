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
    gradient: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/30",
    glow: "hover:shadow-blue-500/20",
    icon: "text-blue-600",
  },
  yellow: {
    gradient: "from-yellow-500/20 to-yellow-600/10",
    border: "border-yellow-500/30",
    glow: "hover:shadow-yellow-500/20",
    icon: "text-yellow-600",
  },
  red: {
    gradient: "from-red-500/20 to-red-600/10",
    border: "border-red-500/30",
    glow: "hover:shadow-red-500/20",
    icon: "text-red-600",
  },
  green: {
    gradient: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-500/30",
    glow: "hover:shadow-emerald-500/20",
    icon: "text-emerald-600",
  },
  purple: {
    gradient: "from-purple-500/20 to-purple-600/10",
    border: "border-purple-500/30",
    glow: "hover:shadow-purple-500/20",
    icon: "text-purple-600",
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
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
        duration: 0.3,
        ease: "easeOut",
      }}
      whileHover={{
        y: -2,
        scale: 1.01,
        transition: {
          duration: 0.2,
          ease: "easeInOut",
        },
      }}
      className={`
        glass-card relative overflow-hidden
        bg-linear-to-br ${colors.gradient}
        border-l-4 ${colors.border}
        p-6 cursor-pointer
        ${colors.glow}
        hover:border-opacity-50
        transform-gpu
      `}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 transform rotate-45 translate-x-16 -translate-y-16">
          <div className={`w-full h-full bg-linear-to-br ${colors.gradient}`} />
        </div>
      </div>

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            {label}
          </h3>
          <p className="text-3xl font-bold text-gray-900 leading-none">
            {value}
          </p>
        </div>

        {icon && (
          <motion.div
            className={`
              flex items-center justify-center
              w-12 h-12 rounded-xl
              ${colors.icon} bg-white/50
              backdrop-blur-sm
              shadow-sm
            `}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.1,
              duration: 0.3,
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.15 }
            }}
          >
            {icon}
          </motion.div>
        )}
      </div>

    </motion.div>
  );
}
