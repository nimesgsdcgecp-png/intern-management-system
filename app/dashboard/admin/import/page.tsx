"use client";

import React from "react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { BulkImportForm } from "@/app/components/features/BulkImportForm";
import { Users, ArrowLeft, ShieldCheck, Zap, Info, ShieldAlert, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { motion } from "framer-motion";

export default function BulkImportPage() {
   return (
      <DashboardLayout>
         <div className="max-w-5xl mx-auto space-y-12">
            {/* Compact Header */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 text-slate-900">
                <div>
                   <h1 className="text-5xl font-black text-slate-900 tracking-tight uppercase">
                      Bulk <span className="text-indigo-600">Import</span>
                   </h1>
                   <p className="text-gray-500 mt-2 font-medium opacity-80">Import multiple intern profiles via CSV format.</p>
                </div>

                <Link href="/dashboard/admin">
                   <button className="bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl py-4 px-10 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all active:scale-95 shadow-sm text-slate-600">
                      <ArrowLeft className="w-4 h-4" />
                      Dashboard
                   </button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
               {/* Main Action Area */}
               <div className="lg:col-span-12 xl:col-span-8">
                  <BulkImportForm />
               </div>

               {/* Collateral Info Area - Optimized for Space */}
                <div className="lg:col-span-12 xl:col-span-4 space-y-10">
                    <div className="rounded-[2.5rem] border border-gray-100 p-10 bg-white shadow-sm overflow-hidden relative group hover:shadow-xl transition-all duration-500">
                       <div className="absolute -right-10 -top-10 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
                       <div className="relative z-10 space-y-8">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
                                <ShieldCheck className="w-6 h-6" />
                             </div>
                             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-3">Import Guidelines</h3>
                          </div>
                          <p className="text-sm font-bold text-slate-600 mb-6">Follow these rules to ensure your data is correctly processed.</p>

                         <div className="space-y-6">
                            <div className="space-y-3">
                               <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                 <span className="w-4 h-px bg-indigo-200" />
                                 Mandatory Parameters
                               </p>
                               <div className="grid grid-cols-1 gap-3">
                                  {["NAME", "EMAIL", "ROLE"].map(item => (
                                     <div key={item} className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-50 hover:bg-white transition-all cursor-default">
                                        <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" fill="currentColor" />
                                        <span className="text-[10px] font-black text-slate-900 tracking-[0.2em]">{item}</span>
                                     </div>
                                  ))}
                               </div>
                            </div>

                            <div className="space-y-3 pt-2">
                               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                 <span className="w-4 h-px bg-gray-200" />
                                 Optional Nodes
                               </p>
                               <div className="grid grid-cols-1 gap-3">
                                  {["DEPARTMENT", "PHONE", "MENTOR_EMAIL"].map(item => (
                                     <div key={item} className="flex items-center gap-3 p-3.5 bg-gray-50/50 rounded-2xl border border-transparent opacity-60">
                                        <div className="w-1 h-1 rounded-full bg-gray-400" />
                                        <span className="text-[10px] font-black text-gray-400 tracking-[0.2em]">{item}</span>
                                     </div>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-xl group cursor-default border-none">
                       <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[24px_24px] opacity-5 group-hover:opacity-10 transition-opacity" />
                       <div className="relative z-10 font-black">
                          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8 border border-white/20 group-hover:rotate-12 transition-transform shadow-2xl">
                             <Sparkles className="w-7 h-7 text-indigo-400" />
                          </div>
                          <h4 className="text-3xl font-black tracking-tight mb-6 uppercase leading-tight underline decoration-indigo-500 decoration-4 underline-offset-8">Security <br />Verification</h4>
                          <p className="text-[10px] font-medium opacity-60 leading-relaxed mb-10">
                             All imported records undergo automated validation sequence. Email addresses must be unique within the system domain.
                          </p>
                          <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] bg-white/5 px-6 py-3 rounded-2xl text-indigo-300 border border-white/10 shadow-inner">
                             <ShieldAlert className="w-4 h-4 animate-pulse text-rose-400" />
                             Immutable Trail Active
                          </div>
                       </div>
                    </div>
                </div>
               </div>
         </div>
      </DashboardLayout>
   );
}
