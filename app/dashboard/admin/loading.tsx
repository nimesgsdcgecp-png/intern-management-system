import React from 'react';
import { StatCardSkeleton, ChartSkeleton } from "@/app/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div className="animate-fade-in space-y-8">
      {/* Page Header Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-10 w-64 bg-(--deep-space-indigo) rounded-xl animate-pulse" />
        <div className="h-4 w-96 bg-(--deep-space-indigo)/50 rounded-lg animate-pulse" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Lower Section Skeleton */}
      <div className="h-[300px] w-full bg-card rounded-[2.5rem] border border-glass-border animate-pulse" />
    </div>
  );
}
