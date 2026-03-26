"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { Card } from "@/app/components/Card";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { useAppDispatch } from "@/app/lib/redux/hooks";
import { addSuccess, addError } from "@/app/lib/redux/slices/notificationSlice";

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
  const [emailLoading, setEmailLoading] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    // Redirect admin users
    if ((session.user as any)?.role === "admin") {
      router.push("/dashboard");
      return;
    }

    fetchProfile();
  }, [session, status, router]);

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);

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

  const passwordErrors = validatePassword(newPassword);
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
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Profile Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  User ID
                </label>
                <div className="mt-1 p-3 bg-gray-100 border border-gray-300 rounded-md">
                  {profile.id}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Your unique identifier (cannot be changed)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <div className="mt-1 p-3 bg-gray-100 border border-gray-300 rounded-md">
                  {profile.name}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Contact admin to change your name
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <div className="mt-1 p-3 bg-gray-100 border border-gray-300 rounded-md capitalize">
                  {profile.role}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <div className="mt-1 p-3 bg-gray-100 border border-gray-300 rounded-md">
                  {profile.department}
                </div>
              </div>
            </div>
          </Card>

          {/* Update Email */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Update Email
            </h2>

            <form onSubmit={handleEmailUpdate}>
              <Input
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={emailLoading}
              />

              <Button
                type="submit"
                className="w-full mt-4"
                disabled={emailLoading || email === profile.email}
              >
                {emailLoading ? "Updating..." : "Update Email"}
              </Button>
            </form>
          </Card>

          {/* Change Password */}
          <Card className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Change Password
            </h2>

            <form onSubmit={handlePasswordChange}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="password"
                  label="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={passwordLoading}
                />

                <Input
                  type="password"
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={passwordLoading}
                />

                <Input
                  type="password"
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={passwordLoading}
                />
              </div>

              {newPassword && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Password Requirements:
                  </p>
                  <ul className="text-sm space-y-1">
                    {passwordErrors.map((error, index) => (
                      <li key={index} className="text-red-600">
                        ✗ Missing: {error}
                      </li>
                    ))}
                    {passwordErrors.length === 0 && (
                      <li className="text-green-600">✓ Password meets all requirements</li>
                    )}
                    {confirmPassword && (
                      <li className={passwordsMatch ? "text-green-600" : "text-red-600"}>
                        {passwordsMatch ? "✓" : "✗"} Passwords match
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <Button
                type="submit"
                className="w-full md:w-auto mt-6"
                disabled={
                  passwordLoading ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  passwordErrors.length > 0 ||
                  !passwordsMatch
                }
              >
                {passwordLoading ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}