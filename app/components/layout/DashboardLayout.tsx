"use client";

import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { ChatWidget } from "../features/ChatWidget";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (!mounted || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen dm-page">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="dm-text-muted font-medium">Initializing Dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden dm-page relative">
      <DashboardHeader />

      <div className="flex flex-1 overflow-hidden transition-all duration-300 pt-20">
        <Sidebar />

        <main className="flex-1 overflow-y-auto overflow-x-hidden dm-sunken dm-scrollbar">
          <div className="min-h-full pb-10 pt-8 w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* AI Chat Assistant - restricted to Admin role */}
      {(session?.user as any)?.role === 'admin' && <ChatWidget />}
    </div>
  );
}
