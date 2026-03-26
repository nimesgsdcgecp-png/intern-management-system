"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/Card";

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
      <div className="max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">My Tasks</h1>

        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <Card>
            <p className="text-gray-600">No tasks assigned yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card
                key={task.id}
                className={`${getStatusColor(task.status)}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {task.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      <strong>Assigned by:</strong> {getAssignedByName(task.assignedBy || "")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600 mt-4">
                  <span>
                    <strong>Deadline:</strong> {task.deadline}
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-700">Update Status:</label>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      disabled={updatingTaskId === task.id}
                      className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
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
