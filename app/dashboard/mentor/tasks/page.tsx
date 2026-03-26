"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { Select } from "@/app/components/Select";
import { TextArea } from "@/app/components/TextArea";
import { SearchHeader } from "@/app/components/SearchHeader";
import { PlusCircle, Trash2, ClipboardList, Target, Clock, AlertCircle } from "lucide-react";

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
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedIntern: "",
    deadline: "",
    priority: "medium",
    status: "pending",
  });
  const [filters, setFilters] = useState({ title: "", status: "", priority: "" });

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
          const myTasks = await tasksRes.json();

          const assignedInterns = interns.filter((i: any) => i.mentorId === mentorId);
          setMyInterns(assignedInterns);
          setTasks(myTasks);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newTask = await res.json();
        setTasks([...tasks, newTask]);
        setShowForm(false);
        setFormData({
          title: "",
          description: "",
          assignedIntern: "",
          deadline: "",
          priority: "medium",
          status: "pending",
        });
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
        if (res.ok) {
          setTasks(tasks.filter((t) => t.id !== id));
        }
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const getInternName = (internId: string) => {
    return myInterns.find((i) => i.id === internId)?.name || "Unknown";
  };

  const getAssignedToLabel = (task: Task) => {
    if (task.assignedToAll) {
      return "All my interns";
    }

    const ids =
      task.assignedInterns && task.assignedInterns.length > 0
        ? task.assignedInterns
        : task.assignedIntern
        ? [task.assignedIntern]
        : [];

    const names = ids.map(getInternName).filter((name) => name !== "Unknown");
    if (names.length === 0) {
      return "Unknown";
    }

    return names.join(", ");
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "high") return "text-red-700 bg-red-100";
    if (priority === "medium") return "text-yellow-700 bg-yellow-100";
    return "text-green-700 bg-green-100";
  };

  const getStatusColor = (status: string) => {
    if (status === "completed") return "text-green-700 bg-green-100";
    if (status === "in-progress") return "text-blue-700 bg-blue-100";
    return "text-gray-700 bg-gray-100";
  };

  const filteredTasks = tasks.filter((task) => {
    return (
      task.title.toLowerCase().includes(filters.title.toLowerCase()) &&
      (filters.status === "" || task.status === filters.status) &&
      (filters.priority === "" || task.priority === filters.priority)
    );
  });

  return (
    <DashboardLayout>
      <div className="w-full">
        <SearchHeader
          title="Manage Tasks"
          actions={
            <Button
              onClick={() => setShowForm(!showForm)}
              icon={!showForm && <PlusCircle className="w-5 h-5" />}
              className="py-2.5 px-6 shadow-xl"
            >
              {showForm ? "Cancel" : "Assign Task"}
            </Button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2 items-end">
            <Input
              label="Search Tasks"
              placeholder="Ex: API Development"
              value={filters.title}
              onChange={(e) => setFilters({ ...filters, title: e.target.value })}
              compact
            />
            <Select
                label="Task Status"
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
                label="Priority Level"
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
          <Card title="Assign New Task" className="mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />

              <TextArea
                label="Objective Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                required
                placeholder="Detail the tasks and expected outcomes..."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Assign to Intern"
                    name="assignedIntern"
                    value={formData.assignedIntern}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Intern</option>
                    {myInterns.map((intern) => (
                      <option key={intern.id} value={intern.id}>
                        {intern.name}
                      </option>
                    ))}
                  </Select>

                <Input
                  label="Deadline"
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  required
                />

                  <Select
                    label="Task Priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>

                  <Select
                    label="Initial Status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </Select>
              </div>

              <Button type="submit">Assign Task</Button>
            </form>
          </Card>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
              <div className="premium-spinner mb-6"></div>
              <p className="text-sm font-bold uppercase tracking-widest">Synchronizing Directives...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <Card className="text-center py-24 border-dashed border-2 border-gray-200 bg-gray-50/30">
              <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">Try adjusting your filters or create a new task.</p>
              <Button onClick={() => setShowForm(true)}>Create Task</Button>
            </Card>
          ) : (
            <Card className="overflow-hidden border-gray-200 shadow-xl rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Title</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Assigned To</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Deadline</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Priority</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="group hover:bg-blue-50/30 transition-all duration-200">
                        <td className="px-8 py-6 font-bold text-gray-900">{task.title}</td>
                        <td className="px-8 py-6 text-gray-600">{getAssignedToLabel(task)}</td>
                        <td className="px-8 py-6 text-gray-600">{task.deadline}</td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition-all duration-300 font-bold text-xs shadow-sm mx-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> <span>Delete</span>
                          </button>
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
