"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { Select } from "@/app/components/ui/Select";
import { Users, Mail, Building2, UserCheck, GraduationCap, MapPin, ExternalLink, ShieldCheck, Sparkles, Activity, Search, Filter } from "lucide-react";
import { StatsGrid } from "@/app/components/ui/StatsGrid";
import { motion } from "framer-motion";

interface Intern {
  id: string;
  name: string;
  email: string;
  department: string;
  university?: string;
  collegeName?: string;
  startDate: string;
  endDate: string;
  status: string;
}

const DEPARTMENTS = ["AI", "ODOO", "JAVA", "MOBILE", "SAP", "QC", "PHP", "RPA"];

export default function MyInternsPage() {
  const { data: session } = useSession();
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: "", department: "" });

  /**
   * Effect: Cross-Entity Data Synchronization
   * Fetches the global intern registry and filters specifically for 
   * individuals assigned to this mentor's leadership.
   */
  useEffect(() => {
    const fetchInterns = async () => {
      try {
        const mentorId = (session?.user as any)?.id;
        const res = await fetch("/api/interns");
        if (res.ok) {
          const allInterns = await res.json();
          const myInterns = allInterns.filter((i: any) => i.mentorId === mentorId);
          setInterns(myInterns);
        }
      } catch (error) {
        console.error("Failed to fetch interns:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) fetchInterns();
  }, [session]);

  const filteredInterns = interns.filter((intern) => {
    return (
      intern.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      (filters.department === "" || intern.department === filters.department)
    );
  });

  const statsData = [
    {
      label: "Total Interns",
      value: loading ? "..." : interns.length,
      icon: <Users />,
      color: "blue" as const,
    },
    {
      label: "Currently Active",
      value: loading ? "..." : interns.filter(i => i.status === 'active').length,
      icon: <Activity />,
      color: "green" as const,
    },
    {
      label: "Teams Covered",
      value: loading ? "..." : new Set(interns.map(i => i.department)).size,
      icon: <Building2 />,
      color: "purple" as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              My Interns
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Manage and track the performance of interns assigned to you.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black flex items-center gap-3 border border-indigo-100 uppercase tracking-widest shadow-sm">
              <ShieldCheck className="w-4 h-4" />
              Mentor View
            </div>
          </div>
        </div>

        <StatsGrid stats={statsData} loading={loading} />

        {/* Filter Section */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Search Intern</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Type a name to search..."
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-300"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ name: "", department: "" })}
                className="w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
              <p className="text-[10px] font-black dm-text-muted uppercase tracking-widest opacity-40">Syncing Directory...</p>
            </div>
          ) : filteredInterns.length === 0 ? (
            <Card className="text-center py-24 rounded-[2.5rem] border-dashed border-2 border-gray-100 bg-gray-50/20">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-6 opacity-40" />
              <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight opacity-40">No Records Found</h3>
            </Card>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Intern Information</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Department</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">College/University</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredInterns.map((intern) => (
                      <tr key={intern.id} className="group transition-all duration-300 hover:bg-gray-50/30">
                        <td className="px-8 py-4 min-w-[200px]">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold shadow-sm shadow-slate-200">
                              {intern.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{intern.name}</span>
                              <span className="text-xs text-gray-400 font-medium">{intern.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                            {intern.department}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5 font-bold text-xs text-gray-600 tracking-tight">
                            <GraduationCap className="w-4 h-4 text-indigo-400" />
                            {intern.collegeName || intern.university || "Organization"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            intern.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {intern.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex justify-end">
                            <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-gray-100 active:scale-95">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
