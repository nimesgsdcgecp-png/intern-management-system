"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { StatsGrid } from "@/app/components/ui/StatsGrid";
import { QuickActionCard } from "@/app/components/ui/QuickActionCard";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { CheckSquare, Clock, FileText, Target, Users, LayoutDashboard, Rocket, Zap, Sparkles, ShieldCheck, Activity, GraduationCap, BarChart3, Calendar } from "lucide-react";
import { AttendanceCard } from "@/app/components/features/AttendanceCard";
import { ActivityFeed } from "@/app/components/features/ActivityFeed";
import Link from "next/link";
import { motion } from "framer-motion";

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

    if (session?.user) fetchStats();
  }, [session]);

  const statsData = [
    {
      label: "My Tasks",
      value: loading ? "..." : stats.totalTasks,
      icon: <Target />,
      color: "blue" as const,
    },
    {
      label: "Completed",
      value: loading ? "..." : stats.completedTasks,
      icon: <CheckSquare />,
      color: "green" as const,
    },
    {
      label: "Pending",
      value: loading ? "..." : stats.pendingTasks,
      icon: <Clock />,
      color: "yellow" as const,
    },
    {
      label: "Total Reports",
      value: loading ? "..." : stats.submittedReports,
      icon: <FileText />,
      color: "purple" as const,
    },
  ];

  const quickActions = [
    {
      label: "Daily Report",
      href: "/dashboard/intern/submit-report",
      icon: <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      bgColor: "bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400",
    },
    {
      label: "Tasks",
      href: "/dashboard/intern/tasks",
      icon: <Target className="w-6 h-6 text-violet-600 dark:text-violet-400" />,
      bgColor: "bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400",
    },
    {
      label: "My Mentor",
      href: "/dashboard/calendar",
      icon: <GraduationCap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 text-slate-900">
          <div>
            <h1 className="text-5xl font-black tracking-tight">
              Intern <span className="text-indigo-600">Workspace</span>
            </h1>
            <p className="text-gray-500 mt-2 font-medium opacity-80">Welcome back. Manage your projects and track your professional growth.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black flex items-center gap-3 border border-emerald-100 uppercase tracking-[0.2em] shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-600/5 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              <Rocket className="w-4 h-4 shadow-sm relative z-10" />
              <span className="relative z-10">Intern Access</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse relative z-10 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </div>
          </div>
        </div>

        <StatsGrid stats={statsData} loading={loading} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-10">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-6 transition-transform">
                <LayoutDashboard className="w-40 h-40 text-indigo-600" />
              </div>
              <div className="flex items-center justify-between mb-10 relative z-10">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-3">
                  <span className="w-8 h-1 bg-indigo-600 rounded-full" />
                  Overview
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative z-10">
                {quickActions.map((action) => (
                  <QuickActionCard key={action.label} {...action} />
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white shadow-xl relative overflow-hidden group border-none">
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-1000 group-hover:rotate-12">
                <Sparkles className="w-64 h-64" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <Zap className="w-6 h-6 text-amber-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400">Professional Development</span>
                  </div>
                  <h3 className="text-4xl font-black mb-6 tracking-tight uppercase underline decoration-indigo-500 decoration-4 underline-offset-8">Accelerate Growth</h3>
                  <p className="text-slate-400 font-medium leading-relaxed mb-10 max-w-lg text-lg">
                    Consistent performance and "Regular reporting" are key to unlocking full-time opportunities within the organization.
                  </p>
                  <Link href="/dashboard/intern/tasks">
                    <button className="bg-white text-slate-900 border-none px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all active:scale-95 shadow-2xl flex items-center gap-3">
                      My Roadmap
                      <Rocket className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  Attendance
                </h2>
                <AttendanceCard />
              </div>
              <div className="space-y-6">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Activity
                </h2>
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm h-full">
                  <ActivityFeed />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-6">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-3 ml-2">
                <span className="w-4 h-1 bg-gray-400 rounded-full" />
                My Profile
              </h2>
              <div className="overflow-hidden border border-gray-100 shadow-sm rounded-[2.5rem] bg-white group hover:shadow-xl transition-all duration-500">
                <div className="p-10 bg-slate-900 text-white relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-3">Active Intern</p>
                    <h4 className="text-3xl font-black tracking-tight mb-8 uppercase leading-tight">{session?.user?.name}</h4>
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl w-fit border border-white/10 backdrop-blur-md font-black shadow-inner">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none">Status: Active</span>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                    <Users className="w-32 h-32" />
                  </div>
                </div>
                <div className="p-10 space-y-8 bg-white">
                  {[
                    { label: "Email", value: session?.user?.email },
                    { label: "Department", value: profile?.department },
                    { label: "University", value: profile?.collegeName },
                    { label: "Mentor", value: profile?.mentorName }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-2 group/field">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] opacity-60 group-hover/field:text-indigo-600 transition-colors">{item.label}</p>
                      <p className="text-sm font-bold text-slate-900 tracking-tight">{item.value || "Not Set"}</p>
                    </div>
                  ))}
                  <div className="pt-10 border-t border-gray-50 text-center relative">
                    <div className="absolute -top-px left-1/2 -translate-x-1/2 w-16 h-1 bg-indigo-500 rounded-full opacity-20" />
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">
                      SYNCHRONIZED DATE <br/> {new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm group relative overflow-hidden">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/10 shadow-sm">
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Quick Tips</h3>
                  <p className="text-[9px] text-gray-300 font-black uppercase tracking-widest opacity-40">Consistency</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Submitting daily reports on time is the best way to demonstrate reliability to your mentor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
