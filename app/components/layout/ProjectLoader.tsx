"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

interface ProjectLoaderProps {
  fullPage?: boolean;
  text?: string;
}

/**
 * A ultra-premium loading component that can be used project-wide.
 * Supports both full-screen overlay and inline section loading.
 */
export function ProjectLoader({ fullPage = true, text = "Synchronizing System Data..." }: ProjectLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${fullPage ? 'fixed inset-0 z-9999 bg-background' : 'w-full min-h-[300px] p-12'}`}>
      <div className="relative group">
        {/* Animated Rings - Outer */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 rounded-full border-t-2 border-r-2 border-indigo-500/5 border-b-2"
        />

        {/* Animated Rings - Inner */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          className="absolute top-4 left-4 w-24 h-24 rounded-full border-t-2 border-purple-500/30 border-l-2 border-b-2"
        />

        {/* Central Branding Hub */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.9, 1, 0.9],
              boxShadow: [
                "0 0 20px rgba(79, 70, 229, 0.2)",
                "0 0 40px rgba(79, 70, 229, 0.4)",
                "0 0 20px rgba(79, 70, 229, 0.2)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-3xl bg-linear-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center relative z-10"
          >
            <GraduationCap className="w-8 h-8 text-white filter drop-shadow-md" />

            {/* Glossy Reflection */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 rounded-t-3xl pointer-events-none" />
          </motion.div>
        </div>

        {/* Orbital Particles (Simplified CSS animation for performance) */}
        <div className="absolute inset-0 animate-ping opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-500 rounded-full blur-xs" />
        </div>
      </div>

      {text && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 text-center"
        >
          <h3 className="text-xs font-black uppercase tracking-[0.4em] mb-3 text-foreground opacity-90 drop-shadow-sm">
            Intern <span className="text-indigo-500">Management</span>
          </h3>
          <div className="flex items-center justify-center gap-1">
            <p className="text-[10px] font-bold text-foreground opacity-40 uppercase tracking-widest">
              {text}
            </p>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex gap-0.5"
            >
              <span className="w-1 h-1 bg-indigo-500 rounded-full" />
              <span className="w-1 h-1 bg-indigo-500 rounded-full delay-100" />
              <span className="w-1 h-1 bg-indigo-500 rounded-full delay-200" />
            </motion.span>
          </div>
        </motion.div>
      )}

      {/* Immersive Environment Glows */}
      {fullPage && (
        <>
          <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-indigo-600/3 to-purple-600/3 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none" />
        </>
      )}
    </div>
  );
}
