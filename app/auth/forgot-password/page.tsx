"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { useAppDispatch } from "@/app/lib/redux/hooks";
import { addSuccess, addError } from "@/app/lib/redux/slices/notificationSlice";
import { Mail, ArrowLeft, Send, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        dispatch(addSuccess({
          title: "Code Sent",
          message: "Check your email."
        }));
        setTimeout(() => {
          router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
        }, 1200);
      } else {
        dispatch(addSuccess({
          title: "Request Sent",
          message: "Check your email if account exists."
        }));
        setTimeout(() => {
          router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
        }, 1200);
      }
    } catch (error) {
      dispatch(addError({
        title: "Error",
        message: "Failed to send reset code."
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50 p-4 relative font-sans">
      <div className="w-full max-w-lg relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <Card className="rounded-4xl p-0 border border-slate-200 shadow-sm overflow-hidden bg-white">
            <div className="p-10 md:p-14">
               <div className="flex flex-col items-center mb-10">
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase text-center mb-2">
                  Reset <span className="text-indigo-600">Password</span>
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center opacity-60">
                   Recover your account access
                </p>
              </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                   <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block opacity-70">Email Address</label>
                       <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <Mail className="w-4 h-4" />
                          </div>
                          <input
                              type="email"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold tracking-tight focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                              required
                          />
                       </div>
                  </div>

                  <div className="space-y-4">
                      <Button
                        type="submit"
                        disabled={loading || !email}
                        className="w-full h-12 bg-linear-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                       >
                        <span>{loading ? "Sending..." : "Send Reset Code"}</span>
                        {!loading && <Send className="w-3.5 h-3.5" />}
                      </Button>

                      <button
                        type="button"
                        onClick={() => router.push('/auth/login')}
                        className="w-full py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center justify-center gap-3"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                      </button>
                  </div>
                </form>
             </div>
          </Card>
        </motion.div>

        <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-12 opacity-50">
           Internship Management System — Secure Management
        </p>
      </div>
    </div>
  );
}