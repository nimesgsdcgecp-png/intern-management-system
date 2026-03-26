"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";

export default function SubmitReportPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    workDescription: "",
    hoursWorked: "8",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.date,
          workDescription: formData.workDescription,
          hoursWorked: parseInt(formData.hoursWorked),
        }),
      });

      if (res.ok) {
        setMessage("Report submitted successfully!");
        setFormData({
          date: new Date().toISOString().split("T")[0],
          workDescription: "",
          hoursWorked: "8",
        });
        setTimeout(() => router.push("/dashboard/intern/reports"), 2000);
      } else {
        setMessage("Failed to submit report. Please try again.");
      }
    } catch (error) {
      console.error("Failed to submit report:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Submit Daily Report</h1>

        <Card>
          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.includes("successfully")
                  ? "bg-green-100 border border-green-400 text-green-700"
                  : "bg-red-100 border border-red-400 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="date"
              label="Report Date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Description
              </label>
              <textarea
                name="workDescription"
                value={formData.workDescription}
                onChange={handleInputChange}
                placeholder="Describe what you worked on today..."
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                required
              />
            </div>

            <Input
              type="number"
              label="Hours Worked"
              name="hoursWorked"
              value={formData.hoursWorked}
              onChange={handleInputChange}
              min="0"
              max="24"
              required
            />

            <div className="bg-blue-50 border border-blue-200 p-4 rounded text-sm text-blue-800">
              <p className="font-medium mb-2">Tips for a good report:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Be specific about tasks completed</li>
                <li>Mention any challenges encountered</li>
                <li>Include learning outcomes</li>
                <li>Be honest about hours worked</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
