"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface PremiumStatCardProps {
  label: string;
  value: string | number;
  subtext: string;
  href: string;
  icon: React.ReactNode;
  bgColor: string;
  delay?: number;
}

export function PremiumStatCard({
  label,
  value,
  subtext,
  href,
  icon,
  bgColor = "bg-indigo-600",
  delay = 0,
}: PremiumStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-[2rem] p-6 text-white shadow-xl ${bgColor} group h-full`}
    >
      {/* Glassy Background Pattern */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />
      
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium opacity-80">{label}</span>
          <span className="text-4xl lg:text-5xl font-black tracking-tighter mb-1 leading-none">{value}</span>
          <span className="text-[10px] font-bold opacity-80 tracking-wide uppercase mt-1">{subtext}</span>
          
          <Link href={href} className="mt-4 flex items-center gap-1.5 text-xs font-bold hover:gap-2 transition-all group/link">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-inner shrink-0">
             {React.isValidElement(icon) 
               ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-8 h-8 text-white opacity-90" }) 
               : icon}
        </div>
      </div>
    </motion.div>
  );
}
