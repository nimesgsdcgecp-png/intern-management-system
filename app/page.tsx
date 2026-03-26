"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log("data ::: ", session, status);
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session?.user) {
      const role = (session.user as any)?.role;
      router.push(`/dashboard/${role}`);
    }
  }, [session, status, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-600 to-blue-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Intern Management System</h1>
        <p className="text-blue-100 mb-8">Redirecting...</p>
      </div>
    </div>
  );
}
