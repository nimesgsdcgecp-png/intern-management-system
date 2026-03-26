"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { Select } from "@/app/components/Select";
import { TextArea } from "@/app/components/TextArea";
import { SearchHeader } from "@/app/components/SearchHeader";
import { FileText, Clock, MessageSquare, Target } from "lucide-react";

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
  const [filters, setFilters] = useState({ internName: "", feedbackStatus: "" });

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

    fetchData();
  }, [session]);

  const handleFeedbackChange = (reportId: string, feedback: string) => {
    setFeedbackData({
      ...feedbackData,
      [reportId]: feedback,
    });
  };

  const handleSubmitFeedback = async (reportId: string) => {
    const feedback = feedbackData[reportId]?.trim();

    if (!feedback) {
      alert("Please enter feedback before submitting.");
      return;
    }

    setSubmittingFeedback(prev => ({ ...prev, [reportId]: true }));

    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorFeedback: feedback,
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
      } else {
        // Handle API error response
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("API Error:", errorData);
        alert(`Failed to submit feedback: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      alert("Failed to submit feedback. Please check your connection and try again.");
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

  return (
    <DashboardLayout>
      <div className="w-full">
        <SearchHeader title="View Reports">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2 items-end">
            <Input
              label="Search by Intern"
              placeholder="Ex: John Doe"
              value={filters.internName}
              onChange={(e) => setFilters({ ...filters, internName: e.target.value })}
              compact
            />
            <Select
              label="Review Status"
              value={filters.feedbackStatus}
              onChange={(e) => setFilters({ ...filters, feedbackStatus: e.target.value })}
              compact
            >
              <option value="">All Reports</option>
              <option value="pending">Pending Feedback</option>
              <option value="reviewed">Reviewed</option>
            </Select>
          </div>
        </SearchHeader>

        <div className="space-y-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
              <div className="premium-spinner mb-6"></div>
              <p className="text-sm font-bold uppercase tracking-widest">Synchronizing Reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <Card className="text-center py-24 border-dashed border-2 border-gray-200 bg-gray-50/30">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-500 max-w-sm mx-auto">No reports match your filters or have been submitted yet.</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-all duration-200 border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {interns.get(report.internId)}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(report.submittedAt).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1.5 border border-blue-100">
                      <Clock className="w-3.5 h-3.5" /> {report.hoursWorked} hrs
                    </span>
                  </div>

                  <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Work Description
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{report.workDescription}</p>
                  </div>

                  {report.mentorFeedback && (
                    <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> Your Feedback
                      </h4>
                      <p className="text-sm text-emerald-800">{report.mentorFeedback}</p>
                    </div>
                  )}

                  {!report.mentorFeedback && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <TextArea
                        label="Evaluation Feedback"
                        value={feedbackData[report.id] || ""}
                        onChange={(e) =>
                          handleFeedbackChange(report.id, e.target.value)
                        }
                        rows={3}
                        placeholder="Provide constructive feedback for the intern..."
                      />
                      <Button
                        onClick={() => handleSubmitFeedback(report.id)}
                        className="mt-3"
                        disabled={submittingFeedback[report.id] || !feedbackData[report.id]?.trim()}
                      >
                        {submittingFeedback[report.id] ? "Submitting..." : "Submit Feedback"}
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
