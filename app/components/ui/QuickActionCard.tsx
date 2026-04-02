"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface QuickActionCardProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  bgColor: string;
}

export function QuickActionCard({
  icon,
  label,
  href,
  bgColor,
}: QuickActionCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${bgColor} rounded-3xl p-6 flex flex-col items-center justify-center gap-4 border dm-border transition-all hover:shadow-md cursor-pointer h-full`}
      >
        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <span className="font-bold dm-text text-sm">{label}</span>
      </motion.div>
    </Link>
  );
}
