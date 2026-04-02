"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { ShieldCheck, ArrowLeft, CheckCircle2, Timer, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    if (!email) {
      router.push('/auth/forgot-password');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (data.success && data.resetToken) {
        router.push(`/auth/reset-password?token=${data.resetToken}`);
      } else {
        setError(data.error || 'Invalid code.');
      }
    } catch (error) {
      setError('Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setTimeLeft(600);
        setOtp("");
      } else {
        setError(data.error || 'Failed to resend.');
      }
    } catch (error) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

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
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase text-center mb-2 italic">
                  Verify <span className="text-indigo-600">OTP</span>
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center italic opacity-60">
                   Enter the code from your email
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block text-center italic opacity-70">6-Digit Confirmation Code</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className={`w-full h-16 text-center text-3xl font-black tracking-[0.5em] bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:opacity-20`}
                      required
                    />
                  </div>
                  {error && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest text-center italic">{error}</p>}
                  <div className="flex items-center justify-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest italic pt-2">
                    <Timer className={`w-3.5 h-3.5 ${timeLeft < 60 ? "text-rose-500 animate-pulse" : "text-amber-500"}`} />
                    <span>{timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : "Expired"}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    type="submit"
                    disabled={loading || otp.length !== 6 || timeLeft === 0}
                    className="w-full h-12 bg-linear-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4 italic"
                  >
                    <span>{loading ? "Verifying..." : "Verify Code"}</span>
                    {!loading && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </Button>

                  <button
                    type="button"
                    onClick={() => router.push('/auth/login')}
                    className="w-full py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center justify-center gap-3 italic"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-slate-50 p-8 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center justify-center gap-2 mx-auto disabled:opacity-50 italic"
              >
                {loading ? "Resending..." : "Resend Code"}
              </button>
            </div>
          </Card>
        </motion.div>

        <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-12 italic">
          © {new Date().getFullYear()} Intern Hub — Verification
        </p>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white">Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}