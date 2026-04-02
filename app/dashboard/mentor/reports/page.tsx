"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Select } from "@/app/components/ui/Select";
import { TextArea } from "@/app/components/ui/TextArea";
import { Modal } from "@/app/components/ui/Modal";
import { SearchHeader } from "@/app/components/features/SearchHeader";
import { FileText, Clock, MessageSquare, Target, ShieldCheck, Sparkles, Activity, CheckCircle2, AlertCircle, ExternalLink, Timer, Gauge, Search, Calendar, User, Mail, Loader2, ClipboardCheck } from "lucide-react";
import { StatsGrid } from "@/app/components/ui/StatsGrid";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

interface Report {
  id: string;
  internId: string;
  date: string;
  workDescription: string;
  hoursWorked: number;
  mentorFeedback: string;
  submittedAt: string;
}

interface Intern {
  id: string;
  name: string;
}

export default function MentorReportsPage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [interns, setInterns] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState<Record<string, string>>({});
  const [submittingFeedback, setSubmittingFeedback] = useState<Record<string, boolean>>({});
  const [emailNotifications, setEmailNotifications] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState({ internName: "", feedbackStatus: "" });
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  /**
   * Effect: Relational Data Mapping
   * Synchronizes intern profiles and work reports, establishing a 
   * mentor-centric view of all submitted technical documentation.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const mentorId = (session?.user as any)?.id;
        const [internsRes, reportsRes] = await Promise.all([
          fetch("/api/interns"),
          fetch("/api/reports"),
        ]);

        if (internsRes.ok && reportsRes.ok) {
          const allInterns = await internsRes.json();
          const allReports = await reportsRes.json();

          // Get assigned interns
          const myInterns = allInterns.filter((i: any) => i.mentorId === mentorId);
          const myInternIds = myInterns.map((i: any) => i.id);

          // Create intern map
          const internMap = new Map<string, string>();
          myInterns.forEach((i: any) => {
            internMap.set(i.id, i.name);
          });
          setInterns(internMap);

          // Filter reports for my interns
          const myReports = allReports.filter((r: any) =>
            myInternIds.includes(r.internId)
          );
          setReports(myReports);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) fetchData();
  }, [session]);

  const handleFeedbackChange = (reportId: string, feedback: string) => {
    setFeedbackData({
      ...feedbackData,
      [reportId]: feedback,
    });
  };

  /**
   * Logic: Feedback Synchronization
   * Publishes mentor evaluations for specific work reports.
   * Supports asynchronous submission with optional email broadcast.
   */
  const handleSubmitFeedback = async (reportId: string) => {
    const feedback = feedbackData[reportId]?.trim();

    if (!feedback) {
      Swal.fire("Required", "Please enter feedback before submitting.", "info");
      return;
    }

    setSubmittingFeedback(prev => ({ ...prev, [reportId]: true }));

    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorFeedback: feedback,
          sendEmail: !!emailNotifications[reportId],
        }),
      });

      if (res.ok) {
        const updatedReports = reports.map((r) =>
          r.id === reportId
            ? { ...r, mentorFeedback: feedback }
            : r
        );
        setReports(updatedReports);
        setFeedbackData({ ...feedbackData, [reportId]: "" });
        Swal.fire("Feedback Submitted", "Your feedback has been recorded successfully.", "success");
      } else {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        Swal.fire("Error", errorData.error || "Failed to submit feedback", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Check your internet connection", "error");
    } finally {
      setSubmittingFeedback(prev => ({ ...prev, [reportId]: false }));
    }
  };

  const filteredReports = reports.filter((report) => {
    const internName = interns.get(report.internId) || "";
    const hasFeedback = !!report.mentorFeedback;
    return (
      internName.toLowerCase().includes(filters.internName.toLowerCase()) &&
      (filters.feedbackStatus === "" ||
        (filters.feedbackStatus === "pending" && !hasFeedback) ||
        (filters.feedbackStatus === "reviewed" && hasFeedback))
    );
  });

  const totalHoursReviewed = reports.filter(r => !!r.mentorFeedback).reduce((acc, r) => acc + (r.hoursWorked || 0), 0);
  const pendingFeedbackCount = reports.filter(r => !r.mentorFeedback).length;

  const statsData = [
    {
      label: "Total Reports",
      value: loading ? "..." : reports.length,
      icon: <FileText />,
      color: "blue" as const,
    },
    {
      label: "Needs Feedback",
      value: loading ? "..." : pendingFeedbackCount,
      icon: <Clock />,
      color: "yellow" as const,
    },
    {
      label: "Hours Reviewed",
      value: loading ? "..." : totalHoursReviewed,
      icon: <Timer />,
      color: "green" as const,
    },
    {
      label: "Avg. Hours/Report",
      value: loading ? "..." : reports.length > 0 ? (reports.reduce((acc, r) => acc + (r.hoursWorked || 0), 0) / reports.length).toFixed(1) : "0",
      icon: <Gauge />,
      color: "purple" as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Review Reports
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Review and provide feedback for work reports submitted by your interns.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black flex items-center gap-3 border border-indigo-100 uppercase tracking-widest shadow-sm">
              <ShieldCheck className="w-4 h-4" />
              Reviewer Access Enabled
            </div>
          </div>
        </div>

        <StatsGrid stats={statsData} loading={loading} />


        {/* Filter Section */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Search by Intern Name</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  placeholder="Type intern name..."
                  value={filters.internName}
                  onChange={(e) => setFilters({ ...filters, internName: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-300 outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Current Status</label>
              <select
                value={filters.feedbackStatus}
                onChange={(e) => setFilters({ ...filters, feedbackStatus: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer outline-none"
              >
                <option value="">All Reports</option>
                <option value="pending">Needs Review</option>
                <option value="reviewed">Already Reviewed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-indigo-600">
              <div className="premium-spinner mb-6"></div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading records...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <Card className="text-center py-24 rounded-[2.5rem] border-dashed border-2 border-gray-100 bg-gray-50/20">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-6 opacity-40" />
              <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">No Reports Found</h3>
              <p className="text-gray-500 max-w-sm mx-auto font-medium tracking-tight">There are no reports matching your current filter settings.</p>
            </Card>
          ) : (
            <>
              <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Intern Information</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Submitted Date</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Work Hours</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredReports.map((report) => (
                        <tr key={report.id} className="group transition-all duration-300 hover:bg-gray-50/30">
                          <td className="px-8 py-4 min-w-[200px]">
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold shadow-sm shadow-slate-200">
                                {interns.get(report.internId)?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight text-base">{interns.get(report.internId)}</span>
                                <span className="text-xs text-gray-400 font-medium">Performance Analyst</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5 font-bold text-xs text-slate-700 tracking-tight">
                              <Calendar className="w-4 h-4 text-indigo-400" />
                              {new Date(report.submittedAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-50 inline-flex items-center gap-2">
                              <Timer className="w-3.5 h-3.5" />
                              {report.hoursWorked} HRS
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              report.mentorFeedback ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {report.mentorFeedback ? "Reviewed" : "Pending"}
                            </span>
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex justify-end">
                              <button 
                                onClick={() => setSelectedReport(report)}
                                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                              >
                                {report.mentorFeedback ? "View Details" : "Review"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal for detail view */}
              {selectedReport && (
                <Modal
                  isOpen={!!selectedReport}
                  onClose={() => setSelectedReport(null)}
                  title={selectedReport.mentorFeedback ? "Report Details" : "Review Work Report"}
                  size="lg"
                >
                   <div className="space-y-10">
                     <div className="flex items-center gap-6 p-8 bg-gray-50 rounded-[2rem] border border-gray-100 group hover:shadow-xl transition-all duration-500">
                        <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-slate-200 group-hover:scale-105 transition-transform">
                          {interns.get(selectedReport.internId)?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">{interns.get(selectedReport.internId)}</h3>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Submitted on {new Date(selectedReport.submittedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 block">Work Description</label>
                        <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 text-gray-600 leading-relaxed text-sm shadow-sm relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
                              <FileText className="w-24 h-24" />
                           </div>
                           <p className="relative z-10">"{selectedReport.workDescription}"</p>
                        </div>
                     </div>

                     {selectedReport.mentorFeedback ? (
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] ml-1 block">Mentor Feedback</label>
                          <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 text-emerald-900 leading-relaxed text-sm shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                               <ClipboardCheck className="w-24 h-24" />
                            </div>
                            <p className="relative z-10 font-bold">"{selectedReport.mentorFeedback}"</p>
                          </div>
                        </div>
                     ) : (
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 block">Provide Feedback</label>
                            <textarea
                              value={feedbackData[selectedReport.id] || ""}
                              onChange={(e) => handleFeedbackChange(selectedReport.id, e.target.value)}
                              placeholder="Write constructive feedback to help your intern grow..."
                              rows={5}
                              className="w-full rounded-[2.5rem] p-8 border border-gray-100 bg-gray-50 text-gray-900 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all resize-none shadow-sm"
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                             <label className="flex items-center gap-4 cursor-pointer p-4 px-6 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 group w-full sm:w-auto">
                                <input
                                  type="checkbox"
                                  checked={!!emailNotifications[selectedReport.id]}
                                  onChange={(e) => setEmailNotifications({ ...emailNotifications, [selectedReport.id]: e.target.checked })}
                                  className="w-6 h-6 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all"
                                />
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-gray-900 uppercase tracking-tight">Email Notify</span>
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Inform intern via mail</span>
                                </div>
                             </label>

                             <button
                               onClick={() => {
                                 handleSubmitFeedback(selectedReport.id);
                                 setSelectedReport(null);
                               }}
                               disabled={submittingFeedback[selectedReport.id] || !feedbackData[selectedReport.id]?.trim()}
                               className="w-full sm:w-auto px-12 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                             >
                               {submittingFeedback[selectedReport.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
                               Submit Feedback
                             </button>
                          </div>
                        </div>
                     )}
                  </div>
                </Modal>
              )}
            </>
          )}
        </div>
      </div>
      <style jsx global>{`
        .premium-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #4f46e5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </DashboardLayout>
  );
}
