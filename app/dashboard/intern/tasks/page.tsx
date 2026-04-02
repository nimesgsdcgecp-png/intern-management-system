"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { SearchHeader } from "@/app/components/features/SearchHeader";
import { KanbanBoard } from "@/app/components/features/KanbanBoard";
import { Modal } from "@/app/components/ui/Modal";
import { Card } from "@/app/components/ui/Card";
import { FileText, Target, AlertCircle, Clock, Calendar, User, Layout, Grid, List, CheckCircle2, Timer, Gauge, ShieldCheck, Sparkles, Activity, Loader2, X, ClipboardList } from "lucide-react";
import { useAppDispatch } from "@/app/lib/redux/hooks";
import { addSuccess, addError } from "@/app/lib/redux/slices/notificationSlice";
import { StatsGrid } from "@/app/components/ui/StatsGrid";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  priority: string;
  assignedBy?: string;
}

export default function MyTasksPage() {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table">("table");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  /**
   * Effect: Task Synchronization
   * Fetches assigned projects and technical tasks from the central 
   * repository to populate the intern's active workspace.
   */
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks");
        if (res.ok) {
          setTasks(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  /**
   * Logic: Status Lifecycle Management
   * Updates the progress state of a specific task.
   * Broadcasts outcome to the notification system for UI feedback.
   */
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        dispatch(addSuccess({ title: "Status Updated", message: `Task moved to ${newStatus}.` }));
      } else {
        dispatch(addError({ title: "Update Failed", message: "Failed to update task status." }));
      }
    } catch (error) {
      dispatch(addError({ title: "Network Error", message: "Check your connection." }));
    }
  };

  const handleQuickView = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) setSelectedTask(task);
  };

  const statsData = [
    {
      label: "To Do",
      value: loading ? "..." : tasks.filter(t => t.status === 'pending').length,
      icon: <Timer />,
      color: "blue" as const,
    },
    {
      label: "In Progress",
      value: loading ? "..." : tasks.filter(t => t.status === 'in-progress').length,
      icon: <Activity />,
      color: "purple" as const,
    },
    {
      label: "Completed",
      value: loading ? "..." : tasks.filter(t => t.status === 'completed').length,
      icon: <CheckCircle2 />,
      color: "green" as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              My <span className="text-indigo-600">Tasks</span>
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Track your assignments and maintain your project momentum.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black flex items-center gap-3 border border-indigo-100 uppercase tracking-widest shadow-sm">
                <Target className="w-4 h-4" />
                Intern Workspace
             </div>
          </div>
        </div>

        <StatsGrid stats={statsData} loading={loading} />

        {/* Filter Section */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-indigo-50 rounded-[1.25rem] flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Project Workflow</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Review your assigned work and tracking details</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
              <button
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-white shadow-sm text-indigo-600 border border-gray-100"
              >
                <Layout className="w-4 h-4" />
                Active View: Table
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-indigo-600">
              <div className="premium-spinner mb-6"></div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <Card className="text-center py-24 rounded-[2.5rem] border-dashed border-2 border-gray-100 bg-gray-50/20">
              <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-6 opacity-40" />
              <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">No Tasks Assigned</h3>
              <p className="text-gray-500 max-w-sm mx-auto font-medium tracking-tight">You don't have any tasks assigned to your workspace yet.</p>
            </Card>
          ) : (
            <div className="mt-8">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Task Title & Information</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Deadline</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Priority</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {tasks.map((task) => (
                        <tr key={task.id} className="group transition-all duration-300 cursor-pointer hover:bg-gray-50/30" onClick={() => handleQuickView(task.id)}>
                          <td className="px-8 py-4 min-w-[300px]">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight text-base">{task.title}</span>
                              <span className="text-xs text-gray-400 font-medium line-clamp-1">{task.description}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3 font-bold text-xs text-gray-600 tracking-tight">
                              <Clock className="w-4 h-4 text-indigo-400" /> {task.deadline}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                              task.priority === "high" ? "bg-rose-50 text-rose-600 border-rose-100" :
                              task.priority === "medium" ? "bg-amber-50 text-amber-600 border-amber-100" :
                              "bg-emerald-50 text-emerald-600 border-emerald-100"
                            }`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex items-center justify-end gap-3 font-bold text-xs text-gray-500 uppercase tracking-tight">
                              <div className={`w-2 h-2 rounded-full ${task.status === "completed" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : task.status === "in-progress" ? "bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]" : "bg-gray-300"}`} />
                              {task.status}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Task Detail Modal */}
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title="Task Details"
          size="lg"
        >
          {selectedTask && (
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="z-10 space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Priority Level</p>
                  <span className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest font-black shadow-sm flex items-center gap-2 border ${
                    selectedTask.priority === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    selectedTask.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    <Target className="w-4 h-4" />
                    {selectedTask.priority} Priority
                  </span>
                </div>
                <div className="z-10 text-left md:text-right space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Submission Deadline</p>
                  <div className="flex items-center md:justify-end gap-3 font-black text-lg text-gray-900 uppercase tracking-tight">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    {selectedTask.deadline}
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700 pointer-events-none">
                  <Target className="w-32 h-32 text-indigo-600" />
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100 group-hover:scale-110 transition-transform">
                    <ClipboardList className="w-7 h-7" />
                  </div>
                  <h4 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{selectedTask.title}</h4>
                </div>
                <div className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-150 transition-transform duration-700">
                      <FileText className="w-32 h-32 text-indigo-600" />
                   </div>
                   <p className="text-sm font-medium text-gray-700 leading-relaxed relative z-10">"{selectedTask.description}"</p>
                </div>
              </div>

              <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  Assigned By: <span className="text-gray-900 group-hover:text-indigo-600 transition-colors uppercase">{selectedTask.assignedBy || 'Lead Mentor'}</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <Activity className="w-6 h-6 text-indigo-500" />
                  Workflow Status: <span className="text-gray-900 group-hover:text-indigo-600 transition-colors uppercase">{selectedTask.status}</span>
                </div>
              </div>

              <div className="flex justify-end pt-5">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-12 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all outline-none"
                >
                  Close Details
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
      <style jsx global>{`
        .premium-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #4f46e5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </DashboardLayout>
  );
}
