"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Activity, CheckSquare, Calendar, Users, ArrowRight } from "lucide-react";
import { Card } from "../ui/Card";

interface Task {
  id: string;
  title: string;
  description: string;
  assignedInterns?: string[];
  assignedToAll?: boolean;
  deadline: string;
  status: string;
  priority: string;
}

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (id: string, newStatus: string) => void;
  onQuickView: (id: string) => void;
  interns: { id: string, name: string }[];
}

const COLUMNS = [
  { id: "pending", label: "Queued", icon: <Clock className="w-4 h-4" />, color: "text-slate-400", bg: "bg-slate-100" },
  { id: "in-progress", label: "Executing", icon: <Activity className="w-4 h-4" />, color: "text-indigo-500", bg: "bg-indigo-100" },
  { id: "review", label: "Review", icon: <Users className="w-4 h-4" />, color: "text-amber-500", bg: "bg-amber-100" },
  { id: "completed", label: "Finished", icon: <CheckSquare className="w-4 h-4" />, color: "text-emerald-500", bg: "bg-emerald-50" },
];

export function KanbanBoard({ tasks, onStatusChange, onQuickView, interns }: KanbanBoardProps) {
  const getInternNames = (task: Task) => {
    if (task.assignedToAll) return "All Interns";
    const ids = task.assignedInterns || [];
    if (ids.length === 0) return "Unassigned";
    return ids.length > 2 
      ? `${ids.length} Interns` 
      : ids.map(id => interns.find(i => i.id === id)?.name).filter(Boolean).join(", ");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-rose-50 text-rose-600 border-rose-100";
      case "medium": return "bg-amber-50 text-amber-600 border-amber-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-[600px]">
      {COLUMNS.map((col) => (
        <div key={col.id} className="flex flex-col h-full dm-sunken rounded-4xl p-4 border dm-border">
          {/* Column Header */}
          <div className="flex items-center justify-between px-4 py-4 mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl ${col.bg} ${col.color} flex items-center justify-center shadow-sm`}>
                {col.icon}
              </div>
              <h3 className="text-sm font-black dm-text uppercase tracking-widest">{col.label}</h3>
            </div>
            <span className="text-[10px] font-black dm-text-muted dm-elevated px-2.5 py-1 rounded-full border dm-border shadow-xs">
              {tasks.filter(t => t.status === col.id).length}
            </span>
          </div>

          {/* Cards Area */}
          <div 
            className="flex-1 space-y-4 overflow-y-auto max-h-[800px] p-1 custom-scrollbar transition-colors rounded-3xl"
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("bg-indigo-50/50");
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove("bg-indigo-50/50");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("bg-indigo-50/50");
              const taskId = e.dataTransfer.getData("taskId");
              if (taskId) {
                onStatusChange(taskId, col.id);
              }
            }}
          >
            <AnimatePresence mode="popLayout">
              {tasks
                .filter((t) => t.status === col.id)
                .map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ y: -4 }}
                    onClick={() => onQuickView(task.id)}
                    draggable
                    onDragStart={(e) => {
                      (e as unknown as React.DragEvent).dataTransfer.setData("taskId", task.id);
                    }}
                    className="cursor-grab active:cursor-grabbing group"
                  >
                    <div className={`dm-card rounded-3xl p-5 hover:shadow-xl transition-all duration-300 relative overflow-hidden ${col.id === 'completed' ? 'border-emerald-200 bg-emerald-50/20' : 'hover:border-indigo-100'}`}>
                      {/* Priority Strip */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                      
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-start gap-3">
                          <h4 className="text-sm font-extrabold dm-text leading-tight group-hover:text-indigo-600 transition-colors">
                            {task.title}
                          </h4>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>

                        <p className="text-xs dm-text-muted line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-3 border-t dm-border">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold dm-text-muted">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold dm-text-muted">
                            <Users className="w-3 h-3" />
                            {getInternNames(task)}
                          </div>
                        </div>

                        {/* Status Advancement Button */}
                        {col.id !== "completed" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              let nextStatus = "in-progress";
                              if (col.id === "in-progress") nextStatus = "review";
                              if (col.id === "review") nextStatus = "completed";
                              onStatusChange(task.id, nextStatus);
                            }}
                            className="mt-2 w-full py-2.5 dm-sunken hover:bg-indigo-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest dm-text-muted flex items-center justify-center gap-2 transition-all active:scale-95"
                          >
                            Move to {col.id === "pending" ? "Executing" : col.id === "in-progress" ? "Review" : "Finished"}
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}
