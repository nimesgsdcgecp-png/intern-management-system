"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { StatsGrid } from "@/app/components/StatsGrid";
import { Card } from "@/app/components/Card";
import { CheckSquare, Clock, FileText, Target } from "lucide-react";

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  submittedReports: number;
}

interface InternProfile {
  department: string;
  collegeName: string;
  mentorName: string;
  mentorDepartment: string;
  adminName: string;
}

export default function InternDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    submittedReports: 0,
  });
  const [profile, setProfile] = useState<InternProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userId = (session?.user as any)?.id;
        const [tasksRes, reportsRes, internsRes, usersRes] = await Promise.all([
          fetch("/api/tasks"),
          fetch("/api/reports"),
          fetch("/api/interns"),
          fetch("/api/auth/users"),
        ]);

        const tasks = tasksRes.ok ? await tasksRes.json() : [];
        const reports = reportsRes.ok ? await reportsRes.json() : [];
        const interns = internsRes.ok ? await internsRes.json() : [];
        const users = usersRes.ok ? await usersRes.json() : [];

        const myTasks = tasks.filter((t: any) => {
          if (t.assignedToAll) {
            return true;
          }
          const assignedIds = Array.isArray(t.assignedInterns)
            ? t.assignedInterns
            : t.assignedIntern
            ? [t.assignedIntern]
            : [];
          return assignedIds.includes(userId);
        });
        const myReports = reports.filter((r: any) => r.internId === userId);

        setStats({
          totalTasks: myTasks.length,
          completedTasks: myTasks.filter((t: any) => t.status === "completed").length,
          pendingTasks: myTasks.filter((t: any) => t.status === "pending").length,
          submittedReports: myReports.length,
        });

        const myIntern = interns.find(
          (intern: any) => intern.id === userId || intern.email === session?.user?.email
        );
        if (myIntern) {
          const mentor = users.find((u: any) => u.id === myIntern.mentorId);
          const admin = users.find((u: any) => u.role === "admin");
          setProfile({
            department: myIntern.department || (session?.user as any)?.department || "N/A",
            collegeName: myIntern.collegeName || myIntern.university || "N/A",
            mentorName: mentor?.name || "Not assigned",
            mentorDepartment: mentor?.department || "N/A",
            adminName: admin?.name || "Not available",
          });
        }
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
      label: "Total Tasks",
      value: stats.totalTasks,
      icon: <Target className="w-6 h-6" />,
      color: "blue" as const,
    },
    {
      label: "Completed Tasks",
      value: stats.completedTasks,
      icon: <CheckSquare className="w-6 h-6" />,
      color: "green" as const,
    },
    {
      label: "Pending Tasks",
      value: stats.pendingTasks,
      icon: <Clock className="w-6 h-6" />,
      color: "red" as const,
    },
    {
      label: "Reports Submitted",
      value: stats.submittedReports,
      icon: <FileText className="w-6 h-6" />,
      color: "purple" as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Intern Dashboard</h1>

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
                  href="/dashboard/intern/tasks"
                  className="text-blue-600 hover:underline"
                >
                  → View My Tasks
                </a>
              </li>
              <li>
                <a
                  href="/dashboard/intern/submit-report"
                  className="text-blue-600 hover:underline"
                >
                  → Submit Daily Report
                </a>
              </li>
              <li>
                <a
                  href="/dashboard/intern/reports"
                  className="text-blue-600 hover:underline"
                >
                  → View My Reports & Feedback
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
                <strong>Role:</strong> Intern
              </p>
              <p>
                <strong>Department:</strong> {profile?.department || "N/A"}
              </p>
              <p>
                <strong>College:</strong> {profile?.collegeName || "N/A"}
              </p>
              <p>
                <strong>Mentor:</strong> {profile?.mentorName || "N/A"}
              </p>
              <p>
                <strong>Mentor Department:</strong> {profile?.mentorDepartment || "N/A"}
              </p>
              <p>
                <strong>Admin:</strong> {profile?.adminName || "N/A"}
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
