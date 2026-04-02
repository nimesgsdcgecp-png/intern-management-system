"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, Home, Lock } from "lucide-react";
import { Button } from "@/app/components/Button";
import { Card } from "@/app/components/Card";
import { motion } from "framer-motion";

export default function AccessDeniedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0c10] to-[#0a0c10]">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full z-10"
      >
        <Card className="p-0 overflow-hidden border-blue-500/10 shadow-2xl backdrop-blur-xl bg-white/5 shadow-blue-500/5">
          <div className="p-12 text-center flex flex-col items-center">
            {/* Visual Indicator */}
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-3xl bg-linear-to-br from-red-500/20 to-rose-600/20 flex items-center justify-center border border-red-500/20">
                <ShieldAlert className="w-12 h-12 text-red-500" />
              </div>
            </div>

            {/* Error Content */}
            <h1 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">
              Unauthorized <span className="text-red-500">Access</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-md mx-auto leading-relaxed mb-12">
              Deep Space protocols have intercepted your request. You do not have the required clearance level to access this restricted sector.
            </p>

            {/* Divider */}
            <div className="w-full h-px bg-slate-800/50 mb-12 relative">
                <div className="absolute left-1/2 -translate-x-1/2 -top-2 px-4 bg-[#0a0c10] text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                    Restricted Area
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:px-12">
              <Button 
                variant="secondary" 
                onClick={() => router.back()}
                icon={<ArrowLeft className="w-4 h-4" />}
                className="flex-1 py-4 text-xs font-black uppercase tracking-widest border-slate-800 hover:border-slate-700 h-14"
              >
                Go Back
              </Button>
              <Button 
                onClick={() => router.push("/dashboard")}
                icon={<Home className="w-4 h-4" />}
                className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-900/40 h-14"
              >
                Return to HQ
              </Button>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-2 text-slate-600 font-bold text-[10px] uppercase tracking-widest">
                <Lock className="w-3 h-3" />
                Security Protocol ACTIVE • Ref: 403-FBD
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
