"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { StatsGrid } from "@/app/components/StatsGrid";
import { Card } from "@/app/components/Card";
import { SearchHeader } from "@/app/components/SearchHeader";
import { Button } from "@/app/components/Button";
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
        <SearchHeader title="Mentor Dashboard" />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="premium-spinner mb-4"></div>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Accessing Supervision Portal...</p>
          </div>
        ) : (
          <StatsGrid stats={statsData} loading={loading} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Supervision Controls</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: "My Interns", href: "/dashboard/mentor/interns", icon: <Users className="w-5 h-5" />, color: "bg-blue-50 text-blue-600", desc: "Manage your team" },
                { label: "Assign Tasks", href: "/dashboard/mentor/tasks", icon: <FileText className="w-5 h-5" />, color: "bg-indigo-50 text-indigo-600", desc: "Delegate objectives" },
                { label: "Review Reports", href: "/dashboard/mentor/reports", icon: <CheckSquare className="w-5 h-5" />, color: "bg-emerald-50 text-emerald-600", desc: "Evaluate progress" }
              ].map((action, i) => (
                <a key={i} href={action.href} className="group p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-2xl ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <h4 className="text-sm font-black text-gray-900 mb-1">{action.label}</h4>
                  <p className="text-[11px] text-gray-500 font-medium">{action.desc}</p>
                </a>
              ))}
            </div>

            <Card className="bg-linear-to-r from-gray-900 to-slate-800 text-white overflow-hidden border-none shadow-2xl">
              <div className="p-8 relative">
                 <div className="relative z-10 max-w-sm">
                   <h3 className="text-xl font-black mb-3">Professional Mentorship</h3>
                   <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6">
                     Consistency in feedback is key to intern growth. Ensure reports are reviewed within 24 hours of submission for optimal guidance.
                   </p>
                   <Link href="/dashboard/mentor/reports">
                     <Button variant="secondary" className="bg-white/10 hover:bg-white/20 border-none text-white px-6">Supervision Guidelines</Button>
                   </Link>
                 </div>
                 <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <CheckSquare className="w-48 h-48" />
                 </div>
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Lead Identifier</h3>
            <Card className="overflow-hidden border-none shadow-2xl shadow-gray-200/50">
              <div className="p-6 bg-linear-to-br from-blue-700 to-indigo-800 text-white relative">
                 <div className="relative z-10">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Authenticated Account</p>
                   <h4 className="text-xl font-black mb-4">{session?.user?.name}</h4>
                   <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Status: active Supervisor</span>
                   </div>
                 </div>
              </div>
              <div className="p-6 space-y-6 bg-white">
                {[
                   { label: "Email Address", value: session?.user?.email },
                   { label: "Primary Role", value: "Training Mentor" },
                   { label: "Access Level", value: "Standard Supervision" },
                   { label: "Department", value: (session?.user as any)?.department || "Cross-Functional" }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                    <p className="text-xs font-bold text-gray-700">{item.value || "N/A"}</p>
                  </div>
                ))}
                <div className="pt-6 border-t border-gray-50 text-center">
                   <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                     System Security: Standard SSL Enabled
                   </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
