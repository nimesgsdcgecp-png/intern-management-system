"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { StatsGrid } from "@/app/components/StatsGrid";
import { Card } from "@/app/components/Card";
import { SearchHeader } from "@/app/components/SearchHeader";
import { Button } from "@/app/components/Button";
import { CheckSquare, Clock, FileText, Target, Users } from "lucide-react";

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
        <SearchHeader title="Intern Dashboard" />
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="premium-spinner mb-4"></div>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Synchronizing Workspace...</p>
          </div>
        ) : (
          <StatsGrid stats={statsData} loading={loading} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Recommended Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: "Daily Report", href: "/dashboard/intern/submit-report", icon: <FileText className="w-5 h-5" />, color: "bg-indigo-50 text-indigo-600", desc: "Log today's work" },
                { label: "My Tasks", href: "/dashboard/intern/tasks", icon: <Target className="w-5 h-5" />, color: "bg-blue-50 text-blue-600", desc: "View assignments" },
                { label: "Feedback", href: "/dashboard/intern/reports", icon: <CheckSquare className="w-5 h-5" />, color: "bg-emerald-50 text-emerald-600", desc: "Review comments" }
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
            
            <Card title="Workspace Notifications" className="bg-gray-50/50 border-dashed">
              <div className="py-12 flex flex-col items-center text-center">
                 <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                   <Target className="w-6 h-6 text-gray-300" />
                 </div>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No critical alerts at this time.</p>
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Identity Profile</h3>
            <Card className="overflow-hidden border-none shadow-2xl shadow-gray-200/50">
              <div className="p-6 bg-linear-to-br from-indigo-600 to-blue-700 text-white relative">
                 <div className="relative z-10">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Authenticated Identifier</p>
                   <h4 className="text-xl font-black mb-4">{session?.user?.name}</h4>
                   <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Status: Active Intern</span>
                   </div>
                 </div>
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Users className="w-24 h-24" />
                 </div>
              </div>
              <div className="p-6 space-y-6 bg-white">
                {[
                   { label: "Email Address", value: session?.user?.email },
                   { label: "Operational Dept", value: profile?.department },
                   { label: "Educational Inst", value: profile?.collegeName },
                   { label: "Primary Mentor", value: profile?.mentorName },
                   { label: "Lead Admin", value: profile?.adminName }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                    <p className="text-xs font-bold text-gray-700">{item.value || "N/A"}</p>
                  </div>
                ))}
                <div className="pt-6 border-t border-gray-50">
                   <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest text-center">
                     Session initialized: {new Date().toLocaleDateString()}
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
