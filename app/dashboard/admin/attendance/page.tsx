"use client";

import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { Card } from "@/app/components/ui/Card";
import { AttendanceTable } from "@/app/components/features/AttendanceTable";
import { useState, useEffect } from "react";
import { StatsGrid } from "@/app/components/ui/StatsGrid";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { FileText, Clock, AlertCircle, CheckCircle2, Search, Activity, ShieldCheck, Calendar, Users } from "lucide-react";

export default function AttendanceMonitorPage() {
  const { data: session } = useSession();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [department, setDepartment] = useState("");
  const [stats, setStats] = useState({ present: 0, avgHours: "0.0", lead: "N/A" });
  const [loading, setLoading] = useState(true);

  const role = (session?.user as any)?.role;
  const isMentor = role === "mentor";

  /**
   * Effect: Identity Management
   * Determines the user's role and initializes department-level filters 
   * if the user is a mentor. This ensures they only see relevant team data.
   */
  useEffect(() => {
    if (isMentor && session && (session.user as any)?.department) {
      setDepartment((session.user as any).department);
    }
  }, [isMentor, session]);

  /**
   * Effect: Metrics Aggregation
   * Synchronizes tactical attendance data including Attendance counts, 
   * hours worked, and department-level leadership stats.
   */
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/attendance?all=true&date=${date}${department ? `&department=${department}` : ''}`);
        if (response.ok) {
          const logs = await response.json();
          const dayLogs = Array.isArray(logs) ? logs : [];
          
          const presentCount = dayLogs.filter((l: any) => l.status === "present").length;
          const totalHours = dayLogs.reduce((acc: number, l: any) => acc + (l.total_hours || 0), 0);
          const avgHours = presentCount > 0 ? (totalHours / presentCount).toFixed(1) : "0.0";
          
          setStats({
            present: presentCount,
            avgHours,
            lead: department || dayLogs[0]?.user?.profile?.department || "N/A", 
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [date, department]);

  const statsData = [
    {
      label: "Present Today",
      value: stats.present,
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: "green" as const,
    },
    {
      label: "Avg. Hours",
      value: `${stats.avgHours}h`,
      icon: <Clock className="w-6 h-6" />,
      color: "blue" as const,
    },
    {
      label: "Top Team",
      value: stats.lead,
      icon: <Activity className="w-6 h-6" />,
      color: "purple" as const,
    },
  ];

  const DEPARTMENTS = ["AI", "ODOO", "JAVA", "MOBILE", "SAP", "QC", "PHP", "RPA"];

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
              Attendance <span className="text-indigo-600">Monitor</span>
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              {isMentor ? "View daily attendance for your department." : "Overview of daily attendance across the organization."}
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black flex items-center gap-3 border border-indigo-100 uppercase tracking-widest shadow-sm">
                <ShieldCheck className="w-4 h-4" />
                {isMentor ? "Mentor Access" : "Admin View"}
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        <StatsGrid stats={statsData} loading={loading} />

        {/* Filter Bar */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Period Selection</label>
               <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer outline-none"
                  />
               </div>
            </div>

            {!isMentor ? (
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Department</label>
                 <select
                   value={department}
                   onChange={(e) => setDepartment(e.target.value)}
                   className="w-full bg-gray-50 border-none rounded-2xl py-3 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer outline-none shadow-inner"
                 >
                   <option value="">All Streams</option>
                   {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                 </select>
              </div>
            ) : (
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Your Department</label>
                 <div className="w-full bg-indigo-50 text-indigo-600 rounded-2xl py-3 px-6 text-sm font-black uppercase tracking-widest shadow-sm border border-indigo-100">
                   {department || "Loading..."}
                 </div>
              </div>
            )}
            
            <button 
              onClick={() => { 
                setDate(new Date().toISOString().split('T')[0]); 
                if (!isMentor) setDepartment(""); 
              }}
              className="h-12 px-10 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-100"
            >
              Reset Configuration
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
             <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                <Users className="w-6 h-6 text-indigo-600" />
                Attendance List
             </h2>
             <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full border border-gray-100 group hover:bg-white transition-colors cursor-default">
                {new Date(date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
             </div>
          </div>
          
          <div className="rounded-[2.5rem] border border-gray-100 overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-500">
             <div className="p-8">
                <AttendanceTable date={date} department={department} mode="all" />
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
