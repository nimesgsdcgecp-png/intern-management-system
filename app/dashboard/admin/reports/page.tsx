"use client";

import { useEffect, useState, Fragment } from "react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { Card } from "@/app/components/ui/Card";
import { StatsGrid } from "@/app/components/ui/StatsGrid";
import { SearchHeader } from "@/app/components/features/SearchHeader";
import { Input } from "@/app/components/ui/Input";
import { Select } from "@/app/components/ui/Select";
import { Button } from "@/app/components/ui/Button";
import { AttendanceTable } from "@/app/components/features/AttendanceTable";
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  Users,
  Mail,
  Calendar,
  Eye,
  ChevronDown,
  ChevronUp,
  Building2,
  Search,
} from "lucide-react";

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
  email: string;
  department: string;
  mentorId: string;
}

interface ReportFilters {
  internName: string;
  department: string;
  feedbackStatus: "all" | "pending" | "reviewed";
  dateFrom: string;
}

const DEPARTMENTS = ["AI", "ODOO", "JAVA", "MOBILE", "SAP", "QC", "PHP", "RPA"];

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [internMap, setInternMap] = useState<Map<string, Intern>>(new Map());
  const [loading, setLoading] = useState(true);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    internName: "",
    department: "",
    feedbackStatus: "all",
    dateFrom: "",
  });
  const [sortConfig, setSortConfig] = useState<{ key: keyof Report | 'intern'; direction: 'asc' | 'desc' } | null>(null);

  /**
   * Effect: Data Synchronization
   * Fetches the global registry of reports and interns to populate the dashboard.
   * Maps interns by ID for O(1) lookup during rendering.
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [reportsRes, internsRes] = await Promise.all([
          fetch("/api/reports"),
          fetch("/api/interns"),
        ]);

        if (reportsRes.ok) {
          setReports(await reportsRes.json());
        }
        if (internsRes.ok) {
          const internData = await internsRes.json();
          const map = new Map<string, Intern>();
          internData.forEach((i: Intern) => map.set(i.id, i));
          setInternMap(map);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Logic: Multi-dimensional Filtering
   * Filters the report registry based on intern identity, department stream, 
   * review status, and historical date range.
   */
  const filteredReports = reports.filter((report) => {
    const intern = internMap.get(report.internId);
    const internName = intern?.name?.toLowerCase() || "";
    const internDept = intern?.department || "";

    // Name filter
    if (filters.internName && !internName.includes(filters.internName.toLowerCase())) {
      return false;
    }

    // Department filter
    if (filters.department && internDept !== filters.department) {
      return false;
    }

    // Feedback status filter
    if (filters.feedbackStatus === "pending" && report.mentorFeedback) {
      return false;
    }
    if (filters.feedbackStatus === "reviewed" && !report.mentorFeedback) {
      return false;
    }

    // Date filter
    if (filters.dateFrom && report.date < filters.dateFrom) {
      return false;
    }

    return true;
  });

  /**
   * Logic: Tactical Sorting
   * Sorts the filtered dataset based on active configuration (e.g., date, hours, or intern name).
   */
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (!sortConfig) return 0;
    
    let aValue: any = a[sortConfig.key as keyof Report];
    let bValue: any = b[sortConfig.key as keyof Report];

    if (sortConfig.key === 'intern') {
      aValue = getInternInfo(a.internId).name;
      bValue = getInternInfo(b.internId).name;
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: keyof Report | 'intern') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Calculate stats
  const totalReports = reports.length;
  const totalHours = reports.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
  const pendingFeedback = reports.filter((r) => !r.mentorFeedback).length;
  const reviewedReports = reports.filter((r) => !!r.mentorFeedback).length;

  const statsData = [
    {
      label: "Total Reports",
      value: totalReports,
      icon: <FileText className="w-6 h-6" />,
      color: "blue" as const,
    },
    {
      label: "Hours Logged",
      value: totalHours.toFixed(1),
      icon: <Clock className="w-6 h-6" />,
      color: "purple" as const,
    },
    {
      label: "Pending Feedback",
      value: pendingFeedback,
      icon: <AlertCircle className="w-6 h-6" />,
      color: "yellow" as const,
    },
    {
      label: "Reports Reviewed",
      value: reviewedReports,
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: "green" as const,
    },
  ];

  const getInternInfo = (internId: string) => {
    return internMap.get(internId) || { name: "Unknown", email: "", department: "N/A" };
  };

  const toggleExpand = (reportId: string) => {
    setExpandedReportId(expandedReportId === reportId ? null : reportId);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <DashboardLayout>
      <div className="w-full">
        {/* Page Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Insight Reports
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Analyze performance metrics and review technical submissions.</p>
          </div>
          <div className="flex gap-4 no-print">
            <Button
              onClick={() => window.print()}
              icon={<FileText className="w-4 h-4" />}
              className="rounded-2xl py-3 px-8 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
            >
              Export PDF
            </Button>
          </div>
        </div>

        <style jsx global>{`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; }
            .DashboardLayout_content__vh8m2 { padding: 0 !important; margin: 0 !important; }
            table { border-collapse: collapse !important; width: 100% !important; }
            th, td { border: 1px solid #e2e8f0 !important; padding: 12px !important; font-size: 10px !important; }
            .bg-white { border: none !important; box-shadow: none !important; }
            h1 { font-size: 24px !important; margin-bottom: 20px !important; }
            .StatsGrid_grid__x9j3k { display: none !important; }
            tr { page-break-inside: avoid; }
          }
        `}</style>

        {/* Filter Section */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Search Intern</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Ex: John Doe"
                  value={filters.internName}
                  onChange={(e) => setFilters({ ...filters, internName: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-300 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Stream Filter</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer outline-none"
              >
                <option value="">All Streams</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Review Status</label>
              <select
                value={filters.feedbackStatus}
                onChange={(e) => setFilters({ ...filters, feedbackStatus: e.target.value as any })}
                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer outline-none"
              >
                <option value="all">Full Lifecycle</option>
                <option value="pending">Awaiting Review</option>
                <option value="reviewed">Evaluated</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">History Range</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-300 outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-10">
          {/* Stats Grid */}
          <StatsGrid stats={statsData} loading={loading} />

          {/* Reports Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-6"></div>
              <p className="text-lg font-medium tracking-tight">Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <Card className="text-center py-24 border-dashed border-2 bg-gray-50/20">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {reports.length === 0
                  ? "No intern reports have been submitted yet."
                  : "Try adjusting your filters to see more results."}
              </p>
            </Card>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 uppercase">
                      <th 
                        className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:bg-gray-100 transition-colors group"
                        onClick={() => handleSort('intern')}
                      >
                        <div className="flex items-center gap-2">
                          Operational Resource
                          {sortConfig?.key === 'intern' ? (
                            sortConfig.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-indigo-600" /> : <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Deployment Stream</th>
                      <th 
                        className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:bg-gray-100 transition-colors group"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center gap-2">
                          Log Timestamp
                          {sortConfig?.key === 'date' ? (
                            sortConfig.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-indigo-600" /> : <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:bg-gray-100 transition-colors group"
                        onClick={() => handleSort('hoursWorked')}
                      >
                        <div className="flex items-center gap-2">
                          Effort Log
                          {sortConfig?.key === 'hoursWorked' ? (
                            sortConfig.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-indigo-600" /> : <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Lifecycle State</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right no-print">Intelligence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sortedReports.map((report) => {
                      const intern = getInternInfo(report.internId);
                      const isExpanded = expandedReportId === report.id;

                      return (
                        <Fragment key={report.id}>
                          <tr className={`group transition-all duration-300 hover:bg-gray-50/30 ${isExpanded ? 'bg-indigo-50/20' : ''}`}>
                            <td className="px-8 py-4 min-w-[250px]">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 border-4 border-white flex items-center justify-center text-white font-bold shadow-xl group-hover:rotate-6 transition-all duration-300">
                                  {intern.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors text-base tracking-tight">{intern.name}</span>
                                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{intern.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-4">
                              <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.15em] border border-indigo-100">
                                {intern.department}
                              </span>
                            </td>
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-2.5 text-sm font-bold text-gray-700">
                                <Calendar className="w-4 h-4 text-indigo-400" />
                                <span>{formatDate(report.date)}</span>
                              </div>
                            </td>
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-400" />
                                <span className="text-sm font-black text-indigo-600">
                                  {report.hoursWorked}h
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-4 text-center">
                              <span className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                  report.mentorFeedback ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                }`}>
                                {report.mentorFeedback ? "Verified" : "Pending Intel"}
                              </span>
                            </td>
                            <td className="px-8 py-4 text-right no-print">
                              <button
                                onClick={() => toggleExpand(report.id)}
                                className={`w-10 h-10 inline-flex items-center justify-center rounded-xl transition-all border border-gray-100 active:scale-95 shadow-sm ${
                                    isExpanded ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 hover:rotate-12'
                                  }`}
                              >
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-indigo-50/10">
                              <td colSpan={6} className="px-0 sm:px-8 py-8 animate-in slide-in-from-top-4 fade-in duration-500">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-indigo-500" /> Operational Narrative
                                      </h4>
                                    </div>
                                    <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[140px] relative overflow-hidden group/card hover:shadow-md transition-shadow">
                                      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 opacity-20" />
                                      <p className="text-sm text-gray-600 leading-relaxed font-medium relative z-10">
                                        "{report.workDescription || "No detailed logs synthesized."}"
                                      </p>
                                      <Search className="absolute -bottom-4 -right-4 w-24 h-24 text-gray-50 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 -rotate-12" />
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-emerald-500" /> Command Assessment
                                      </h4>
                                    </div>
                                    <div className={`p-8 rounded-[2.5rem] border min-h-[140px] relative overflow-hidden group/feedback hover:shadow-md transition-shadow ${
                                        report.mentorFeedback ? "bg-emerald-50/30 border-emerald-100" : "bg-amber-50/30 border-amber-100"
                                      }`}>
                                      <div className={`absolute top-0 left-0 w-1.5 h-full opacity-30 ${report.mentorFeedback ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                      <p className="text-sm text-gray-700 leading-relaxed font-bold relative z-10">
                                        {report.mentorFeedback || "Waiting for mentor session authentication."}
                                      </p>
                                      <CheckCircle2 className={`absolute -bottom-4 -right-4 w-24 h-24 opacity-0 group-hover/feedback:opacity-100 transition-opacity duration-700 -rotate-12 ${
                                          report.mentorFeedback ? 'text-emerald-100' : 'text-amber-100'
                                        }`} />
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
