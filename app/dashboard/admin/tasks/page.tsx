"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { PlusCircle, Trash2, CheckCircle2, Clock, Activity, CheckSquare, LayoutGrid, List, Search, Users } from "lucide-react";
import { KanbanBoard } from "@/app/components/features/KanbanBoard";
import { SearchHeader } from "@/app/components/features/SearchHeader";
import { Select } from "@/app/components/ui/Select";
import { TextArea } from "@/app/components/ui/TextArea";
import { Modal } from "@/app/components/ui/Modal";
import { QuickViewModal } from "@/app/components/features/QuickViewModal";
import { BulkActionBar } from "@/app/components/features/BulkActionBar";
import { showToast } from "@/lib/notifications";
import { downloadCSV } from "@/lib/utils/csv-utils";
import Swal from "sweetalert2";

interface Task {
  id: string;
  title: string;
  description: string;
  assignedInterns?: string[];
  assignedToAll?: boolean;
  deadline: string;
  status: string;
  priority: string;
  type?: string;
  stream?: string;
}

interface Intern {
  id: string;
  name: string;
  department?: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [quickViewEntity, setQuickViewEntity] = useState<{ id: string, type: 'intern' | 'mentor' | 'task' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'grid'>('table');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedInterns: [] as string[],
    assignedToAll: false,
    deadline: "",
    priority: "medium",
    status: "pending",
    sendEmail: false,
  });

  const [filters, setFilters] = useState({ title: "", status: "", priority: "" });

  useEffect(() => {
    fetchTasks();
    fetchInterns();
    const savedView = localStorage.getItem('taskViewMode');
    if (savedView === 'kanban' || savedView === 'table') setViewMode(savedView);
  }, []);

  const handleToggleView = (mode: 'table' | 'kanban' | 'grid') => {
    setViewMode(mode);
    localStorage.setItem('taskViewMode', mode);
  };

  /**
   * Logic: Tactical State Transition
   * Updates the lifecycle status of a specific technical directive.
   * Facilitates the movement of tasks through the Kanban execution pipeline.
   */
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Directive advanced to ${newStatus === 'in-progress' ? 'Executing' : 'Finished'} stage`, "success");
        fetchTasks();
      }
    } catch (e) { showToast("Failed to transform status", "error"); }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) setTasks(await res.json());
    } catch (e) {
      console.error(e);
      showToast("Failed to retrieve master task list", "error");
    }
    finally { setLoading(false); }
  };

  const fetchInterns = async () => {
    try {
      const res = await fetch("/api/interns");
      if (res.ok) setInterns(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    else if (formData.title.length < 5) errors.title = "Title must be at least 5 characters";

    if (!formData.description.trim()) errors.description = "Technical specifications are required";
    if (!formData.deadline) errors.deadline = "Deadline is required";

    if (!formData.assignedToAll && formData.assignedInterns.length === 0) {
      errors.assignments = "Select at least one intern or broadcast to all";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Logic: Directive Publication
   * Handles the creation and distribution of new technical tasks.
   * Supports broadcast assignments and targeted deployments with email notifications.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast("Directive published successfully", "success");
        fetchTasks();
        setIsFormOpen(false);
        setFormData({ title: "", description: "", assignedInterns: [], assignedToAll: false, deadline: "", priority: "medium", status: "pending", sendEmail: false });
        setFormErrors({});
      } else {
        const error = await res.json();
        showToast(error.message || "Failed to publish task", "error");
      }
    } catch (e) {
      showToast("Network failure: Could not reach HQ", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Archive Task?",
      text: "This will remove the task from all active boards.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Archive Now",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== id));
        if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(i => i !== id));
        Swal.fire("Archived", "Task has been moved to repository archives.", "success");
      } else {
        Swal.fire("Access Denied", "System protected task cannot be deleted.", "error");
      }
    } catch (e) {
      Swal.fire("Network Error", "Unable to synchronize with server.", "error");
    }
  };

  const handleBulkDelete = async () => {
    const result = await Swal.fire({
      title: "Bulk Archival",
      text: `Prepare to archive ${selectedIds.length} tasks.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Execute All",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await Promise.all(selectedIds.map(id => fetch(`/api/tasks/${id}`, { method: "DELETE" })));
      setTasks(tasks.filter(t => !selectedIds.includes(t.id)));
      setSelectedIds([]);
      Swal.fire("System Status", "Bulk archival operation successful.", "success");
    } catch (e) {
      Swal.fire("Incident Report", "Partial success: Some tasks resistant to archival.", "error");
    } finally {
      setLoading(false);
    }
  };


  const getInternNames = (task: Task) => {
    if (task.assignedToAll) return "All Interns";
    const ids = task.assignedInterns || [];
    if (ids.length === 0) return "Unassigned";
    return ids.map(id => interns.find(i => i.id === id)?.name).filter(Boolean).join(", ") || "Unknown";
  };

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(filters.title.toLowerCase()) &&
    (filters.status === "" || t.status === filters.status) &&
    (filters.priority === "" || t.priority === filters.priority)
  );

  const handleExport = () => {
    const selectedTasks = tasks.filter(t => selectedIds.includes(t.id));
    const exportData = selectedTasks.map(t => ({
      Title: t.title,
      Status: t.status,
      Priority: t.priority,
      Deadline: t.deadline ? new Date(t.deadline).toLocaleDateString() : 'No deadline'
    }));
    downloadCSV(exportData, `tasks-export-${new Date().toISOString().split('T')[0]}`);
    Swal.fire("Data Stream", "CSV export synthesized successfully.", "success");
  };


  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTasks.length && filteredTasks.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTasks.map(t => t.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <DashboardLayout>
      <div className="w-full">
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title="Configure Technical Directive"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <Input label="Directive Title" name="title" value={formData.title} onChange={handleInputChange} required placeholder="Ex: Database Migration" error={formErrors.title} />
                <TextArea label="Technical Specifications" name="description" value={formData.description} onChange={handleInputChange} required placeholder="Outline the requirements..." rows={6} error={formErrors.description} />
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Target Segment</label>
                    {formErrors.assignments && <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{formErrors.assignments}</span>}
                  </div>
                  <label className={`flex items-center gap-4 p-5 dm-sunken rounded-2xl border cursor-pointer dm-dropdown-item transition-all group active:scale-[0.98] shadow-sm ${formErrors.assignments ? 'border-red-500 ring-2 ring-red-500/10' : 'dm-border'}`}>
                    <input
                      type="checkbox"
                      checked={formData.assignedToAll}
                      onChange={(e) => {
                        setFormData({ ...formData, assignedToAll: e.target.checked, assignedInterns: e.target.checked ? [] : formData.assignedInterns });
                        if (formErrors.assignments) setFormErrors(prev => {
                          const next = { ...prev };
                          delete next.assignments;
                          return next;
                        });
                      }}
                      className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all"
                    />
                    <span className="font-extrabold text-slate-700 tracking-tight">Broadcast to all active interns</span>
                  </label>

                  {!formData.assignedToAll && (
                    <div className={`max-h-56 overflow-y-auto border rounded-3xl p-5 bg-slate-50/50 space-y-3 custom-scrollbar ${formErrors.assignments ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-100'}`}>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Select Individual Targets</p>
                      {interns.map(i => (
                        <label key={i.id} className="flex items-center gap-4 p-3 dm-dropdown-item rounded-xl transition-all cursor-pointer border border-transparent">
                          <input
                            type="checkbox"
                            checked={formData.assignedInterns.includes(i.id)}
                            onChange={() => {
                              const nextInterns = formData.assignedInterns.includes(i.id) ? formData.assignedInterns.filter(id => id !== i.id) : [...formData.assignedInterns, i.id];
                              setFormData({ ...formData, assignedInterns: nextInterns });
                              if (formErrors.assignments && nextInterns.length > 0) {
                                setFormErrors(prev => {
                                  const next = { ...prev };
                                  delete next.assignments;
                                  return next;
                                });
                              }
                            }}
                            className="w-4 h-4 rounded-md text-indigo-600 border-slate-300"
                          />
                          <span className="text-sm font-bold text-slate-600">{i.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <Input label="Target Deadline" type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} required error={formErrors.deadline} />
                  <Select label="Priority Rating" name="priority" value={formData.priority} onChange={handleInputChange}>
                    <option value="low">Standard</option>
                    <option value="medium">Important</option>
                    <option value="high">Critical</option>
                  </Select>
                </div>

                <div className="pt-4 border-t border-slate-100/50">
                  <label className="flex items-center gap-4 p-4 dm-sunken rounded-2xl border cursor-pointer hover:bg-slate-50 transition-all border-dashed border-indigo-200">
                    <input
                      type="checkbox"
                      name="sendEmail"
                      checked={formData.sendEmail}
                      onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                      className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all"
                    />
                    <div className="flex flex-col">
                      <span className="font-extrabold text-indigo-900 tracking-tight text-sm">Email Notification</span>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Send technical directive via internal mail</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)} className="px-8">Discard</Button>
              <Button type="submit" className="px-12 shadow-xl shadow-indigo-100 bg-indigo-600">Publish Directive</Button>
            </div>
          </form>
        </Modal>

        {/* Page Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Project Tasks
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Assign, monitor, and manage technical directives across your team.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => handleToggleView('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleToggleView('kanban')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Activity className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleToggleView('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            <Button
              onClick={() => { setIsFormOpen(true); }}
              icon={<PlusCircle className="w-5 h-5" />}
              className="py-3 px-8 shadow-xl shadow-indigo-200 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              Create Task
            </Button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Search Directives</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Ex: Database Migration"
                  value={filters.title}
                  onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-300 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Lifecycle Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer outline-none"
              >
                <option value="">Full Lifecycle</option>
                <option value="pending">Queued</option>
                <option value="in-progress">Executing</option>
                <option value="completed">Finished</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Severity Tier</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer outline-none"
              >
                <option value="">All Tiers</option>
                <option value="low">Standard</option>
                <option value="medium">Important</option>
                <option value="high">Critical</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-6 font-bold"></div>
              <p className="text-lg font-bold tracking-tight">Accessing encrypted archives...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <Card className="text-center py-24 border-dashed border-2 bg-slate-50/20 rounded-[2.5rem]">
              <CheckCircle2 className="w-16 h-16 text-slate-300 mx-auto mb-6" />
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">No data detected</h3>
              <p className="text-slate-500 mt-2 mb-8 font-medium">Update your parameters or initialize a new directive.</p>
              <Button onClick={() => setIsFormOpen(true)}>Initialize Task</Button>
            </Card>
          ) : viewMode === 'kanban' ? (
            <KanbanBoard
              tasks={filteredTasks}
              onStatusChange={handleStatusChange}
              onQuickView={(id) => setQuickViewEntity({ id, type: 'task' })}
              interns={interns}
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTasks.map(task => (
                <div key={task.id} className={`p-8 bg-white rounded-[2.5rem] border border-gray-100 transition-all cursor-pointer group hover:shadow-2xl relative shadow-sm hover:-translate-y-1 ${selectedIds.includes(task.id) ? 'bg-indigo-50/30' : ''}`} onClick={() => setQuickViewEntity({ id: task.id, type: 'task' })}>
                  <div className="absolute top-6 right-6 z-10" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer transition-all"
                      checked={selectedIds.includes(task.id)}
                      onChange={() => toggleSelectRow(task.id)}
                    />
                  </div>
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        task.priority === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                        task.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                      {task.priority} Priority
                    </span>
                    <div className={`w-3 h-3 rounded-full mr-12 ${task.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : task.status === 'in-progress' ? 'bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]' : 'bg-gray-300'}`} />
                  </div>
                  <h4 className="text-lg font-black text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{task.title}</h4>
                  <div className="flex items-center gap-2 mb-4">
                     <Users className="w-3.5 h-3.5 text-gray-400" />
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Ownership: {getInternNames(task)}</p>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-8 font-medium leading-relaxed">"{task.description}"</p>
                  <div className="flex justify-between items-center pt-5 border-t border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-400" /> {task.deadline}</span>
                    <span className="flex items-center gap-1.5"><Activity className={`w-4 h-4 ${task.status === 'completed' ? 'text-emerald-500' : 'text-indigo-500'}`} /> {task.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 uppercase">
                      <th className="px-8 py-5 w-20">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer transition-all"
                            checked={filteredTasks.length > 0 && selectedIds.length === filteredTasks.length}
                            onChange={toggleSelectAll}
                          />
                        </div>
                      </th>
                      <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Technical Objective</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Operational Ownership</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Execution Activity</th>
                      <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Lifecycle State</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className={`group transition-all duration-300 hover:bg-gray-50/30 ${selectedIds.includes(task.id) ? 'bg-indigo-50/30' : ''}`}>
                        <td className="px-8 py-4">
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer transition-all"
                              checked={selectedIds.includes(task.id)}
                              onChange={() => toggleSelectRow(task.id)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 min-w-[300px]">
                          <button
                            onClick={() => setQuickViewEntity({ id: task.id, type: 'task' })}
                            className="flex items-center gap-5 text-left group/btn"
                          >
                            <div className="w-12 h-12 rounded-xl bg-slate-900 border-4 border-white flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover/btn:rotate-6 transition-all duration-300">
                              <CheckSquare className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight text-base">{task.title}</span>
                              <span className={`text-[10px] font-black uppercase tracking-[0.15em] mt-0.5 ${
                                  task.priority === 'high' ? 'text-rose-500' : 
                                  task.priority === 'medium' ? 'text-amber-500' : 
                                  'text-emerald-500'
                                }`}>
                                {task.priority} Severity
                              </span>
                            </div>
                          </button>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600 border border-indigo-100 shadow-sm">
                              {getInternNames(task).charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-gray-700 tracking-tight truncate max-w-[150px]">{getInternNames(task)}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Due Date</span>
                            <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                               <Clock className="w-3.5 h-3.5 text-indigo-400" />
                               {task.deadline}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center">
                            <span className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                task.status === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                task.status === "in-progress" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                "bg-gray-50 text-gray-400 border-gray-100"
                              }`}>
                              {task.status === "completed" ? "Finished" : task.status === "in-progress" ? "Executing" : "Queued"}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-gray-100 shadow-sm active:scale-95"
                              title="Archive Directive"
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

      <QuickViewModal
        isOpen={!!quickViewEntity}
        onClose={() => setQuickViewEntity(null)}
        entityId={quickViewEntity?.id || null}
        entityType={quickViewEntity?.type || null}
      />

      <BulkActionBar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onDelete={handleBulkDelete}
        onExport={handleExport}
      />
    </DashboardLayout>
  );
}
