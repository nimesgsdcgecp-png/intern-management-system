"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { TextArea } from "@/app/components/TextArea";
import { SearchHeader } from "@/app/components/SearchHeader";
import { FilePlus2, Sparkles, Send, ArrowLeft, Clock, Target, CheckCircle2, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { useAppDispatch } from "@/app/lib/redux/hooks";
import { addSuccess, addError } from "@/app/lib/redux/slices/notificationSlice";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

export default function SubmitReportPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    workDescription: "",
    hoursWorked: "8",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date) newErrors.date = "Date is required";
    
    const hours = parseInt(formData.hoursWorked);
    if (isNaN(hours) || hours < 1 || hours > 24) {
      newErrors.hoursWorked = "Hours must be between 1 and 24";
    }

    if (!formData.workDescription.trim()) {
      newErrors.workDescription = "Description is required";
    } else if (formData.workDescription.trim().length < 20) {
      newErrors.workDescription = "Please provide a more detailed description (min 20 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
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
        Swal.fire({
          title: "Report Submitted!",
          text: "Your daily work report has been recorded.",
          icon: "success",
          confirmButtonColor: "#4f46e5",
          timer: 2000,
          customClass: { popup: 'dm-modal rounded-[2rem]' }
        });
        
        setFormData({
          date: new Date().toISOString().split("T")[0],
          workDescription: "",
          hoursWorked: "8",
        });
        setErrors({});
        setTimeout(() => router.push("/dashboard/intern/reports"), 1500);
      } else {
        const data = await res.json();
        Swal.fire("Error", data.error || "Failed to submit report", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Check your internet connection", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="w-2 h-14 bg-indigo-600 rounded-full" />
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight uppercase leading-none">
                Submit <span className="text-indigo-600">Daily Log</span>
              </h1>
              <p className="text-gray-500 mt-2 font-medium italic">Record your work achievements and technical progress.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={() => router.back()}
                className="px-8 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border dm-border hover:text-indigo-600 transition-all flex items-center gap-2"
             >
                <ArrowLeft className="w-4 h-4" />
                Go Back
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
              <div className="bg-gray-50/50 p-8 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-600/10">
                        <FilePlus2 className="w-6 h-6 text-indigo-600" />
                     </div>
                     <div>
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Work Narrative</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Daily progress tracking</p>
                     </div>
                  </div>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Entry Date</label>
                     <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                        required
                     />
                     {errors.date && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-1">{errors.date}</p>}
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Duration</label>
                     <div className="relative">
                        <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                        <input
                           type="number"
                           name="hoursWorked"
                           value={formData.hoursWorked}
                           onChange={handleInputChange}
                           min="1"
                           max="24"
                           required
                           className="w-full h-14 pl-14 pr-6 bg-gray-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                        />
                     </div>
                     {errors.hoursWorked && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-1">{errors.hoursWorked}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Activity Summary</label>
                  <textarea
                    name="workDescription"
                    value={formData.workDescription}
                    onChange={handleInputChange}
                    placeholder="Briefly describe your tasks and accomplishments..."
                    rows={6}
                    required
                    className="w-full p-8 bg-gray-50 border-none rounded-[2.5rem] text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none italic shadow-sm"
                  />
                  {errors.workDescription && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-1">{errors.workDescription}</p>}
                </div>

                <div className="flex justify-end pt-8 border-t border-gray-100">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-12 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {loading ? "Processing..." : "Commit Log"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100/50 overflow-hidden">
              <div className="p-8 border-b border-indigo-100/50 flex items-center gap-4 bg-white/40">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center border border-indigo-600/10 shadow-sm">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Entry Tips</h4>
              </div>
              <div className="p-8 space-y-8">
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-bold italic">
                   Help your mentor understand your work by providing clear and specific details.
                </p>

                <div className="space-y-5">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest opacity-60">Log Checklist</p>
                  <ul className="space-y-4">
                    {[
                      "Daily Achievements",
                      "Technical Challenges",
                      "Learning Outcomes",
                      "Time Distribution"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-[10px] text-slate-700 font-bold uppercase tracking-tight italic">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-40" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-6 bg-white/60 rounded-3xl border border-indigo-100 shadow-sm">
                   <div className="flex items-start gap-4">
                      <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                      <p className="text-[10px] font-bold text-slate-600 leading-relaxed italic">
                        Your mentor will review this log to monitor your technical trajectory.
                      </p>
                   </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-gray-100 p-10 bg-gray-50/30 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                  <Target className="w-6 h-6 text-indigo-600" />
               </div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed italic max-w-[180px]">
                 Consistent entries enable accurate growth assessments.
               </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
