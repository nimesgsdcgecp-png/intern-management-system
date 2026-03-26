"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { useAppDispatch } from "@/app/lib/redux/hooks";
import { addSuccess, addError } from "@/app/lib/redux/slices/notificationSlice";
import { Mail, ArrowLeft, Send } from "lucide-react";

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
          message: "A verification code has been sent to your email."
        }));
        setTimeout(() => {
          router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
        }, 1200);
      } else {
        dispatch(addSuccess({
          title: "Request Sent",
          message: "Check your email for instructions if account exists."
        }));
        setTimeout(() => {
          router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
        }, 1200);
      }
    } catch (error) {
      dispatch(addError({
        title: "Error",
        message: "Failed to send reset code. Try again later."
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 overflow-hidden">
      <div className="w-full max-w-sm space-y-6 animate-in fade-in duration-500">
        <Card className="rounded-2xl border-gray-200 shadow-sm bg-white p-1">
          <div className="p-6 space-y-6">
            <div className="text-center pt-2">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Reset Password</h2>
              <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">Enter your email to receive a recovery code</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-3">
                 <Input
                   label="Email Address"
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="you@email.com"
                   required
                   autoComplete="email"
                 />
                 <div className="flex items-center gap-2 px-1 text-[10px] text-gray-400 font-medium">
                    <Mail className="w-3 h-3" />
                    <span>A 6-digit code will be sent to this email</span>
                 </div>
               </div>

               <div className="space-y-4 pt-2">
                  <Button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full h-11 active:scale-95 transition-all font-bold uppercase tracking-widest text-xs"
                    icon={!loading && <Send className="w-3 h-3" />}
                  >
                    {loading ? "Sending..." : "Send Reset Code"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => router.push('/auth/login')}
                    className="w-full text-[10px] text-gray-400 hover:text-gray-600 font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-3 h-3" />
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