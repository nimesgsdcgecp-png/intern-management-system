"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/Card";

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

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">My Reports</h1>

        {loading ? (
          <p>Loading reports...</p>
        ) : reports.length === 0 ? (
          <Card>
            <p className="text-gray-600">
              No reports submitted yet.{" "}
              <a href="/dashboard/intern/submit-report" className="text-blue-600 hover:underline">
                Submit your first report
              </a>
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <Card key={report.id}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Report for {report.date}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Submitted: {new Date(report.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                    {report.hoursWorked} hours
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Work Description
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {report.workDescription}
                  </p>
                </div>

                {report.mentorFeedback ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded">
                    <h4 className="text-sm font-medium text-green-800 mb-2">
                      Mentor Feedback
                    </h4>
                    <p className="text-sm text-green-700">
                      {report.mentorFeedback}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-700">
                      ⏳ Pending mentor feedback...
                    </p>
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
