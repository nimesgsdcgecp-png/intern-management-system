"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  console.log("data ::: ", session, status);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session?.user) {
      const role = (session.user as any)?.role;
      router.push(`/dashboard/${role}`);
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0c10] to-[#0a0c10]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4 font-black"></div>
      <p className="text-sm uppercase tracking-[0.2em] font-bold">Verifying Clearance...</p>
    </div>
  );
}
