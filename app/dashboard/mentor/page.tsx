"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { StatsGrid } from "@/app/components/StatsGrid";
import { Card } from "@/app/components/Card";
import { Users, FileText, Clock, CheckSquare } from "lucide-react";

interface DashboardStats {
  myInterns: number;
  assignedTasks: number;
  pendingReports: number;
  completedTasks: number;
}

export default function MentorDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    myInterns: 0,
    assignedTasks: 0,
    pendingReports: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userId = (session?.user as any)?.id;
        const [internsRes, tasksRes, reportsRes] = await Promise.all([
          fetch("/api/interns"),
          fetch("/api/tasks"),
          fetch("/api/reports"),
        ]);

        const interns = internsRes.ok ? await internsRes.json() : [];
        const tasks = tasksRes.ok ? await tasksRes.json() : [];
        const reports = reportsRes.ok ? await reportsRes.json() : [];

        const myInterns = interns.filter((i: any) => i.mentorId === userId);
        const myInternIds = myInterns.map((i: any) => i.id);

        const assignedTasks = tasks.filter((t: any) => {
          if (t.assignedToAll) {
            return myInternIds.length > 0;
          }

          const assignedIds = Array.isArray(t.assignedInterns)
            ? t.assignedInterns
            : t.assignedIntern
            ? [t.assignedIntern]
            : [];

          return assignedIds.some((id: string) => myInternIds.includes(id));
        });

        setStats({
          myInterns: myInterns.length,
          assignedTasks: assignedTasks.length,
          pendingReports: reports.filter(
            (r: any) => !r.mentorFeedback && myInternIds.includes(r.internId)
          ).length,
          completedTasks: assignedTasks.filter((t: any) => t.status === "completed")
            .length,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [session]);

  const statsData = [
    {
      label: "My Interns",
      value: stats.myInterns,
      icon: <Users className="w-6 h-6" />,
      color: "blue" as const,
    },
    {
      label: "Assigned Tasks",
      value: stats.assignedTasks,
      icon: <FileText className="w-6 h-6" />,
      color: "yellow" as const,
    },
    {
      label: "Pending Reviews",
      value: stats.pendingReports,
      icon: <Clock className="w-6 h-6" />,
      color: "red" as const,
    },
    {
      label: "Completed Tasks",
      value: stats.completedTasks,
      icon: <CheckSquare className="w-6 h-6" />,
      color: "green" as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Mentor Dashboard</h1>

        {loading ? (
          <div className="text-center py-8">
            <div className="premium-spinner mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        ) : (
          <StatsGrid stats={statsData} loading={loading} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card title="Quick Actions">
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/dashboard/mentor/interns"
                  className="text-blue-600 hover:underline"
                >
                  → View My Interns
                </a>
              </li>
              <li>
                <a
                  href="/dashboard/mentor/tasks"
                  className="text-blue-600 hover:underline"
                >
                  → Assign Tasks
                </a>
              </li>
              <li>
                <a
                  href="/dashboard/mentor/reports"
                  className="text-blue-600 hover:underline"
                >
                  → Review Reports
                </a>
              </li>
            </ul>
          </Card>

          <Card title="System Information">
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Welcome:</strong> {session?.user?.name}
              </p>
              <p>
                <strong>Email:</strong> {session?.user?.email}
              </p>
              <p>
                <strong>Role:</strong> Mentor
              </p>
              <p className="text-xs text-gray-400 mt-4">
                Last login: {new Date().toLocaleString()}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
