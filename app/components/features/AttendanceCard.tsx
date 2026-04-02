"use client";

import React, { useState, useEffect } from "react";
import { Clock, Play, Square, Loader2, CheckCircle2, AlertCircle, Timer } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { motion, AnimatePresence } from "framer-motion";

export function AttendanceCard() {
  const [status, setStatus] = useState<"idle" | "clocked-in" | "clocked-out" | "loading">("loading");
  const [record, setRecord] = useState<any>(null);
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "clocked-in" && record?.clock_in) {
      interval = setInterval(() => {
        const start = new Date(record.clock_in).getTime();
        const now = new Date().getTime();
        const diff = now - start;

        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        setElapsedTime(
          `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, record]);

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/attendance");
      const data = await response.json();

      if (data) {
        setRecord(data);
        if (data.clock_out) {
          setStatus("clocked-out");
        } else {
          setStatus("clocked-in");
        }
      } else {
        setStatus("idle");
      }
    } catch (err) {
      setError("Failed to load attendance status.");
      setStatus("idle");
    }
  };

  const handleClockAction = async (action: "clock-in" | "clock-out") => {
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchStatus();
      } else {
        setError(data.error || "Action failed.");
        await fetchStatus();
      }
    } catch (err) {
      setError("An error occurred.");
      setStatus("idle");
    }
  };

  if (status === "loading" && !record) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center min-h-[300px] border dm-border">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-sm font-bold dm-text-muted">Fetching today's logs...</p>
      </Card>
    );
  }

  return (
    <Card className="p-10 dm-card rounded-[3rem] border dm-border shadow-2xl relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />

      <div className="flex flex-col gap-8 relative z-10">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-2xl font-black dm-text tracking-tighter">Day Operations</h3>
            <p className="text-xs dm-text-muted font-black uppercase tracking-widest flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${status === 'clocked-in' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="w-14 h-14 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
            <Clock className="w-7 h-7" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {status === "idle" ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col gap-6 py-4"
            >
              <div className="p-8 dm-sunken rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                <p className="text-sm font-bold dm-text-muted mb-2">Ready to start?</p>
                <h4 className="text-lg font-black dm-text">Check-in for today</h4>
              </div>
              <Button
                onClick={() => handleClockAction("clock-in")}
                size="lg"
                className="w-full py-7 rounded-4xl font-black tracking-widest uppercase text-sm shadow-xl shadow-indigo-200"
                icon={<Play className="w-5 h-5 fill-current" />}
              >
                Punch In Now
              </Button>
            </motion.div>
          ) : status === "clocked-in" ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col gap-6 py-4"
            >
              <div className="p-8 bg-indigo-600 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-2xl shadow-indigo-200 text-white">
                <div className="flex items-center gap-2 mb-2 text-indigo-200 font-bold uppercase tracking-widest text-[10px]">
                  <Timer className="w-3 h-3" />
                  Active Session
                </div>
                <h4 className="text-4xl font-black tracking-tighter mb-1">{elapsedTime}</h4>
                <p className="text-[10px] text-indigo-100 font-black uppercase tracking-widest">Keep it up!</p>
              </div>
              <Button
                variant="danger"
                onClick={() => handleClockAction("clock-out")}
                size="lg"
                className="w-full py-7 rounded-4xl font-black tracking-widest uppercase text-sm shadow-xl shadow-rose-200"
                icon={<Square className="w-5 h-5 fill-current" />}
              >
                Punch Out
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-6 py-4"
            >
              <div className="p-8 border-2 border-emerald-100 bg-emerald-50/50 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
                <h4 className="text-lg font-black dm-text">Work Day Recorded</h4>
                <p className="text-sm font-bold text-emerald-700 mt-1">Total Hours: {record?.total_hours}</p>
                <p className="text-[10px] dm-text-muted font-black uppercase tracking-widest mt-4">See you tomorrow!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
