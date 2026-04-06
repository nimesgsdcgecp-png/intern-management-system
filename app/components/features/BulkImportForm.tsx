"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Download, Table, XCircle, Info } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { motion, AnimatePresence } from "framer-motion";

interface PreviewRow {
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  mentor_email: string;
}

export function BulkImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        setError("Please upload a valid CSV file.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);

      const text = await selectedFile.text();
      const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      const header = lines[0].split(",").map(h => h.trim().toLowerCase());
      const dataRows = lines.slice(1, 6); // Preview first 5 rows

      const previewRows: PreviewRow[] = dataRows.map(row => {
        const values = row.split(",").map(v => v.trim());
        const obj: any = {};
        header.forEach((h, i) => {
          obj[h] = values[i];
        });
        return obj as PreviewRow;
      });

      setPreviewData(previewRows);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.results);
        setFile(null);
        setPreviewData([]);
      } else {
        setError(data.error || "Failed to upload file.");
      }
    } catch (err) {
      setError("An error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Name,Email,Role,Department,Phone,Mentor_Email\nJohn Doe,john@example.com,intern,AI,1234567890,mentor@example.com\nJane Smith,jane@example.com,mentor,JAVA,0987654321,";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "intern_import_template_v2.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Card className="p-10 max-w-2xl mx-auto rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden bg-white">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none">
        <Table className="w-64 h-64 text-slate-900" />
      </div>

      <div className="flex flex-col gap-8 relative z-10">
        <div className="flex justify-between items-center bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100/50 group/header transition-all duration-300">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">CSV <span className="text-indigo-600">Import</span></h2>
            <p className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-[0.25em] mt-2 flex items-center gap-2">
               <span className="w-6 h-px bg-indigo-200" />
               Automated Protocol
            </p>
          </div>
          <div className="flex items-center gap-4 text-amber-600 bg-amber-50 px-6 py-4 rounded-2xl border border-amber-100 shadow-sm shadow-amber-100/20">
             <Info className="w-5 h-5 shrink-0" />
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Status Check</span>
                <span className="text-[9px] font-bold uppercase tracking-tight opacity-70">Validation active for all fields</span>
             </div>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest bg-white hover:bg-slate-900 hover:text-white px-6 py-4 rounded-xl border border-slate-200 transition-all shadow-sm active:scale-95 group/btn"
          >
            <Download className="w-4 h-4 group-hover/btn:animate-bounce" />
            Template
          </button>
        </div>

        {!result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all active:scale-[0.98] ${file ? "border-indigo-600 bg-indigo-50/30" : "border-gray-200 hover:border-indigo-400 bg-slate-50/30"
              }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".csv"
            />
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${file ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white text-gray-400 shadow-sm border border-gray-100'}`}>
              {file ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
            </div>
            <div className="text-center">
              <p className="text-base font-extrabold text-slate-900">{file ? file.name : "Select CSV Record"}</p>
              <p className="text-[10px] text-gray-400 font-black mt-1 uppercase tracking-widest">CSV format • Max 10MB • Auto-Verify</p>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {file && previewData.length > 0 && !result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 bg-slate-50/50 rounded-4xl p-8 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Archive Snapshot (First 5 records)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] font-bold text-left border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-gray-400 uppercase tracking-widest text-[8px] font-black">
                        <th className="px-4 py-1">IDENTITY</th>
                        <th className="px-4 py-1">CHANNEL</th>
                        <th className="px-4 py-1">ROLE</th>
                        <th className="px-4 py-1">DEPT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, i) => (
                        <tr key={i} className="bg-white rounded-xl shadow-sm">
                          <td className="px-4 py-3 rounded-l-xl border-l border-y border-gray-50 text-slate-900">{row.name}</td>
                          <td className="px-4 py-3 border-y border-gray-50 text-indigo-600">{row.email}</td>
                          <td className="px-4 py-3 border-y border-gray-50">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-widest ${row.role === 'intern' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                              {row.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 rounded-r-xl border-r border-y border-gray-50 text-gray-400 font-black">{row.department || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-4 p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-3xl">
            <XCircle className="w-8 h-8 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-black uppercase tracking-tight">Access Denied / Validation Error</p>
              <p className="text-xs font-medium opacity-80">{error}</p>
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className={`p-8 rounded-4xl flex flex-col items-center justify-center text-center ${result.failed === 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'} border-2`}>
              <div className={`w-16 h-16 rounded-4xl flex items-center justify-center mb-4 ${result.failed === 0 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white shadow-lg'}`}>
                {result.failed === 0 ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
              </div>
              <h3 className="text-xl font-black tracking-tight">{result.failed === 0 ? 'Protocol Successful' : 'Import Partially Incomplete'}</h3>
              <div className="flex gap-4 mt-2 text-[10px] font-black uppercase tracking-widest opacity-70">
                <span>Total Synchronized: {result.success}</span>
                <span className={result.failed > 0 ? 'text-rose-600' : ''}>Initialization Failures: {result.failed}</span>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="p-8 bg-gray-50/50 rounded-4xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  Issues Found
                </p>
                <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2">
                  {result.errors.map((err, i) => (
                    <div key={i} className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-[11px] font-bold text-rose-600 flex items-start gap-3">
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5 opacity-50" />
                      {err}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={() => { setResult(null); setFile(null); }} className="w-full py-5 rounded-3xl font-black uppercase tracking-widest">Acknowledge & Restart</Button>
          </motion.div>
        )}

        {!result && (
          <Button
            onClick={handleUpload}
            disabled={!file || loading}
            size="lg"
            className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Synchronizing Workspace...
              </>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                Initiate Bulk Import
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}
