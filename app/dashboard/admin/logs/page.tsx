"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { TableSkeleton } from "@/app/components/ui/Skeleton";
import { ClipboardList, User, Search, Filter, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  /**
   * Effect: Audit Trail Synchronization
   * Retrieves the comprehensive activity log from the system's event store.
   * Tracks administrative actions, entity mutations, and authentication events.
   */
  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/activity");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user?.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.entity_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getActionColor = (action: string) => {
    if (action.includes("delete")) return "red";
    if (action.includes("update") || action.includes("reassign")) return "yellow";
    if (action.includes("create")) return "green";
    return "blue";
  };
  return (
    <DashboardLayout>
      <div className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8 text-slate-900">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight uppercase">
              Activity <span className="text-indigo-600">Logs</span>
            </h1>
            <p className="text-gray-500 mt-2 font-medium opacity-80">Track all actions and events across the platform.</p>
          </div>
          <div className="relative group max-w-md w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search actions or entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700 placeholder:text-gray-300 shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 uppercase">
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.2em]">Timestamp</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.2em]">Administrator</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.2em]">Action</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.2em]">Entity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={4} className="px-8 py-5"><TableSkeleton rows={1} /></td>
                        </tr>
                      ))
                     ) : filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <motion.tr
                          key={log.id}
                          className={`hover:bg-gray-50/50 transition-all duration-200 cursor-pointer group ${selectedLog?.id === log.id ? 'bg-indigo-50/30' : ''}`}
                          onClick={() => setSelectedLog(log)}
                        >
                          <td className="px-8 py-5">
                            <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                              {new Date(log.created_at).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                {(log.user?.profile?.name || "SYS").split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-sm font-bold text-slate-700 tracking-tight">
                                {log.user?.profile?.name || "System"}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black shadow-sm ${
                              log.action.includes('delete') ? 'bg-rose-50 text-rose-600' :
                              log.action.includes('update') ? 'bg-amber-50 text-amber-600' :
                              log.action.includes('create') ? 'bg-emerald-50 text-emerald-600' :
                              'bg-indigo-50 text-indigo-600'
                            }`}>
                              {log.action.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest opacity-70">
                              {log.entity_type}
                            </div>
                            <div className="text-[10px] font-medium text-gray-300 font-mono">
                              {log.entity_id?.slice(0, 8)}...
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-8 py-32 text-center">
                          <ClipboardList className="w-16 h-16 text-gray-100 mx-auto mb-6" />
                          <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No activity logs recorded</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selectedLog ? (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm group hover:shadow-xl transition-all duration-500">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-3">
                        <span className="w-6 h-1 bg-indigo-500 rounded-full" />
                        Log Details
                      </h3>
                      <button onClick={() => setSelectedLog(null)} className="text-[9px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest group-hover:scale-105 transition-all">Dismiss</button>
                    </div>
                    <div className="p-8 space-y-8">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-4 ml-1">Event Data</label>
                        <div className="bg-slate-900 rounded-2xl p-6 overflow-hidden shadow-xl border border-slate-800 group/code">
                          <div className="flex items-center justify-between mb-4">
                             <div className="flex gap-1.5 font-black uppercase text-[8px] tracking-widest text-slate-500">
                               <div className="w-2 h-2 rounded-full bg-rose-500/50" />
                               <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                               <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                             </div>
                             <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Metadata.json</span>
                          </div>
                          <pre className="text-indigo-300 text-[11px] font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[300px] custom-scrollbar">
                            {JSON.stringify(selectedLog.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 bg-gray-50 rounded-4xl border border-gray-100 shadow-sm group/stat hover:bg-white transition-all duration-300">
                          <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Type</div>
                          <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedLog.entity_type}</div>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-4xl border border-gray-100 shadow-sm group/stat hover:bg-white transition-all duration-300">
                          <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Action Level</div>
                          <div className={`text-sm font-black uppercase tracking-tight ${selectedLog.action.includes('delete') ? 'text-rose-500' : 'text-indigo-500'}`}>
                            {selectedLog.action.includes('delete') ? 'DELETION' : 'NORMAL'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[400px] flex items-center justify-center p-12 bg-gray-50/50 rounded-4xl border-2 border-dashed border-gray-100">
                  <div className="text-center group">
                    <Filter className="w-12 h-12 text-gray-200 mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500" />
                    <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] max-w-[240px] leading-relaxed">Select a log entry to view details</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
