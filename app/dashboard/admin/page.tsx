"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { StatsGrid } from "@/app/components/StatsGrid";
import { QuickLinksSection } from "@/app/components/QuickLinksSection";
import { Card } from "@/app/components/Card";
import { Users, Clock, CheckSquare } from "lucide-react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalInterns: 0,
    totalMentors: 0,
    tasksAssigned: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [internRes, taskRes, userRes] = await Promise.all([
          fetch("/api/interns"),
          fetch("/api/tasks"),
          fetch("/api/auth/users")
        ]);
        
        const interns = internRes.ok ? await internRes.json() : [];
        const tasks = taskRes.ok ? await taskRes.json() : [];
        const users = userRes.ok ? await userRes.json() : [];
        const mentors = users.filter((u: any) => u.role === 'mentor');
        
        setStats({
          totalInterns: interns.length,
          totalMentors: mentors.length,
          tasksAssigned: tasks.length,
          completedTasks: tasks.filter((t: any) => t.status === 'completed').length
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    {
      label: "Total Interns",
      value: stats.totalInterns,
      icon: <Users className="w-6 h-6" />,
      color: "blue" as const,
    },
    {
      label: "Total Mentors",
      value: stats.totalMentors,
      icon: <Users className="w-6 h-6 text-indigo-500" />,
      color: "purple" as const,
    },
    {
      label: "Tasks Assigned",
      value: stats.tasksAssigned,
      icon: <Clock className="w-6 h-6" />,
      color: "yellow" as const,
    },
    {
      label: "Completed",
      value: stats.completedTasks,
      icon: <CheckSquare className="w-6 h-6" />,
      color: "green" as const,
    },
  ];

  const quickLinks = [
    {
      label: "Manage Interns",
      href: "/dashboard/admin/interns",
      description: "View & edit intern records",
      icon: "👥",
    },
    {
      label: "Create New Task",
      href: "/dashboard/admin/tasks",
      description: "Assign tasks to interns",
      icon: "✓",
    },
    {
      label: "Manage Mentors",
      href: "/dashboard/admin/mentors",
      description: "Mentor assignments & info",
      icon: "🎓",
    },
    {
      label: "View Reports",
      href: "/dashboard/admin/reports",
      description: "Analytics & exports",
      icon: "📊",
    },
  ];

  return (
    <DashboardLayout>
      <div className="w-full">
        <h1 className="text-4xl font-extrabold mb-10 text-gray-900 tracking-tight">
          Admin Dashboard
        </h1>

        {/* Stats Grid */}
        <StatsGrid stats={statsData} loading={loading} />

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <QuickLinksSection links={quickLinks} />

          <Card title="System Information">
            <div className="space-y-6 pt-2">
              <div className="flex justify-between pb-4 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Administrator</span>
                <span className="text-sm font-bold text-gray-900">
                  {session?.user?.name ?? "—"}
                </span>
              </div>
              <div className="flex justify-between pb-4 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Email Address</span>
                <span className="text-sm font-bold text-gray-900">
                  {session?.user?.email ?? "—"}
                </span>
              </div>
              <div className="flex justify-between pb-4 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Access Level</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  FULL ACCESS
                </span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2">
                <span className="font-medium text-gray-500">System Status</span>
                <span className="inline-flex items-center gap-2 text-emerald-600 font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Online & Secured
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
