import React from "react";
import { StatCard } from "./StatCard";

interface Stat {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: "blue" | "yellow" | "red" | "green" | "purple";
}

interface StatsGridProps {
  stats: Stat[];
  loading?: boolean;
}

export function StatsGrid({ stats, loading = false }: StatsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 spacing-section-gap">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 spacing-section-gap">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
}
