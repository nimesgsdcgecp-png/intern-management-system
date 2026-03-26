"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { Card } from "@/app/components/Card";
import { useAppDispatch } from "@/app/lib/redux/hooks";
import { addSuccess, addError } from "@/app/lib/redux/slices/notificationSlice";
import { Info, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        dispatch(addError({
          title: "Login Failed",
          message: "Invalid credentials. Please try again."
        }));
      } else {
        dispatch(addSuccess({
          title: "Success",
          message: "Welcome back! Redirecting..."
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 overflow-hidden">
      <div className="w-full max-w-sm space-y-6 animate-in fade-in duration-500">
        <Card className="rounded-2xl border-gray-200 shadow-sm bg-white overflow-hidden p-1">
          <div className="p-6 space-y-6">
            <div className="text-center pt-2">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight text-center">Login</h2>
              <p className="text-xs text-gray-500 mt-1">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                label="Identifier"
                placeholder="Email or User ID"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />

              <div className="space-y-1">
                <Input
                  type="password"
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => router.push('/auth/forgot-password')}
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 active:scale-95 transition-all text-xs font-bold uppercase tracking-widest"
                disabled={loading}
                icon={!loading && <ArrowRight className="w-4 h-4" />}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </div>

          <div className="bg-gray-50/50 p-5 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-3 h-3 text-gray-400" />
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Demo Access</p>
            </div>
            <div className="space-y-1 text-[10px] text-gray-500">
                <div className="flex justify-between">
                   <span>Admin:</span>
                   <span className="font-mono font-bold text-gray-700">admin@internship.com / admin123</span>
                </div>
            </div>
          </div>
        </Card>

        <p className="text-center text-[10px] text-gray-400 font-medium">Intern Management System</p>
      </div>
    </div>
  );
}
