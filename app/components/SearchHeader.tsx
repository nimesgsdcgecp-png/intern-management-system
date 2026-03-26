"use client";

import { motion } from "framer-motion";
import { Card } from "./Card";

interface SearchHeaderProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function SearchHeader({ title, children, actions }: SearchHeaderProps) {
  return (
    <div className="sticky top-0 z-30 mb-8 pt-4 pb-2 bg-gray-50/80 backdrop-blur-md -mx-4 px-4 sm:-mx-6 sm:px-6">
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
          {actions && <div className="flex items-center gap-3 w-full sm:w-auto">{actions}</div>}
        </div>
        
        <Card className="shadow-sm border-gray-200/60 bg-white/70 backdrop-blur-xs">
          {children}
        </Card>
      </div>
    </div>
  );
}
