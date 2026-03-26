"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";

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

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">View Reports</h1>

        {loading ? (
          <p>Loading reports...</p>
        ) : reports.length === 0 ? (
          <Card>
            <p className="text-gray-600">No reports submitted yet.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <Card key={report.id}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {interns.get(report.internId)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(report.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {report.hoursWorked} hours
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Work Description
                  </h4>
                  <p className="text-sm text-gray-600">{report.workDescription}</p>
                </div>

                {report.mentorFeedback && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                    <h4 className="text-sm font-medium text-green-800 mb-1">
                      Your Feedback
                    </h4>
                    <p className="text-sm text-green-700">{report.mentorFeedback}</p>
                  </div>
                )}

                {!report.mentorFeedback && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Feedback
                    </label>
                    <textarea
                      value={feedbackData[report.id] || ""}
                      onChange={(e) =>
                        handleFeedbackChange(report.id, e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Provide constructive feedback..."
                    />
                    <Button
                      onClick={() => handleSubmitFeedback(report.id)}
                      className="mt-2"
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
    </DashboardLayout>
  );
}
