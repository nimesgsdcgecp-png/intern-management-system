"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { StatsGrid } from "@/app/components/StatsGrid";
import { QuickActionCard } from "@/app/components/QuickActionCard";
import { Users, FileText, Clock, CheckSquare, Target, Activity, LayoutDashboard, UserCheck, ShieldCheck, Sparkles, GraduationCap, BarChart3 } from "lucide-react";
import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { ActivityFeed } from "@/app/components/ActivityFeed";
import { motion } from "framer-motion";

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

    if (session?.user) fetchStats();
  }, [session]);

  const statsData = [
    {
      label: "My Interns",
      value: loading ? "..." : stats.myInterns,
      icon: <Users />,
      color: "blue" as const,
    },
    {
      label: "Total Tasks",
      value: loading ? "..." : stats.assignedTasks,
      icon: <FileText />,
      color: "purple" as const,
    },
    {
      label: "Reviews Needed",
      value: loading ? "..." : stats.pendingReports,
      icon: <Clock />,
      color: "yellow" as const,
    },
    {
      label: "Finished Tasks",
      value: loading ? "..." : stats.completedTasks,
      icon: <CheckSquare />,
      color: "green" as const,
    },
  ];

  const quickActions = [
    {
      label: "Interns",
      href: "/dashboard/mentor/interns",
      icon: <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      bgColor: "bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400",
    },
    {
      label: "Tasks",
      href: "/dashboard/mentor/tasks",
      icon: <FileText className="w-6 h-6 text-violet-600 dark:text-violet-400" />,
      bgColor: "bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400",
    },
    {
      label: "Reports",
      href: "/dashboard/mentor/reports",
      icon: <CheckSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 text-slate-900">
          <div>
            <h1 className="text-5xl font-black tracking-tight italic">
              Mentor <span className="text-indigo-600">Workspace</span>
            </h1>
            <p className="text-gray-500 mt-1 font-medium italic opacity-80">Welcome back. Oversee your assigned interns and evaluate their performance.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-6 py-3 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black flex items-center gap-3 border border-indigo-100 uppercase tracking-[0.2em] italic shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-indigo-600/5 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <ShieldCheck className="w-4 h-4 shadow-sm relative z-10" />
                <span className="relative z-10">Mentorship Verified</span>
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse relative z-10 shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
             </div>
          </div>
        </div>

        <StatsGrid stats={statsData} loading={loading} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-10">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative group font-black">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-6 transition-transform">
                <Target className="w-40 h-40 text-indigo-600" />
              </div>
              <div className="flex items-center justify-between mb-10 relative z-10">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-3 italic">
                  <span className="w-8 h-1 bg-indigo-600 rounded-full" />
                  Mentorship Hub
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
                   <GraduationCap className="w-64 h-64" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="flex-1">
                     <h3 className="text-4xl font-black mb-6 tracking-tight uppercase italic underline decoration-indigo-500 decoration-4 underline-offset-8">Mentorship Guidelines</h3>
                     <p className="text-slate-400 font-medium leading-relaxed mb-10 max-w-lg italic text-lg">
                        Guidance is key to intern growth. Execute human audit and provide "Technical Narrative" feedback within 24 hours of submission.
                     </p>
                     <Link href="/dashboard/mentor/reports">
                        <button className="bg-white text-slate-900 border-none px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all active:scale-95 shadow-2xl flex items-center gap-3 italic">
                          Review Deliverables
                          <FileText className="w-4 h-4" />
                        </button>
                     </Link>
                  </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm overflow-hidden relative group hover:shadow-xl transition-all duration-500">
                <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                   <Sparkles className="w-48 h-48 text-indigo-600" />
                </div>
                <div className="flex items-center justify-between mb-10 relative z-10">
                   <h3 className="font-black text-gray-400 uppercase tracking-[0.4em] text-[10px] italic flex items-center gap-3">
                       <span className="w-8 h-1 bg-indigo-500 rounded-full" />
                       Squad Statistics
                   </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                  <div className="rounded-[2.5rem] p-10 border border-gray-50 bg-gray-50/50 shadow-sm group/card hover:bg-white transition-all duration-300">
                    <div className="text-5xl font-black text-slate-900 tracking-tighter italic group-hover/card:text-indigo-600 transition-colors uppercase">{loading ? "..." : stats.myInterns} <span className="text-xs opacity-40 not-italic">Units</span></div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3 opacity-60">Assigned Resources</div>
                  </div>
                  <div className="rounded-[2.5rem] p-10 border border-gray-50 bg-gray-50/50 shadow-sm group/card hover:bg-white transition-all duration-300">
                    <div className="text-5xl font-black text-amber-500 tracking-tighter italic group-hover/card:text-amber-600 transition-colors uppercase">{loading ? "..." : stats.pendingReports} <span className="text-xs opacity-40 not-italic">Logs</span></div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3 opacity-60">Pending Human Evaluation</div>
                  </div>
                </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-6">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic flex items-center gap-3 ml-2">
                <span className="w-4 h-1 bg-gray-400 rounded-full" />
                Operational History
              </h2>
              <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm h-fit hover:shadow-xl transition-all duration-500">
                  <ActivityFeed />
              </div>
            </div>

            {/* Guide Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white shadow-xl relative overflow-hidden group border-none">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000 group-hover:-rotate-12">
                  <CheckSquare className="w-48 h-48" />
               </div>
               <div className="relative z-10 font-black">
                  <h3 className="font-black text-3xl tracking-tight mb-4 italic uppercase underline decoration-indigo-500 decoration-4 underline-offset-8">Resource Nexus</h3>
                  <p className="text-sm font-medium opacity-60 leading-relaxed mb-10 italic">
                    Access standard evaluation protocols and tactical platform documentation.
                  </p>
                  <Link href="/dashboard/help" className="block w-full">
                    <button className="w-full py-5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/10 shadow-2xl active:scale-95 italic">
                       Deploy Guide
                    </button>
                   </Link>
                </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
