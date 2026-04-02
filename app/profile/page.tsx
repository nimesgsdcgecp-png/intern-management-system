"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Card } from "@/app/components/ui/Card";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { useAppDispatch } from "@/app/lib/redux/hooks";
import { addSuccess, addError } from "@/app/lib/redux/slices/notificationSlice";
import { User, Mail, ShieldCheck, Key, Building2, UserCircle, Save, Loader2, Sparkles, Activity } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Email update state
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  /**
   * Effect: Profile Update
   * Ensures the UI reflects the latest account state.
   * Redirects if not logged in.
   */
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    fetchProfile();
  }, [session, status, router]);

  /**
   * Logic: Get Profile
   * Gets user details from the server.
   */
  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();

      if (res.ok) {
        setProfile(data.user);
        setEmail(data.user.email);
      } else {
        dispatch(addError({
          title: "Profile Error",
          message: data.error || "Failed to fetch profile"
        }));
      }
    } catch (err) {
      dispatch(addError({
        title: "Network Error",
        message: "Failed to connect to server"
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_email",
          email,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        dispatch(addSuccess({
          title: "Email Updated",
          message: "Your email address has been updated successfully"
        }));
        setProfile(prev => prev ? { ...prev, email } : null);
      } else {
        setEmailError(data.error || "Failed to update email");
        dispatch(addError({
          title: "Update Failed",
          message: data.error || "Failed to update email"
        }));
      }
    } catch (err) {
      dispatch(addError({
        title: "Network Error",
        message: "Failed to connect to server"
      }));
    } finally {
      setEmailLoading(false);
    }
  };

  /**
   * Logic: Change Password
   * Updates your password on the server.
   */
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof passwordFieldErrors = {};

    if (!currentPassword) newErrors.current = "Current password is required";
    if (!newPassword) newErrors.new = "New password is required";
    else {
      const requirements = validatePassword(newPassword);
      if (requirements.length > 0) {
        newErrors.new = `Missing: ${requirements.join(", ")}`;
      }
    }
    if (newPassword !== confirmPassword) newErrors.confirm = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setPasswordFieldErrors(newErrors);
      return;
    }

    setPasswordLoading(true);
    setPasswordFieldErrors({});

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_password",
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        dispatch(addSuccess({
          title: "Password Changed",
          message: "Your password has been updated successfully"
        }));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        dispatch(addError({
          title: "Password Change Failed",
          message: data.error || "Failed to change password"
        }));
        if (data.error?.toLowerCase().includes("current")) {
          setPasswordFieldErrors({ current: "Incorrect current password" });
        }
      }
    } catch (err) {
      dispatch(addError({
        title: "Network Error",
        message: "Failed to connect to server"
      }));
    } finally {
      setPasswordLoading(false);
    }
  };

  const validatePassword = (pwd: string) => {
    const errors = [];
    if (pwd.length < 8) errors.push("at least 8 characters");
    if (!/(?=.*[a-z])/.test(pwd)) errors.push("one lowercase letter");
    if (!/(?=.*[A-Z])/.test(pwd)) errors.push("one uppercase letter");
    if (!/(?=.*\d)/.test(pwd)) errors.push("one number");
    return errors;
  };

  const requirements = validatePassword(newPassword);
  const passwordsMatch = newPassword === confirmPassword;

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Failed to load profile</div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-2 h-12 bg-indigo-600 rounded-full" />
            <div>
              <h1 className="text-4xl font-extrabold dm-text tracking-tight">
                Profile <span className="text-indigo-600">Settings</span>
              </h1>
              <p className="dm-text-muted mt-1 font-medium">Manage your profile and security.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-2xl text-xs font-bold flex items-center gap-2 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
              <ShieldCheck className="w-4 h-4" />
              Verified Account
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-10">
            {/* Identity Profile */}
            <Card className="overflow-hidden border-none shadow-2xl rounded-[2.5rem]">
              <div className="p-10 bg-linear-to-br from-indigo-600 to-indigo-900 text-white relative">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center relative group overflow-hidden">
                    <User className="w-12 h-12 text-white" />
                    <div className="absolute inset-0 bg-indigo-500/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Sparkles className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Member Since 2024</p>
                    <h4 className="text-3xl font-black mb-4 tracking-tight">{profile.name}</h4>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 backdrop-blur-sm truncate">
                        ID: {profile.id}
                      </span>
                      <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30 backdrop-blur-sm">
                        {profile.role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                  <UserCircle className="w-48 h-48" />
                </div>
              </div>
              <div className="p-10 space-y-10 dm-elevated">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black dm-text-muted uppercase tracking-widest flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-500" /> Department
                    </h3>
                    <div className="dm-sunken rounded-2xl p-6 border dm-border">
                      <p className="text-[10px] font-black dm-text-muted uppercase tracking-widest mb-1">Department</p>
                      <p className="text-lg font-bold dm-text">{profile.department || "Organization Wide"}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-xs font-black dm-text-muted uppercase tracking-widest flex items-center gap-2">
                      <Mail className="w-4 h-4 text-indigo-500" /> Contact Email
                    </h3>
                    <div className="dm-sunken rounded-2xl p-6 border dm-border">
                      <p className="text-[10px] font-black dm-text-muted uppercase tracking-widest mb-1">Primary Email</p>
                      <p className="text-lg font-bold dm-text">{profile.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Change Password */}
            <div className="space-y-6">
              <h2 className="text-xl font-black dm-text uppercase tracking-wider">Change Password</h2>
              <Card className="rounded-[2.5rem] p-10 border dm-border shadow-2xl">
                <form onSubmit={handlePasswordChange} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Input
                      type="password"
                      label="Current Password"
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        if (passwordFieldErrors.current) setPasswordFieldErrors(prev => ({ ...prev, current: undefined }));
                      }}
                      error={passwordFieldErrors.current}
                      required
                      disabled={passwordLoading}
                    />
                    <Input
                      type="password"
                      label="New Password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (passwordFieldErrors.new) setPasswordFieldErrors(prev => ({ ...prev, new: undefined }));
                      }}
                      error={passwordFieldErrors.new}
                      required
                      disabled={passwordLoading}
                    />
                    <Input
                      type="password"
                      label="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (passwordFieldErrors.confirm) setPasswordFieldErrors(prev => ({ ...prev, confirm: undefined }));
                      }}
                      error={passwordFieldErrors.confirm}
                      required
                      disabled={passwordLoading}
                    />
                  </div>

                  {newPassword && (
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border dm-border">
                      <p className="text-[10px] font-black dm-text-muted uppercase tracking-widest mb-4">Password Strength</p>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-4">
                          {requirements.map((error: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 px-3 py-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 text-[10px] font-bold rounded-full border border-rose-100 dark:border-rose-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                              Missing: {error}
                            </div>
                          ))}
                          {requirements.length === 0 && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100 dark:border-emerald-500/20">
                              <ShieldCheck className="w-3 h-3" />
                              Complexity Verified
                            </div>
                          )}
                          {confirmPassword && (
                            <div className={`flex items-center gap-2 px-3 py-1 text-[10px] font-bold rounded-full border ${passwordsMatch ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 border-rose-100 dark:border-rose-500/20"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${passwordsMatch ? "bg-emerald-600" : "bg-rose-600"}`} />
                              {passwordsMatch ? "Passwords match" : "Passwords don't match"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full md:w-auto px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20"
                    disabled={
                      passwordLoading ||
                      !currentPassword ||
                      !newPassword ||
                      !confirmPassword ||
                      requirements.length > 0 ||
                      !passwordsMatch
                    }
                  >
                    {passwordLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Key className="w-4 h-4" />
                    )}
                    {passwordLoading ? "Saving..." : "Update Password"}
                  </Button>
                </form>
              </Card>
            </div>
          </div>

          <div className="space-y-10">
            {/* Update Email */}
            <div className="space-y-6">
              <h2 className="text-xl font-black dm-text uppercase tracking-wider">Email Settings</h2>
              <Card className="rounded-[2.5rem] p-8 border dm-border shadow-2xl">
                <form onSubmit={handleEmailUpdate} className="space-y-6">
                  <Input
                    type="email"
                    label="Your Email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    error={emailError}
                    required
                    disabled={emailLoading}
                  />

                  <Button
                    type="submit"
                    variant="secondary"
                    className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                    disabled={emailLoading || email === profile.email}
                  >
                    {emailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {emailLoading ? "Saving..." : "Update Email"}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Quick Status Card */}
            <div className="bg-linear-to-br from-indigo-600 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Activity className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <h3 className="font-extrabold text-2xl tracking-tighter mb-4">Status</h3>
                <p className="text-xs font-medium opacity-70 leading-relaxed mb-6">
                  Profile updates are saved across the system instantly.
                </p>
                <div className="w-full py-3 bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border border-white/10 backdrop-blur-sm">
                  Status: Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}