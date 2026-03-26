"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { TextArea } from "@/app/components/TextArea";
import { SearchHeader } from "@/app/components/SearchHeader";
import { FilePlus2, Sparkles, Send, ArrowLeft, Clock, Target } from "lucide-react";
import { useAppDispatch } from "@/app/lib/redux/hooks";
import { addSuccess, addError } from "@/app/lib/redux/slices/notificationSlice";

export default function SubmitReportPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    workDescription: "",
    hoursWorked: "8",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
        dispatch(addSuccess({
          title: "Report Transmitted",
          message: "Your daily progress has been recorded successfully."
        }));
        setFormData({
          date: new Date().toISOString().split("T")[0],
          workDescription: "",
          hoursWorked: "8",
        });
        setTimeout(() => router.push("/dashboard/intern/reports"), 1500);
      } else {
        dispatch(addError({
          title: "Submission Failed",
          message: "Failed to record your progress. Please check your connection."
        }));
      }
    } catch (error) {
      dispatch(addError({
        title: "System Error",
        message: "An unexpected disruption occurred during transmission."
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-12">
        <SearchHeader 
          title="Submit Daily Progress" 
          actions={
            <Button 
              variant="secondary" 
              onClick={() => router.back()} 
              className="px-6 border-none text-gray-500 hover:text-indigo-600"
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          }
        >
          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
              <FilePlus2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Contribution Tracking</p>
              <p className="text-xs text-gray-500">Record your achievements and hours for the day.</p>
            </div>
          </div>
        </SearchHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <Card className="shadow-2xl shadow-indigo-500/5 border-gray-100 overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    type="date"
                    label="Reporting Date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    type="number"
                    label="Operational Hours"
                    name="hoursWorked"
                    value={formData.hoursWorked}
                    onChange={handleInputChange}
                    min="1"
                    max="24"
                    required
                    leftIcon={<Clock className="w-4 h-4" />}
                  />
                </div>

                <TextArea
                  label="Work Distribution & Description"
                  name="workDescription"
                  value={formData.workDescription}
                  onChange={handleInputChange}
                  placeholder="Detail your tasks, milestones, and any challenges encountered..."
                  rows={8}
                  required
                />

                <div className="flex justify-end pt-4 border-t border-gray-50">
                  <Button 
                    type="submit" 
                    className="px-10 h-12 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all text-sm font-black uppercase tracking-widest" 
                    disabled={loading}
                    icon={!loading && <Send className="w-4 h-4" />}
                  >
                    {loading ? "Transmitting..." : "Initialize Submission"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Submission Guide" className="bg-indigo-50/30 border-indigo-100/50">
              <div className="p-2 space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-1">Quality Standards</h4>
                    <p className="text-[11px] text-indigo-700/70 leading-relaxed font-medium">
                      Ensure your description is granular. Mention specific modules, bugs resolved, or research findings.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Checklist</p>
                  <ul className="space-y-2.5">
                    {[
                      "Task milestones achieved",
                      "Challenges encountered",
                      "Key learning outcomes",
                      "Total active hours"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-xs text-gray-600 font-bold group hover:text-indigo-600 transition-colors cursor-default">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 group-hover:scale-125 transition-transform" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            <div className="p-6 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center text-center space-y-3">
               <div className="p-3 bg-gray-50 rounded-2xl">
                 <Target className="w-5 h-5 text-gray-400" />
               </div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                 Your reports are directly reviewed by your assigned supervisor for weekly evaluation.
               </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
