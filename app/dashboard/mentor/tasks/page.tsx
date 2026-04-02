"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Select } from "@/app/components/ui/Select";
import { TextArea } from "@/app/components/ui/TextArea";
import { SearchHeader } from "@/app/components/features/SearchHeader";
import { PlusCircle, Trash2, ClipboardList, Target, Clock, Settings2, Layout, Table as TableIcon, Grid, Gauge, ShieldCheck, Sparkles, Activity, CheckCircle2, AlertCircle, Edit3, X, Mail, Search } from "lucide-react";
import { Modal } from "@/app/components/ui/Modal";
import { KanbanBoard } from "@/app/components/features/KanbanBoard";
import { showToast } from "@/lib/notifications";
import { StatsGrid } from "@/app/components/ui/StatsGrid";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

interface Task {
  id: string;
  title: string;
  description: string;
  assignedIntern: string;
  assignedInterns?: string[];
  assignedToAll?: boolean;
  deadline: string;
  status: string;
  priority: string;
}

interface Intern {
  id: string;
  name: string;
}

export default function MentorTasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [myInterns, setMyInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "table" | "grid">("kanban");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedIntern: "",
    deadline: "",
    priority: "medium",
    status: "pending",
    sendEmail: false,
  });

  const [filters, setFilters] = useState({ title: "", status: "", priority: "" });

  /**
   * Effect: Distributed Data Fetching
   * Synchronizes both the intern registry (filtered by mentor ownership)
   * and the global task repository to build the management interface.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const mentorId = (session?.user as any)?.id;
        const [internsRes, tasksRes] = await Promise.all([
          fetch("/api/interns"),
          fetch("/api/tasks"),
        ]);

        if (internsRes.ok && tasksRes.ok) {
          const interns = await internsRes.json();
          const allTasks = await tasksRes.json();

          const assignedInterns = interns.filter((i: any) => i.mentorId === mentorId);
          setMyInterns(assignedInterns);
          setTasks(allTasks);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        showToast("Sync failed", "error");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) fetchData();
  }, [session]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData({ ...formData, [name]: val });
  };

  /**
   * Logic: Task Orchestration
   * Handles the creation and deployment of technical tasks for interns.
   * Ensures targets are correctly assigned before synchronization with HQ.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.assignedIntern) {
      Swal.fire("Warning", "Please select an intern to assign this task.", "warning");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newTask = await res.json();
        setTasks([...tasks, newTask]);
        setIsFormOpen(false);
        setFormData({
          title: "",
          description: "",
          assignedIntern: "",
          deadline: "",
          priority: "medium",
          status: "pending",
          sendEmail: false,
        });
        Swal.fire("Task Assigned", "The task has been successfully assigned.", "success");
      } else {
        Swal.fire("Error", "Failed to assign task", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Check your internet connection", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        if (selectedTask?.id === taskId) {
          setSelectedTask({ ...selectedTask, status: newStatus });
        }
        showToast("Status updated", "success");
      }
    } catch (err) {
      showToast("Update failed", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Task?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it"
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
        if (res.ok) {
          setTasks(tasks.filter((t) => t.id !== id));
          setSelectedTask(null);
          Swal.fire("Deleted", "Task has been removed.", "success");
        } else {
          Swal.fire("Error", "Failed to delete task", "error");
        }
      } catch (error) {
        Swal.fire("Error", "Failed to delete task", "error");
      }
    }
  };

  const getInternName = (internId: string) => {
    return myInterns.find((i) => i.id === internId)?.name || "Unknown";
  };

  const getAssignedToLabel = (task: Task) => {
    if (task.assignedToAll) return "All Interns";
    const ids = task.assignedInterns && task.assignedInterns.length > 0 ? task.assignedInterns : task.assignedIntern ? [task.assignedIntern] : [];
    const names = ids.map(getInternName).filter((name) => name !== "Unknown");
    return names.length === 0 ? "Unknown" : names.join(", ");
  };

  const filteredTasks = tasks.filter((task) => {
    return (
      task.title.toLowerCase().includes(filters.title.toLowerCase()) &&
      (filters.status === "" || task.status === filters.status) &&
      (filters.priority === "" || task.priority === filters.priority)
    );
  });  const statsData = [
    {
      label: "Total Tasks",
      value: loading ? "..." : tasks.length,
      icon: <Target />,
      color: "blue" as const,
    },
    {
      label: "Needs Attention",
      value: loading ? "..." : tasks.filter(t => t.status === 'pending' || t.status === 'review').length,
      icon: <Clock />,
      color: "yellow" as const,
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Manage Tasks
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Assign tasks and monitor the progress of your interns.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsFormOpen(true)}
              icon={<PlusCircle className="w-5 h-5" />}
              className="py-3 px-8 shadow-xl shadow-indigo-200 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              Assign Task
            </Button>
          </div>
        </div>

        <StatsGrid stats={statsData} loading={loading} />

        {/* Filter Section */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Search by Title</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  placeholder="Find a task..."
                  value={filters.title}
                  onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-300 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer outline-none"
              >
                <option value="">All Statuses</option>
                <option value="pending">Queued</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Under Review</option>
                <option value="completed">Finished</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer outline-none"
              >
                <option value="">Any Priority</option>
                <option value="low">Standard</option>
                <option value="medium">Important</option>
                <option value="high">Urgent</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">View Mode</label>
              <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100 h-[46px]">
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`flex-1 flex items-center justify-center rounded-xl transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Layout className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`flex-1 flex items-center justify-center rounded-xl transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <TableIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex-1 flex items-center justify-center rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-indigo-600">
              <div className="premium-spinner mb-6"></div>
              <p className="text-sm font-black dm-text-muted uppercase tracking-widest">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <Card className="text-center py-32 rounded-[3.5rem] border-dashed border-2 dm-border bg-gray-50/20">
              <ClipboardList className="w-20 h-20 dm-text-muted mx-auto mb-8 opacity-20" />
              <h3 className="text-2xl font-black dm-text mb-2 uppercase tracking-tight">No Tasks Found</h3>
              <p className="dm-text-muted max-w-sm mx-auto font-medium tracking-tight mb-8">Start by assigning a new task to your interns.</p>
              <Button onClick={() => setIsFormOpen(true)} className="px-10">Assign First Task</Button>
            </Card>
          ) : viewMode === "kanban" ? (
            <KanbanBoard
              tasks={filteredTasks}
              onStatusChange={handleStatusChange}
              onQuickView={(id) => setSelectedTask(tasks.find(t => t.id === id) || null)}
              interns={myInterns}
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTasks.map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="bg-white rounded-[2.5rem] border border-gray-100 group hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden shadow-sm" onClick={() => setSelectedTask(task)}>
                    <div className={`h-2 transition-opacity ${task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          task.priority === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                          task.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {task.priority} Priority
                        </span>
                        <div className={`w-3 h-3 rounded-full ${task.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : task.status === 'in-progress' ? 'bg-indigo-500 shadow-[0_0_12px_rgba(79,70,229,0.4)]' : 'bg-slate-300'}`} />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors tracking-tight">{task.title}</h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Assigned to: {getAssignedToLabel(task)}</p>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-8 font-medium leading-relaxed opacity-80">{task.description}</p>
                      <div className="flex justify-between items-center pt-6 border-t border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400" /> {task.deadline}</span>
                        <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-400" /> {task.status}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Task Information</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Intern</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Deadline</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Priority</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="group transition-all duration-300 hover:bg-gray-50/30">
                        <td className="px-8 py-4 min-w-[300px]">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight text-base">{task.title}</span>
                            <span className="text-xs text-gray-400 font-medium line-clamp-1">{task.description}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">{getAssignedToLabel(task)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5 font-bold text-[11px] text-gray-500 uppercase tracking-tight">
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
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => setSelectedTask(task)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-gray-100 active:scale-95"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-gray-100 active:scale-95"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Creation Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Assign New Task"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Task Name</label>
              <input
                name="title"
                type="text"
                placeholder="What needs to be done?"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full h-16 px-6 bg-slate-50 border border-gray-100 rounded-[2rem] text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all uppercase shadow-sm"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Detailed Description</label>
              <textarea
                name="description"
                placeholder="Explain the requirements, goals, and expectations..."
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-6 bg-slate-50 border border-gray-100 rounded-[2rem] text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all resize-none shadow-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Assign to Intern</label>
                <select
                  name="assignedIntern"
                  value={formData.assignedIntern}
                  onChange={handleInputChange}
                  className="w-full h-14 px-6 bg-slate-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none cursor-pointer shadow-sm"
                  required
                >
                  <option value="">Select an intern...</option>
                  {myInterns.map(i => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Deadline Date</label>
                <input
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="w-full h-14 px-6 bg-slate-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 px-8 bg-indigo-50/20 rounded-[2.5rem] border border-indigo-100/30">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-indigo-400 uppercase tracking-widest ml-1 block">Priority Level</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full h-14 px-6 bg-white border border-indigo-100/50 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none cursor-pointer shadow-sm"
                >
                  <option value="low">Standard</option>
                  <option value="medium">Important</option>
                  <option value="high">Urgent</option>
                </select>
              </div>
              <div className="flex items-center gap-4 pt-8">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="sendEmail"
                    checked={formData.sendEmail}
                    onChange={handleInputChange}
                    className="w-6 h-6 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-gray-900 uppercase tracking-tight leading-none mb-1">Email Alert</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Notify intern via email</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-5 pt-8 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-8 py-4 text-[11px] font-black text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              Assign Task
            </button>
          </div>
        </form>
      </Modal>

      {/* Task Details / Edit Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Edit Task Details"
        size="lg"
      >
        {selectedTask && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl ${selectedTask.priority === 'high' ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-indigo-600 text-white shadow-indigo-200'}`}>
                  <ClipboardList className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">{selectedTask.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned to: {getAssignedToLabel(selectedTask)}</span>
                  </div>
                </div>
              </div>
              <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border ${selectedTask.priority === 'high' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                }`}>
                {selectedTask.priority} Priority
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-gray-100 flex items-center gap-6 group hover:bg-white hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                  <Clock className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Deadline</div>
                  <div className="text-[13px] font-black text-gray-900 tracking-tight uppercase">{selectedTask.deadline}</div>
                </div>
              </div>
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-gray-100 flex items-center gap-6 group hover:bg-white hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                  <Activity className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</div>
                  <div className="text-[13px] font-black text-gray-900 tracking-tight uppercase">{selectedTask.status}</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-150 transition-transform duration-700">
                <ClipboardList className="w-32 h-32 text-indigo-600" />
              </div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6 block">Work Description</label>
              <p className="text-[13px] font-medium text-gray-700 leading-relaxed relative z-10">
                "{selectedTask.description}"
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-gray-100">
              <button
                onClick={() => handleDelete(selectedTask.id)}
                className="flex items-center gap-3 text-rose-500 hover:text-rose-700 transition-all font-black text-[10px] uppercase tracking-[0.2em] outline-none group"
              >
                <Trash2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Delete this task
              </button>
              <div className="flex items-center gap-5 w-full md:w-auto">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="flex-1 md:flex-none px-12 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all outline-none"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

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

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
