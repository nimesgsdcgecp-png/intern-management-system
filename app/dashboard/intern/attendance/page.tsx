"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { Card } from "@/app/components/ui/Card";
import { AttendanceTable } from "@/app/components/features/AttendanceTable";
import { StatsGrid } from "@/app/components/ui/StatsGrid";
import { Clock, Calendar, CheckCircle2, History, Timer, Loader2, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

export default function InternAttendancePage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalHours: 0,
    presentDays: 0,
    avgDailyHours: 0,
  });
  const [loading, setLoading] = useState(true);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [punching, setPunching] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchTodayRecord();
  }, []);

  /**
   * Effect: Temporal Performance Tracking
   * Aggregates total work hours and Attendance days for the current session user.
   * Calculates daily average to provide productivity insights.
   */
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/attendance");
      if (res.ok) {
        const logs = await res.json();
        // Handle case where logs might be an object instead of array if singular fetch
        const logsArray = Array.isArray(logs) ? logs : [logs].filter(Boolean);
        
        const present = logsArray.length;
        const totalHours = logsArray.reduce((acc: number, log: any) => acc + (log.total_hours || 0), 0);
        const avg = present > 0 ? (totalHours / present).toFixed(1) : "0.0";
        
        setStats({
          totalHours: parseFloat(totalHours.toFixed(1)),
          presentDays: present,
          avgDailyHours: parseFloat(avg),
        });
      }
    } catch (error) {
      console.error("Failed to fetch attendance stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayRecord = async () => {
    try {
      const res = await fetch("/api/attendance");
      if (res.ok) {
        const data = await res.json();
        // The API returns the first record for the given date (default today)
        setTodayRecord(data);
      }
    } catch (error) {
      console.error("Failed to fetch today record:", error);
    }
  };

  /**
   * Logic: Attendance Verification
   * Manages check-in and check-out events for the current workday.
   * Ensures high-fidelity record keeping for mentor audit.
   */
  const handlePunch = async (action: "clock-in" | "clock-out") => {
    setPunching(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        await fetchTodayRecord();
        await fetchStats();
        
        Swal.fire({
          title: action === "clock-in" ? "Checked In!" : "Checked Out!",
          text: action === "clock-in" 
            ? "Your start time has been recorded." 
            : "Your work hours for today have been updated.",
          icon: "success",
          confirmButtonColor: "#4f46e5",
          timer: 2000,
          timerProgressBar: true,
          customClass: {
            popup: 'dm-modal rounded-[2rem]'
          }
        });
      } else {
        const err = await res.json();
        Swal.fire("Error", err.error || "Failed to update record", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Check your internet connection", "error");
    } finally {
      setPunching(false);
    }
  };

  const statsData = [
    {
      label: "Total Hours",
      value: loading ? "..." : `${stats.totalHours}h`,
      icon: <Clock />,
      color: "blue" as const,
    },
    {
      label: "Days Worked",
      value: loading ? "..." : String(stats.presentDays),
      icon: <CheckCircle2 />,
      color: "green" as const,
    },
    {
      label: "Daily Average",
      value: loading ? "..." : `${stats.avgDailyHours}h`,
      icon: <Timer />,
      color: "purple" as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Work <span className="text-indigo-600">History</span>
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Track your check-ins and total working hours.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black flex items-center gap-3 border border-indigo-100 uppercase tracking-widest shadow-sm">
                <ShieldCheck className="w-4 h-4" />
                Attendance Verified
             </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 group">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-indigo-50 rounded-[1.25rem] flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Time Tracker</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Record your work entry and exit for today</p>
            </div>
          </div>
          <AnimatePresence mode="wait">
            {!todayRecord?.clock_in ? (
                <motion.button
                  key="clock-in"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => handlePunch("clock-in")}
                  disabled={punching}
                  className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                  {punching ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  Check In
                </motion.button>
            ) : !todayRecord?.clock_out ? (
                <motion.button
                  key="clock-out"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => handlePunch("clock-out")}
                  disabled={punching}
                  className="px-10 py-4 bg-rose-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                  {punching ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                  Check Out
                </motion.button>
            ) : (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-8 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Work for today completed
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        <StatsGrid stats={statsData} loading={loading} />

        {/* History Table */}
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                   <History className="w-6 h-6 text-indigo-600" />
                   Recent Activity
                </h2>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                   Year: {new Date().getFullYear()}
                </div>
            </div>
            
            <div className="rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm bg-white">
                <div className="p-8">
                   <AttendanceTable mode="personal" />
                </div>
            </div>
        </div>

        {/* Tips Section */}
        <div className="bg-indigo-50/30 p-10 rounded-[2.5rem] border border-indigo-100/50 group relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
              <Calendar className="w-32 h-32 text-indigo-600" />
           </div>
           <div className="flex items-start gap-6 relative z-10">
              <div className="p-4 bg-indigo-100/50 rounded-2xl text-indigo-600 shadow-sm border border-indigo-100 group-hover:rotate-12 transition-transform">
                 <Calendar className="w-7 h-7" />
              </div>
              <div>
                 <h4 className="text-[11px] font-black text-indigo-900 uppercase tracking-widest mb-3">Automatic Tracking System</h4>
                 <p className="text-xs text-indigo-900/60 font-semibold leading-relaxed max-w-2xl">
                    Your check-ins are automatically saved and shared with your mentor for verification. Please remember to check in when you start and check out when you finish to ensure your hours are calculated accurately for the internship duration.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
