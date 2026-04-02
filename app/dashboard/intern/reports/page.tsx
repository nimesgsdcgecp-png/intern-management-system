"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/Card";
import { FileText, Clock, Calendar, CheckCircle2, MessageSquare, Timer, Sparkles, Activity, ShieldCheck, ExternalLink } from "lucide-react";
import { StatsGrid } from "@/app/components/StatsGrid";
import { PremiumStatCard } from "@/app/components/PremiumStatCard";
import { motion } from "framer-motion";

interface Report {
  id: string;
  date: string;
  workDescription: string;
  hoursWorked: number;
  mentorFeedback: string;
  submittedAt: string;
}

export default function MyReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/reports");
        if (res.ok) {
          setReports(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const totalHours = reports.reduce((acc, r) => acc + (r.hoursWorked || 0), 0);

  const statsData = [
    {
      label: "Total Reports",
      value: loading ? "..." : reports.length,
      icon: <FileText />,
      color: "blue" as const,
    },
    {
      label: "Billable Hours",
      value: loading ? "..." : totalHours,
      icon: <Clock />,
      color: "green" as const,
    },
    {
      label: "Evaluations",
      value: loading ? "..." : reports.filter(r => !!r.mentorFeedback).length,
      icon: <ShieldCheck />,
      color: "purple" as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Activity <span className="text-indigo-600">Logs</span>
            </h1>
            <p className="text-gray-500 mt-1 font-medium italic">Your chronological submission history and performance evaluations.</p>
          </div>
          <a 
            href="/dashboard/intern/submit-report" 
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black flex items-center gap-2 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest active:scale-95"
          >
            <Activity className="w-4 h-4" />
            Submit Daily Log
          </a>
        </div>

        <StatsGrid stats={statsData} loading={loading} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-indigo-600">
            <div className="premium-spinner mb-6"></div>
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Retrieving Activity History...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-32 rounded-[2.5rem] border-dashed border-2 border-gray-100 bg-gray-50/20">
            <FileText className="w-20 h-20 text-gray-300 mx-auto mb-8 opacity-20" />
            <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight italic">No Records Found</h3>
            <p className="text-gray-400 max-w-sm mx-auto font-medium tracking-tight mb-8 italic">You haven't submitted any activity reports yet. Begin tracking your progress today.</p>
            <a href="/dashboard/intern/submit-report" className="text-indigo-600 font-black hover:underline flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest">
                Submit your first report <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="mt-8">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Log Date</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Activity Summary</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Duration</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Evaluation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reports.map((report) => (
                      <tr key={report.id} className="group transition-all duration-300 hover:bg-gray-50/30">
                        <td className="px-8 py-4">
                           <div className="flex items-center gap-3 font-bold text-gray-900 tracking-tight text-base italic group-hover:text-indigo-600 transition-colors">
                              <Calendar className="w-4 h-4 text-indigo-400" /> 
                              {report.date}
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-md">
                            <p className="text-xs font-semibold text-gray-500 line-clamp-2 italic leading-relaxed">
                              "{report.workDescription}"
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-indigo-50 w-fit">
                             <Timer className="w-3.5 h-3.5" />
                             {report.hoursWorked} HRS
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex justify-end">
                            {report.mentorFeedback ? (
                              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                 <CheckCircle2 className="w-3.5 h-3.5" />
                                 <span className="text-[10px] font-black uppercase tracking-widest leading-none">Evaluated</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                 <Timer className="w-3.5 h-3.5 animate-pulse" />
                                 <span className="text-[10px] font-black uppercase tracking-widest leading-none">Reviewing</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
