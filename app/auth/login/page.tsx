"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/Button";
import { Card } from "@/app/components/Card";
import { useAppDispatch } from "@/app/lib/redux/hooks";
import { addSuccess, addError } from "@/app/lib/redux/slices/notificationSlice";
import { Info, ArrowRight, ShieldCheck, Zap, Lock, Mail, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

  const router = useRouter();
  const dispatch = useAppDispatch();

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!identifier) {
      newErrors.identifier = "Required";
    } else if (identifier.includes("@") && !/\S+@\S+\.\S+/.test(identifier)) {
      newErrors.identifier = "Invalid email";
    }

    if (!password) {
      newErrors.password = "Required";
    } else if (password.length < 6) {
      newErrors.password = "Min 6 chars";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        dispatch(addError({
          title: "Login Failed",
          message: "Invalid credentials."
        }));
        setErrors({ identifier: " ", password: "Invalid credentials" });
      } else {
        dispatch(addSuccess({
          title: "Success",
          message: "Welcome back."
        }));
        router.push("/dashboard");
      }
    } catch (err) {
      dispatch(addError({
        title: "Error",
        message: "An unexpected error occurred."
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
              {/* Branding */}
              <div className="flex flex-col items-center mb-10">
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase text-center mb-2 italic">
                  Sign <span className="text-indigo-600">In</span>
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center italic opacity-60">
                   Secure Management Portal
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block italic opacity-70">Email Address</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="you@example.com"
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value);
                          if (errors.identifier) setErrors(prev => ({ ...prev, identifier: undefined }));
                        }}
                        className={`w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold tracking-tight focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all ${errors.identifier ? 'border-rose-500' : ''}`}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block italic opacity-70">Password</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                        }}
                        className={`w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold tracking-tight focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all ${errors.password ? 'border-rose-500' : ''}`}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                   <button
                        type="button"
                        onClick={() => router.push('/auth/forgot-password')}
                        className="text-[9px] text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-widest italic"
                      >
                        Forgot Password?
                   </button>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-linear-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4 italic"
                  disabled={loading}
                >
                  <span>{loading ? "Signing in..." : "Sign In"}</span>
                  {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                </Button>
              </form>

              <div className="mt-12 pt-8 border-t border-slate-100">
                  <div className="flex items-center justify-center gap-4 text-center">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Demo Credentials</p>
                      <p className="text-[10px] font-bold text-slate-600">admin@internship.com / admin123</p>
                    </div>
                  </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-12 italic">
          © {new Date().getFullYear()} Intern Hub — Secure Portal
        </p>
      </div>
    </div>
  );
}
