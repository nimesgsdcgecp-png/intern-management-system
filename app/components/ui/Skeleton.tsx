"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "pulse" | "shimmer";
}

export function Skeleton({ className = "", variant = "pulse" }: SkeletonProps) {
  return (
    <div
      className={`
        dm-skeleton rounded-lg
        ${variant === "pulse" ? "animate-pulse" : "animate-shimmer"}
        ${className}
      `}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="dm-card p-6 rounded-3xl">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-16 h-8" />
        </div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="dm-card p-6 rounded-4xl h-[400px] flex flex-col">
      <div className="flex justify-between mb-8">
        <Skeleton className="w-40 h-6" />
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
      <div className="flex-1 flex flex-col gap-4">
        <Skeleton className="w-full flex-1" />
        <div className="flex justify-between gap-4">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-4">
        <Skeleton className="w-48 h-6" />
        <Skeleton className="w-24 h-8" />
      </div>
      <div className="dm-card rounded-4xl overflow-hidden">
        <div className="p-4 border-b dm-border flex gap-4">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
        </div>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="p-4 flex gap-4 border-b dm-border">
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
