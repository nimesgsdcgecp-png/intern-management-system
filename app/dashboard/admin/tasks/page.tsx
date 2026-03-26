"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { PlusCircle, Trash2, AlertTriangle, Search, CheckCircle2, Clock, Activity } from "lucide-react";
import { SearchHeader } from "@/app/components/SearchHeader";
import { Select } from "@/app/components/Select";
import { TextArea } from "@/app/components/TextArea";

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

interface Intern {
  id: string;
  name: string;
  department?: string; // Added department based on the new Select component
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedInterns: [] as string[],
    assignedToAll: false,
    deadline: "",
    priority: "medium",
    status: "pending",
    internId: "", // Added internId for single assignment
  });

  const [filters, setFilters] = useState({ title: "", status: "", priority: "" });

  useEffect(() => {
    fetchTasks();
    fetchInterns();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) setTasks(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchInterns = async () => {
    try {
      const res = await fetch("/api/interns");
      if (res.ok) setInterns(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Adjusted validation for single intern assignment
    if (!formData.internId) {
      alert("Assign to an intern.");
      return;
    }
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          assignedInterns: formData.internId ? [formData.internId] : [], // Convert single internId to array
          assignedToAll: false, // Assuming single assignment means not assigned to all
        }),
      });
      if (res.ok) {
        fetchTasks();
        setShowForm(false);
        setFormData({ title: "", description: "", assignedInterns: [], assignedToAll: false, deadline: "", priority: "medium", status: "pending", internId: "" });
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) fetchTasks();
    } catch (e) { console.error(e); }
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

  return (
    <DashboardLayout>
      <div className="w-full">
        <SearchHeader
          title="Task Repository"
          actions={
            <Button 
              onClick={() => setShowForm(!showForm)}
              icon={!showForm && <PlusCircle className="w-5 h-5" />}
              className="py-2.5 px-6 shadow-xl"
            >
              {showForm ? "Cancel" : "Create New Task"}
            </Button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2 items-end">
            <Input
              label="Search Tasks"
              placeholder="Ex: Refactor API"
              value={filters.title}
              onChange={(e) => setFilters({ ...filters, title: e.target.value })}
              compact
            />
            <Select
                label="Status Filter"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                compact
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </Select>
            <Select
                label="Priority Filter"
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                compact
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
          </div>
        </SearchHeader>

        <div className="space-y-10">
          {showForm && (
            <Card title="Task Configuration" className="border-blue-200 shadow-2xl animate-in slide-in-from-top-4">
              <form onSubmit={handleSubmit} className="p-2 space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <Input label="Task Title" name="title" value={formData.title} onChange={handleInputChange} required placeholder="Ex: Database Migration" />
                    <TextArea label="Detailed Description" name="description" value={formData.description} onChange={handleInputChange} required placeholder="Provide clear instructions..." rows={5} />
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">Assignment Method</label>
                      <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-white transition-all">
                        <input
                          type="checkbox"
                          checked={formData.assignedToAll}
                          onChange={(e) => setFormData({...formData, assignedToAll: e.target.checked, assignedInterns: e.target.checked ? [] : formData.assignedInterns})}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-bold text-gray-700">Assign to all active interns</span>
                      </label>

                      {!formData.assignedToAll && (
                        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-2xl p-4 bg-gray-50/30 space-y-2">
                          {interns.map(i => (
                            <label key={i.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl transition-all cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.assignedInterns.includes(i.id)}
                                onChange={() => setFormData({...formData, assignedInterns: formData.assignedInterns.includes(i.id) ? formData.assignedInterns.filter(id => id !== i.id) : [...formData.assignedInterns, i.id]})}
                                className="w-4 h-4 rounded text-blue-600"
                              />
                              <span className="text-sm font-medium">{i.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <Input label="Submission Deadline" type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} required />
                      <Select label="Priority Level" name="priority" value={formData.priority} onChange={handleInputChange}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 border-t border-gray-100 pt-8">
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="px-8">Discard</Button>
                  <Button type="submit" className="px-10 shadow-lg shadow-blue-500/20">Publish Task</Button>
                </div>
              </form>
            </Card>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-6"></div>
              <p className="text-lg font-medium">Loading objective records...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <Card className="text-center py-24 border-dashed border-2 bg-gray-50/20">
              <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900">No tasks matched</h3>
              <p className="text-gray-500 mt-2 mb-8">Try adjusting your filters or create a new task.</p>
              <Button onClick={() => setShowForm(true)}>Add New Task</Button>
            </Card>
          ) : (
            <Card className="overflow-hidden border-gray-200 shadow-xl rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Task Definition</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Ownership</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Timeline</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Severity</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-widest sticky right-0 bg-gray-50/80 backdrop-blur-sm shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)] min-w-[200px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="group hover:bg-blue-50/30 transition-all duration-200">
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-gray-900 group-hover:text-blue-700 transition-colors">{task.title}</span>
                            <span className="text-xs text-gray-500 line-clamp-1 mt-1 max-w-xs">{task.description}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                              {getInternNames(task).charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-gray-700 truncate max-w-[150px]">{getInternNames(task)}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">{task.deadline}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            task.priority === "high" ? "bg-red-100 text-red-700 border border-red-200" : 
                            task.priority === "medium" ? "bg-amber-100 text-amber-700 border border-amber-200" : 
                            "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                             <Activity className={`w-4 h-4 ${task.status === "completed" ? "text-emerald-500" : task.status === "in-progress" ? "text-blue-500" : "text-gray-400"}`} />
                             <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{task.status}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6 sticky right-0 bg-white/60 group-hover:bg-blue-50/60 backdrop-blur-md shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)] transition-all">
                          <div className="flex justify-center">
                            <button onClick={() => handleDelete(task.id)} className="group/btn flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition-all duration-300 font-bold text-xs shadow-sm">
                              <Trash2 className="w-4 h-4" /> <span>Remove</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
