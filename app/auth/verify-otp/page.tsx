"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { Timer, ArrowLeft, RefreshCw } from "lucide-react";

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
        setError(data.error || 'Invalid code. Please check your email.');
      }
    } catch (error) {
      setError('Verification failed. Try again.');
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
        setError(data.error || 'Failed to resend code.');
      }
    } catch (error) {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 overflow-hidden">
      <div className="w-full max-w-sm space-y-6 animate-in fade-in duration-500">
        <Card className="rounded-2xl border-gray-200 shadow-sm bg-white p-1">
          <div className="p-6 space-y-6">
            <div className="text-center pt-2">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Verify Code</h2>
              <p className="text-[10px] text-gray-500 mt-1 max-w-55 mx-auto">
                We sent a 6-digit code to <span className="font-bold text-gray-900">{email}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4 text-center">
                {error && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{error}</p>}
                
                <Input
                  label="Enter Code"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  required
                  autoComplete="one-time-code"
                  className="text-center text-4xl font-extrabold tracking-[0.2em] h-16 border-gray-100 placeholder:text-gray-100"
                  maxLength={6}
                />
                
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <Timer className={`w-3 h-3 ${timeLeft < 60 ? "text-red-400" : ""}`} />
                    <span>{timeLeft > 0 ? `Expires in: ${formatTime(timeLeft)}` : "Expired"}</span>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6 || timeLeft === 0}
                  className="w-full h-11 active:scale-95 transition-all font-bold uppercase tracking-widest text-xs"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => router.push('/auth/forgot-password')}
                    className="w-full text-[10px] text-gray-400 hover:text-gray-600 font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors duration-300"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Back to Login
                  </button>
                  {timeLeft === 0 && (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="w-full text-[10px] text-blue-600 hover:text-blue-700 font-black uppercase tracking-widest flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                      Resend Code
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div></div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}