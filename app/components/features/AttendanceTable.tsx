"use client";

import React, { useState, useEffect } from "react";
import { User, Clock, CheckCircle2, AlertCircle, Loader2, Calendar, Filter, ArrowRight, ShieldCheck } from "lucide-react";
import { Card } from "../ui/Card";
import { motion, AnimatePresence } from "framer-motion";

interface AttendanceTableProps {
  mode?: "personal" | "all";
  date?: string;
  department?: string;
}

export function AttendanceTable({ 
  mode = "all", 
  date = new Date().toISOString().split('T')[0],
  department = "" 
}: AttendanceTableProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [mode, date, department]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = mode === "all" 
        ? `/api/attendance?all=true&date=${date}${department ? `&department=${department}` : ''}` 
        : `/api/attendance?date=${date}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        let results = Array.isArray(data) ? data : data ? [data] : [];
        // Flexible data extraction for profile and department
        results = results.map((l: any) => {
          const userObj = l.user || {};
          const profile = userObj.profile || userObj || {};
          return {
            ...l,
            user: {
              ...userObj,
              profile: {
                name: profile.name || userObj.name || "Unknown Intern",
                department: profile.department || userObj.department || l.department || "General"
              }
            }
          };
        });
        
        setLogs(results);
      } else {
        setError("Synchronization failed");
      }
    } catch (err) {
      setError("Network interruption");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="py-32 flex flex-col items-center justify-center gap-6">
       <Loader2 className="w-10 h-10 text-indigo-600 animate-spin opacity-50" />
       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fetching Attendance Data...</p>
    </div>
  );

  if (error) return (
    <div className="py-20 text-center">
       <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4 opacity-50" />
       <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">{error}</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100 uppercase">
            <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.2em]">Intern</th>
            <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.2em]">Date</th>
            <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.2em]">Punch In</th>
            <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.2em]">Punch Out</th>
            <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.2em]">Duration</th>
            <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.2em] text-right">Verification</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          <AnimatePresence mode="popLayout">
            {logs.map((log, i) => (
              <motion.tr 
                key={log.id} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="group hover:bg-gray-50/30 transition-colors"
              >
                <td className="px-8 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {log.user?.profile?.name?.[0] || log.user?.name?.[0] || "U"}
                    </div>
                    <div>
                      <span className="text-[13px] font-bold text-gray-900 block leading-none mb-1">
                        {log.user?.profile?.name || log.user?.name || "Unknown Intern"}
                      </span>
                      {mode === "all" && (
                         <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">
                              {log.user?.profile?.department || log.user?.department || "General"}
                           </span>
                         </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm font-medium text-gray-600">
                  {log.date}
                </td>
                <td className="px-8 py-5 text-sm font-bold text-gray-700">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      {log.clock_in ? new Date(log.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Pending"}
                   </div>
                </td>
                <td className="px-8 py-5 text-sm font-bold text-gray-700 opacity-70">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500/50" />
                      {log.clock_out ? new Date(log.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Active"}
                   </div>
                </td>
                <td className="px-8 py-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest">
                    {log.total_hours || "0.00"}H
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    log.status === 'present' 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-rose-50 text-rose-500'
                  }`}>
                    {log.status === 'present' ? 'Verified' : 'Absent'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
          
          {logs.length === 0 && (
            <tr>
              <td colSpan={6} className="py-32 text-center">
                <div className="flex flex-col items-center gap-4 opacity-40">
                   <Calendar className="w-12 h-12 text-slate-300" />
                   <div>
                      <p className="text-sm font-bold text-gray-900 mb-1">No attendance records found</p>
                      <p className="text-xs text-gray-500 font-medium">Try adjusting your date or department filters.</p>
                   </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
