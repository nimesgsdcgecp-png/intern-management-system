"use client";

import { useEffect, useState, Fragment } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/Card";
import { StatsGrid } from "@/app/components/StatsGrid";
import { SearchHeader } from "@/app/components/SearchHeader";
import { Input } from "@/app/components/Input";
import { Select } from "@/app/components/Select";
import { Button } from "@/app/components/Button";
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

  // Filter reports based on current filters
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
        <SearchHeader title="Report Analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-2 items-end">
            <Input
              label="Search Intern"
              placeholder="Ex: John Doe"
              value={filters.internName}
              onChange={(e) => setFilters({ ...filters, internName: e.target.value })}
              compact
            />
            <Select
              label="Department Filter"
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              compact
            >
              <option value="">All Streams</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>

            <Select
              label="Review Status"
              value={filters.feedbackStatus}
              onChange={(e) => setFilters({ ...filters, feedbackStatus: e.target.value as any })}
              compact
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Feedback</option>
              <option value="reviewed">Reviewed</option>
            </Select>
            <Input
              label="From Date"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              compact
            />
          </div>
        </SearchHeader>

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
            <Card className="overflow-hidden border-gray-200 shadow-xl rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">ID</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Intern</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Department</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Report Date</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Hours</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Feedback</th>
                      <th className="px-8 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-widest sticky right-0 bg-gray-50/80 backdrop-blur-sm shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)] min-w-[150px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredReports.map((report) => {
                      const intern = getInternInfo(report.internId);
                      const isExpanded = expandedReportId === report.id;

                      return (
                        <Fragment key={report.id}>
                          <tr className="group hover:bg-blue-50/30 transition-all duration-200">
                            {/* ID */}
                            <td className="px-8 py-6">
                              <code className="text-[10px] font-mono font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md" title={report.id}>
                                {report.id.split("-")[0].toUpperCase()}
                              </code>
                            </td>

                            {/* Intern */}
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                  <Users className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors uppercase tracking-tight">
                                    {intern.name}
                                  </span>
                                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                    <Mail className="w-3 h-3" /> {intern.email}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Department */}
                            <td className="px-8 py-6">
                              <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider border border-indigo-100">
                                {intern.department}
                              </span>
                            </td>

                            {/* Report Date */}
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2 text-gray-700">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{formatDate(report.date)}</span>
                              </div>
                            </td>

                            {/* Hours */}
                            <td className="px-8 py-6">
                              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                {report.hoursWorked}h
                              </span>
                            </td>

                            {/* Feedback Status */}
                            <td className="px-8 py-6">
                              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                report.mentorFeedback
                                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-100 text-amber-700 border border-amber-200"
                              }`}>
                                {report.mentorFeedback ? "Reviewed" : "Pending"}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-8 py-6 sticky right-0 bg-white/60 group-hover:bg-blue-50/60 backdrop-blur-md shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)] transition-all">
                              <div className="flex items-center justify-center">
                                <button
                                  onClick={() => toggleExpand(report.id)}
                                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-blue-600 hover:text-white transition-all duration-300 font-bold text-xs shadow-sm"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>{isExpanded ? "Hide" : "View"}</span>
                                  {isExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expandable Details Row */}
                          {isExpanded && (
                            <tr key={`${report.id}-details`} className="bg-gray-50/50">
                              <td colSpan={7} className="px-8 py-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* Work Description */}
                                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <FileText className="w-4 h-4" /> Work Description
                                    </h4>
                                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                      {report.workDescription || "No description provided."}
                                    </p>
                                  </div>

                                  {/* Mentor Feedback */}
                                  <div className={`rounded-xl p-5 border shadow-sm ${
                                    report.mentorFeedback
                                      ? "bg-emerald-50/50 border-emerald-200"
                                      : "bg-amber-50/50 border-amber-200"
                                  }`}>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                      {report.mentorFeedback ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                      ) : (
                                        <AlertCircle className="w-4 h-4 text-amber-600" />
                                      )}
                                      Mentor Feedback
                                    </h4>
                                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                      {report.mentorFeedback || "Awaiting mentor review."}
                                    </p>
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
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
