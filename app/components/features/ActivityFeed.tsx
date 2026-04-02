"use client";

import React, { useState, useEffect } from "react";
import { 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  FileText, 
  Target,
  ArrowRight,
  Loader2,
  Calendar
} from "lucide-react";
import { Card } from "../ui/Card";
import { motion } from "framer-motion";

const ACTION_ICONS: Record<string, any> = {
  "Bulk imported user": <UserPlus className="w-4 h-4" />,
  "Clocked In": <Clock className="w-4 h-4" />,
  "Clocked Out": <CheckCircle2 className="w-4 h-4" />,
  "Report Submitted": <FileText className="w-4 h-4" />,
  "Task Created": <PlusCircleIcon />,
  "Feedback Provided": <MessageSquare className="w-4 h-4" />,
  "default": <Target className="w-4 h-4" />
};

function PlusCircleIcon() {
    return <Target className="w-4 h-4" />;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/activity?limit=10");
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (err) {
      console.error("Failed to fetch activity:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getIcon = (action: string) => {
    for (const key in ACTION_ICONS) {
      if (action.includes(key)) return ACTION_ICONS[key];
    }
    return ACTION_ICONS.default;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin dm-text-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activities.length === 0 ? (
        <div className="py-12 text-center dm-sunken rounded-3xl border border-dashed dm-border">
          <Calendar className="w-8 h-8 dm-text-muted mx-auto mb-2 opacity-50" />
          <p className="text-xs font-bold dm-text-muted uppercase tracking-widest">No recent activity</p>
        </div>
      ) : (
        activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex gap-4 relative"
          >
            {/* Activity Line */}
            {index < activities.length - 1 && (
              <div className="absolute left-[19px] top-10 bottom-0 w-px bg-slate-200" />
            )}
            
            {/* Icon Bubble */}
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 z-10 shadow-sm ${
                activity.action.includes('Clocked In') ? 'bg-emerald-50 text-emerald-600' :
                activity.action.includes('Clocked Out') ? 'bg-indigo-50 text-indigo-600' :
                activity.action.includes('Import') ? 'bg-blue-50 text-blue-600' :
                'bg-slate-100 text-slate-500'
            }`}>
              {getIcon(activity.action)}
            </div>

            {/* Content Card */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex justify-between items-start gap-2 mb-1">
                <p className="text-sm font-black dm-text truncate leading-tight">
                  <span className="text-indigo-600">{activity.user?.profile?.name || "Someone"}</span>
                </p>
                <span className="text-[9px] font-black dm-text-muted uppercase tracking-widest shrink-0 mt-0.5">
                  {getTimeAgo(activity.created_at)}
                </span>
              </div>
              <p className="text-xs dm-text-secondary leading-relaxed line-clamp-2">
                {activity.action}
              </p>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
