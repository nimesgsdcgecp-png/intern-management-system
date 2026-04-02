"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { CheckCircle2, Eye, EyeOff, ArrowRight, ShieldCheck, Zap, Lock, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/auth/forgot-password');
    }
  }, [token, router]);

  const validatePassword = (pwd: string) => {
    const requirements = [
      { id: 1, label: "8+ chars", valid: pwd.length >= 8 },
      { id: 2, label: "Lowercase", valid: /(?=.*[a-z])/.test(pwd) },
      { id: 3, label: "Uppercase", valid: /(?=.*[A-Z])/.test(pwd) },
      { id: 4, label: "Number", valid: /(?=.*\d)/.test(pwd) },
    ];
    return requirements;
  };

  const requirements = validatePassword(password);
  const isPasswordValid = requirements.every(req => req.valid);
  const isConfirmPasswordValid = confirmPassword && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid || !isConfirmPasswordValid) {
      setError("Please check requirements.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset.');
      }
    } catch (error) {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="w-full max-w-lg relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="rounded-4xl p-12 text-center border border-slate-200 shadow-sm bg-white">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">Password <span className="text-emerald-600">Updated</span></h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">
                Redirecting to login...
              </p>
              <div className="w-8 h-8 border-4 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50 p-4 relative font-sans">
      <div className="w-full max-w-lg relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-4xl p-0 border border-slate-200 shadow-sm overflow-hidden bg-white">
            <div className="p-10 md:p-14">
              <div className="flex flex-col items-center mb-10">
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase text-center mb-2">
                  New <span className="text-indigo-600">Password</span>
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center opacity-60">
                  Secure Account Update
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                  <div className="space-y-2 relative">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block opacity-70">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-12 pl-12 pr-12 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        required
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {requirements.map(req => (
                        <div key={req.id} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                          {req.valid ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <ShieldAlert className="w-3 h-3 text-slate-200" />
                          )}
                          <span className={`text-[8px] font-black uppercase tracking-widest ${req.valid ? "text-slate-900" : "text-slate-300"}`}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block opacity-70">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        required
                      />
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest text-center">{error}</p>
                )}

                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={loading || !isPasswordValid || !isConfirmPasswordValid}
                    className="w-full h-12 bg-linear-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                  >
                    <span>{loading ? "Updating..." : "Update Password"}</span>
                    {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </motion.div>

        <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-12">
          © {new Date().getFullYear()} Internship Management System — 
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
