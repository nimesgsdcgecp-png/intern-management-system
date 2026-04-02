"use client";

import { motion } from "framer-motion";
import { Card } from "../ui/Card";

interface SearchHeaderProps {
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

export function SearchHeader({ title, children, actions }: SearchHeaderProps) {
  return (
    <div className="sticky top-0 z-40 mb-6 pt-1 pb-1 dm-elevated -mx-6 px-6 sm:-mx-10 sm:px-10 lg:-mx-16 lg:px-16 border-b dm-border shadow-sm">
      <div className="flex flex-col gap-1.5 max-w-[1600px] mx-auto">
        <div className="flex flex-row justify-between items-center h-10">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-indigo-600 rounded-full" />
            <h1 className="text-base font-black dm-text tracking-tight">{title}</h1>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        {children && (
          <div className="dm-sunken rounded-xl border dm-border p-1">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
