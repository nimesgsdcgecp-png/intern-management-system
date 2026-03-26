"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { CheckCircle2, XCircle, Eye, EyeOff, ArrowRight } from "lucide-react";

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
      { id: 1, label: "8+ characters", valid: pwd.length >= 8 },
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
      setError("Please ensure security requirements are met.");
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
        setError(data.error || 'Reset failed. Token might be expired.');
      }
    } catch (error) {
      setError('System error during reset.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-sm animate-in zoom-in-95 duration-500">
          <Card className="text-center p-8 rounded-2xl shadow-sm border-gray-100 bg-white">
            <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Success!</h2>
            <p className="text-gray-500 text-xs mb-8">
              Your password has been updated. You will be redirected to the login page shortly.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 overflow-hidden">
      <div className="w-full max-w-sm space-y-6 animate-in fade-in duration-500">
        <Card className="rounded-2xl border-gray-200 shadow-sm bg-white p-1 overflow-hidden">
          <div className="p-6 space-y-6">
            <div className="text-center pt-2">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Setup New Password</h2>
              <p className="text-xs text-gray-500 mt-1 max-w-50 mx-auto">Create a secure password for your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                 <div className="space-y-3">
                   <div className="relative">
                      <Input
                        label="New Password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-8.75 text-gray-300 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                   </div>

                   <div className="grid grid-cols-2 gap-y-1 gap-x-2 px-1">
                      {requirements.map(req => (
                        <div key={req.id} className="flex items-center gap-1.5">
                          {req.valid ? (
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                          ) : (
                            <XCircle className="w-2.5 h-2.5 text-gray-200" />
                          )}
                          <span className={`text-[9px] font-bold uppercase tracking-tight ${req.valid ? "text-emerald-700" : "text-gray-400"}`}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                   </div>
                 </div>

                 <div className="space-y-2">
                   <Input
                      label="Confirm Password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                   />
                   {confirmPassword && (
                    <div className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${
                      password === confirmPassword ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-600"
                    }`}>
                      {password === confirmPassword ? "Match" : "Mismatch"}
                    </div>
                   )}
                 </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <Button
                  type="submit"
                  disabled={loading || !isPasswordValid || !isConfirmPasswordValid}
                  className="w-full h-11 active:scale-95 transition-all font-bold uppercase tracking-widest text-xs"
                  icon={!loading && <ArrowRight className="w-4 h-4" />}
                >
                  {loading ? "Processing..." : "Reset Password"}
                </Button>

                <button
                  type="button"
                  onClick={() => router.push('/auth/login')}
                  className="w-full text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}