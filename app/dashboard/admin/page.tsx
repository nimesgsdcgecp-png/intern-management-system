"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  CheckSquare,
  BarChart3,
  PlusCircle,
  ClipboardList,
  Activity,
  CalendarDays,
  Target,
  Sparkles,
  ShieldCheck,
  History as HistoryIcon,
} from "lucide-react";
import { StatsGrid } from "@/app/components/StatsGrid";
import { QuickActionCard } from "@/app/components/QuickActionCard";
import { Card } from "@/app/components/Card";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import Link from "next/link";
import { motion } from "framer-motion";

interface DashboardData {
  totalInterns: number;
  totalMentors: number;
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  totalReports: number;
  pendingReports: number;
  recentActivity: any[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>({
    totalInterns: 0,
    totalMentors: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    totalReports: 0,
    pendingReports: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [internsRes, usersRes, tasksRes, reportsRes, activityRes] = await Promise.all([
          fetch("/api/interns"),
          fetch("/api/auth/users"),
          fetch("/api/tasks"),
          fetch("/api/reports"),
          fetch("/api/activity").catch(() => ({ ok: false, json: () => [] })),
        ]);

        const interns = internsRes.ok ? await internsRes.json() : [];
        const users = usersRes.ok ? await usersRes.json() : [];
        const tasks = tasksRes.ok ? await tasksRes.json() : [];
        const reports = reportsRes.ok ? await reportsRes.json() : [];
        const activity = activityRes.ok ? await activityRes.json() : [];

        const mentors = users.filter((u: any) => u.role === "mentor");
        const pendingTasks = tasks.filter((t: any) => t.status === "pending").length;
        const completedTasks = tasks.filter((t: any) => t.status === "completed").length;
        const pendingReports = reports.filter((r: any) => !r.mentorFeedback).length;

        setData({
          totalInterns: interns.length,
          totalMentors: mentors.length,
          totalTasks: tasks.length,
          pendingTasks,
          completedTasks,
          totalReports: reports.length,
          pendingReports,
          recentActivity: Array.isArray(activity) ? activity.slice(0, 5) : [],
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const completionRate = data.totalTasks > 0
    ? Math.round((data.completedTasks / data.totalTasks) * 100)
    : 0;

  const statsData = [
    {
      label: "Total Interns",
      value: loading ? "..." : data.totalInterns,
      icon: <Users />,
      color: "blue" as const,
    },
    {
      label: "Active Mentors",
      value: loading ? "..." : data.totalMentors,
      icon: <UserCheck />,
      color: "purple" as const,
    },
    {
      label: "Tasks Done",
      value: loading ? "..." : data.completedTasks,
      icon: <CheckSquare />,
      color: "green" as const,
    },
    {
      label: "Pending Reports",
      value: loading ? "..." : data.pendingReports,
      icon: <BarChart3 />,
      color: "yellow" as const,
    },
  ];

  const quickActions = [
    {
      label: "Add Intern",
      href: "/dashboard/admin/interns",
      icon: <PlusCircle className="w-6 h-6 text-indigo-600" />,
      bgColor: "bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400",
    },
    {
      label: "Reports",
      href: "/dashboard/admin/reports",
      icon: <BarChart3 className="w-6 h-6 text-violet-600 dark:text-violet-400" />,
      bgColor: "bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400",
    },
    {
      label: "Logs",
      href: "/dashboard/admin/logs",
      icon: <ClipboardList className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
    },
    {
      label: "Attendance",
      href: "/dashboard/admin/attendance",
      icon: <Activity className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
      bgColor: "bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight italic">
              Admin <span className="text-indigo-600">Overview</span>
            </h1>
            <p className="text-gray-500 mt-2 font-medium italic opacity-80">Welcome back. Manage your interns and team from one place.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-6 py-3 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black flex items-center gap-3 border border-indigo-100 uppercase tracking-[0.2em] italic shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-indigo-600/5 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              <ShieldCheck className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Administrator Authorized</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse relative z-10 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </div>
          </div>
        </div>

        <StatsGrid stats={statsData} loading={loading} />

        {/* Performance & Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-10">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-10 opacity-5">
                <Target className="w-40 h-40 text-indigo-600 -rotate-12" />
              </div>
              <div className="flex items-center justify-between mb-10 relative z-10">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-3 italic">
                  <span className="w-8 h-1 bg-indigo-600 rounded-full" />
                  Quick Actions
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 relative z-10">
                {quickActions.map((action) => (
                  <QuickActionCard key={action.label} {...action} />
                ))}
              </div>
            </div>

            {/* Reports Summary */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm overflow-hidden relative group hover:shadow-xl transition-all duration-500">
              <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700 group-hover:rotate-12">
                <Sparkles className="w-48 h-48 text-indigo-600" />
              </div>
              <div className="flex items-center justify-between mb-10 relative z-10">
                <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-[0.4em] italic flex items-center gap-3">
                  <span className="w-8 h-1 bg-indigo-500 rounded-full" />
                  Recent Reports
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                <div className="rounded-[2.5rem] p-10 border border-gray-50 bg-gray-50/50 shadow-sm group/card hover:bg-white transition-all duration-300">
                  <div className="text-5xl font-black text-slate-900 tracking-tighter italic group-hover/card:text-indigo-600 transition-colors">{loading ? "..." : data.totalReports}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3 opacity-60">Reports Synced</div>
                </div>
                <div className="rounded-[2.5rem] p-10 border border-gray-50 bg-gray-50/50 shadow-sm group/card hover:bg-white transition-all duration-300">
                  <div className="text-5xl font-black text-amber-500 tracking-tighter italic">{loading ? "..." : data.pendingReports}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3 opacity-60">Pending Intel Audit</div>
                </div>
              </div>
            </div>
          </div>


            <Card className="p-8 rounded-4xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 bg-white group overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
              <div className="relative z-10 flex flex-col items-center text-center">
                 <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white mb-6 shadow-lg group-hover:rotate-6 transition-transform">
                    <Users className="w-7 h-7" />
                 </div>
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2 italic">Intern Directory</h3>
                 <p className="text-sm font-bold text-slate-600 mb-8 italic">View and manage all registered interns.</p>
                 <Link href="/dashboard/admin/interns" className="w-full">
                    <button className="w-full bg-gray-50 hover:bg-indigo-600 hover:text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic border border-gray-100">View Directory</button>
                 </Link>
              </div>
            </Card>

            <Card className="p-8 rounded-4xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 bg-white group overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
              <div className="relative z-10 flex flex-col items-center text-center">
                 <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white mb-6 shadow-lg group-hover:-rotate-6 transition-transform">
                    <ShieldCheck className="w-7 h-7" />
                 </div>
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2 italic">Mentor Team</h3>
                 <p className="text-sm font-bold text-slate-600 mb-8 italic">Coordinate your leadership and set permissions.</p>
                 <Link href="/dashboard/admin/mentors" className="w-full">
                    <button className="w-full bg-gray-50 hover:bg-amber-600 hover:text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic border border-gray-100">View Team</button>
                 </Link>
              </div>
            </Card>

            <Card className="p-8 rounded-4xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 bg-white group overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
              <div className="relative z-10 flex flex-col items-center text-center text-slate-600">
                 <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white mb-6 shadow-lg group-hover:rotate-12 transition-transform">
                    <BarChart3 className="w-7 h-7" />
                 </div>
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2 italic">Report Hub</h3>
                 <p className="text-sm font-bold opacity-80 mb-8 italic">Review performance logs and growth metrics.</p>
                 <Link href="/dashboard/admin/reports" className="w-full">
                    <button className="w-full bg-gray-50 hover:bg-emerald-600 hover:text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic border border-gray-100">View Reports</button>
                 </Link>
              </div>
            </Card>

            <Card className="p-8 rounded-4xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 bg-white group overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors" />
              <div className="relative z-10 flex flex-col items-center text-center text-slate-600">
                 <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white mb-6 shadow-lg group-hover:-rotate-12 transition-transform">
                    <HistoryIcon className="w-7 h-7" />
                 </div>
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2 italic">Activity Logs</h3>
                 <p className="text-sm font-bold opacity-80 mb-8 italic">Monitor historical trails and security events.</p>
                 <Link href="/dashboard/admin/logs" className="w-full">
                    <button className="w-full bg-gray-50 hover:bg-rose-600 hover:text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic border border-gray-100">View History</button>
                 </Link>
              </div>
            </Card>
           <div className="bg-white rounded-4xl border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic">System Summary</h3>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                   <Activity className="w-4 h-4 text-indigo-500 opacity-40" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-4xl border border-gray-100 shadow-sm group hover:bg-white transition-all duration-300">
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] italic opacity-60">Total Interns</span>
                  <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase italic">{loading ? "..." : data.totalInterns} Count</span>
                </div>
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-4xl border border-gray-100 shadow-sm group hover:bg-white transition-all duration-300">
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] italic opacity-60">Active Mentors</span>
                  <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase italic">{loading ? "..." : data.totalMentors} People</span>
                </div>
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-4xl border border-gray-100 shadow-sm group hover:bg-white transition-all duration-300">
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] italic opacity-60">Pending Tasks</span>
                  <span className="text-sm font-black text-amber-500 uppercase italic">{loading ? "..." : data.pendingTasks} Todo</span>
                </div>
                <div className="mt-6 p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 relative overflow-hidden">
                   <div className="relative z-10">
                      <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2 italic">Productivity</div>
                      <div className="flex items-end gap-3">
                         <div className="text-3xl font-black text-indigo-600 tracking-tighter italic">{completionRate}%</div>
                         <div className="text-[10px] font-black text-indigo-400 uppercase mb-1">Efficiency</div>
                      </div>
                   </div>
                   <div className="absolute right-0 bottom-0 p-4 opacity-10">
                      <ShieldCheck className="w-16 h-16 text-indigo-600 rotate-12" />
                   </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
