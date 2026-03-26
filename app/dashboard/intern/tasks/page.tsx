"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/Card";
import { SearchHeader } from "@/app/components/SearchHeader";
import { Select } from "@/app/components/Select";
import { Button } from "@/app/components/Button";
import { Clock, CheckCircle2, AlertCircle, Target, User, Calendar, ArrowRight } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  priority: string;
  assignedBy?: string;
}

interface User {
  id: string;
  name: string;
  role: string;
}

export default function MyTasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, usersRes] = await Promise.all([
          fetch("/api/tasks"),
          fetch("/api/auth/users")
        ]);
        
        if (tasksRes.ok) {
          setTasks(await tasksRes.json());
        }
        if (usersRes.ok) {
          setUsers(await usersRes.json());
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getAssignedByName = (assignedById: string) => {
    const user = users.find(u => u.id === assignedById);
    return user ? `${user.name} (${user.role})` : "Unknown";
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setUpdatingTaskId(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updatedTask = await res.json();
        setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "high") return "text-red-700 bg-red-100";
    if (priority === "medium") return "text-yellow-700 bg-yellow-100";
    return "text-green-700 bg-green-100";
  };

  const getStatusColor = (status: string) => {
    if (status === "completed") return "text-green-700 bg-green-100 border-l-4 border-green-500";
    if (status === "in-progress") return "text-blue-700 bg-blue-100 border-l-4 border-blue-500";
    return "text-gray-700 bg-gray-100 border-l-4 border-gray-500";
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto pb-12">
        <SearchHeader title="Mission Objectives" />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="premium-spinner mb-6"></div>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-[0.2em]">Synchronizing Directives...</p>
          </div>
        ) : tasks.length === 0 ? (
          <Card className="text-center py-24 border-dashed border-2 border-gray-100 bg-gray-50/20">
            <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center mx-auto mb-6 text-gray-300">
               <Target className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Operational Calm</h3>
            <p className="text-gray-500 max-w-sm mx-auto font-medium">No tasks have been assigned to your workspace yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            {tasks.map((task) => (
              <Card
                key={task.id}
                className="group relative overflow-hidden border-none shadow-2xl shadow-gray-200/50 hover:shadow-indigo-500/10 transition-all duration-500"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
                   {task.status === "completed" ? <CheckCircle2 className="w-32 h-32" /> : <Clock className="w-32 h-32" />}
                </div>

                <div className="p-6 relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      task.priority === "high" ? "bg-red-50 text-red-600 border-red-100" :
                      task.priority === "medium" ? "bg-amber-50 text-amber-600 border-amber-100" :
                      "bg-emerald-50 text-emerald-600 border-emerald-100"
                    }`}>
                      {task.priority === "high" && <AlertCircle className="w-3 h-3 inline mr-1" />}
                      {task.priority} Priority
                    </span>
                    
                    <div className="flex items-center gap-2">
                       <Clock className="w-3.5 h-3.5 text-gray-400" />
                       <span className="text-xs font-bold text-gray-500">{task.deadline}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8 line-clamp-3">
                    {task.description}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-400" />
                       </div>
                       <div className="flex flex-col">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Assignee</p>
                          <p className="text-[11px] font-bold text-gray-700">{getAssignedByName(task.assignedBy || "")}</p>
                       </div>
                    </div>

                    <div className="w-32">
                       <Select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          disabled={updatingTaskId === task.id}
                          compact
                          className="mb-0"
                       >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                       </Select>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
