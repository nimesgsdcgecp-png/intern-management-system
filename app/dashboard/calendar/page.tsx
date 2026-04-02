"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Modal } from "@/app/components/ui/Modal";
import { Input } from "@/app/components/ui/Input";
import { TextArea } from "@/app/components/ui/TextArea";
import { Select } from "@/app/components/ui/Select";
import { Badge } from "@/app/components/ui/Badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, MapPin, Clock, Tag, X, Trash2, Activity, Globe, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

export default function CalendarPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    type: "company", 
    department: "",
  });

  const userRole = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newEvent = await res.json();
        setEvents([...events, newEvent]);
        setShowAddModal(false);
        setFormData({
          title: "",
          description: "",
          startTime: "",
          endTime: "",
          location: "",
          type: "company",
          department: "",
        });
        Swal.fire({
          title: "Event Added",
          text: "The event has been added to the calendar.",
          icon: "success",
          confirmButtonColor: "#4f46e5",
          customClass: {
            popup: 'dm-modal rounded-[2rem]'
          }
        });
        fetchEvents();
      } else {
        const error = await res.json();
        Swal.fire("Error", error.error || "Failed to create event", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Check your internet connection", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Event?",
      text: "Are you sure you want to delete this event?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Delete Event",
      customClass: {
        popup: 'dm-modal rounded-[2rem]'
      }
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/events/${id}?userId=${userId}`, { method: "DELETE" });
        if (res.ok) {
          setEvents(events.filter(e => e.id !== id));
          setSelectedEvent(null);
          Swal.fire("Deleted", "The event has been removed.", "success");
        } else {
          const err = await res.json();
          Swal.fire("Error", err.error || "Failed to delete event", "error");
        }
      } catch (error) {
        Swal.fire("Error", "Failed to delete event", "error");
      }
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const renderCells = () => {
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`pad-${i}`} className="h-32 border-b border-r dm-border bg-slate-50/20 dark:bg-black/10 opacity-30"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.start_time.startsWith(dateStr));
      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

      cells.push(
        <div 
          key={d} 
          onClick={() => {
            if (userRole === "admin" || userRole === "mentor") {
              setFormData({ ...formData, startTime: `${dateStr}T09:00`, endTime: `${dateStr}T10:00` });
              setShowAddModal(true);
            }
          }}
          className={`h-32 border-b border-r border-gray-100 p-4 relative group transition-all hover:bg-gray-50/50 cursor-pointer ${isToday ? 'bg-indigo-50/30' : ''}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] font-black w-7 h-7 rounded-full flex items-center justify-center transition-all ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-400 group-hover:text-indigo-600 group-hover:bg-indigo-50'}`}>
              {d}
            </span>
            {dayEvents.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> }
          </div>
          <div className="space-y-1 mt-1 max-h-16 overflow-y-auto no-scrollbar">
            {dayEvents.map(event => (
              <div 
                key={event.id}
                onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                className={`text-[9px] font-bold px-2 py-1 rounded-lg truncate cursor-pointer transition-all hover:translate-x-1 border tracking-tight ${
                  event.type === 'company' 
                    ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    const targetTotal = Math.ceil((firstDay + totalDays) / 7) * 7;
    for (let i = cells.length; i < targetTotal; i++) {
        cells.push(<div key={`end-${i}`} className="h-32 border-b border-r border-gray-100 bg-gray-50/30 opacity-30"></div>);
    }

    return cells;
  };

  return (
    <DashboardLayout>
      <div className="space-y-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div>
             <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
               Event <span className="text-indigo-600">Calendar</span>
             </h1>
             <p className="text-gray-500 mt-1 font-medium">Schedule and manage organizational events.</p>
           </div>

           {(userRole === "admin" || userRole === "mentor") && (
              <Button 
                onClick={() => setShowAddModal(true)}
                icon={<Plus className="w-5 h-5" />}
                className="py-4 px-10 shadow-2xl shadow-indigo-500/20 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest text-[11px]"
              >
                Add Event
              </Button>
           )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
          <div className="xl:col-span-3">
            <div className="rounded-[2.5rem] border border-gray-100 overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="bg-slate-900 px-12 py-10 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="flex items-center gap-8 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Schedule Management</span>
                    <h2 className="text-4xl font-extrabold text-white tracking-tight">
                      {months[month]} <span className="font-light opacity-40">{year}</span>
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-6 relative z-10 font-black">
                  <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <button onClick={prevMonth} className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all outline-none active:scale-90">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors">
                      Today
                    </button>
                    <button onClick={nextMonth} className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all outline-none active:scale-90">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-7">
                {days.map(day => (
                  <div key={day} className="py-5 border-r border-b border-gray-100 bg-gray-50/50 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                    {day}
                  </div>
                ))}
                {renderCells()}
              </div>
            </div>
          </div>

          <div className="xl:col-span-1 space-y-10">
             <div className="rounded-[2.5rem] border border-gray-100 overflow-hidden bg-white shadow-sm">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                   <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                       <Sparkles className="w-4 h-4 text-indigo-500" />
                       Upcoming Events
                   </h3>
                </div>
                <div className="p-8">
                    <div className="space-y-6">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => <div key={i} className="h-28 bg-gray-50 animate-pulse rounded-3xl"></div>)
                        ) : events.filter(e => new Date(e.start_time) >= new Date()).length > 0 ? (
                            events.filter(e => new Date(e.start_time) >= new Date()).slice(0, 5).map(event => (
                                <motion.div 
                                    key={event.id}
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    onClick={() => setSelectedEvent(event)}
                                    className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 hover:bg-white transition-all cursor-pointer group shadow-sm hover:shadow-xl"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${event.type === 'company' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                            {event.type}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-gray-900 tracking-tighter">{new Date(event.start_time).toLocaleDateString([], { day: '2-digit' })}</span>
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest opacity-60">{new Date(event.start_time).toLocaleDateString([], { month: 'short' })}</span>
                                        </div>
                                    </div>
                                    <h3 className="font-black text-[13px] text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight line-clamp-2 uppercase mb-4 leading-relaxed">{event.title}</h3>
                                    <div className="flex items-center gap-3 text-[9px] font-black text-gray-400 uppercase tracking-widest pt-4 border-t border-gray-100">
                                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                        <span>{new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                  <Globe className="w-8 h-8 text-indigo-300" />
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">No events found</p>
                            </div>
                        )}
                    </div>
                </div>
             </div>

             <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl group border-none">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10 font-black">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8 border border-white/20 shadow-xl">
                        <Activity className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-black text-2xl tracking-tighter mb-6 uppercase">Sync <br/>Settings</h3>
                    <div className="space-y-6">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-colors">
                           <div className="flex items-center gap-3 mb-2">
                             <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Company Wide</span>
                           </div>
                           <p className="text-[10px] font-medium opacity-60">Visible to all authorized resources.</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-colors">
                           <div className="flex items-center gap-3 mb-2">
                             <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Department Restricted</span>
                           </div>
                           <p className="text-[10px] font-medium opacity-60">Isolated to specific team streams.</p>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        title="Add New Event"
        size="lg"
      >
          <form onSubmit={handleAddEvent} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Event Title</label>
                  <input 
                     type="text"
                     placeholder="Brief & Impactful Title" 
                     value={formData.title}
                     onChange={(e) => setFormData({...formData, title: e.target.value})}
                     className="w-full bg-slate-50 border-none rounded-xl py-3 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-300 shadow-sm"
                     required
                  />
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location</label>
                  <input 
                     type="text" 
                     placeholder="e.g. Conference Room" 
                     value={formData.location}
                     onChange={(e) => setFormData({...formData, location: e.target.value})}
                     className="w-full bg-slate-50 border-none rounded-xl py-3 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-300 shadow-sm"
                  />
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
               <textarea 
                  placeholder="What is this event about?"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full bg-slate-50 border-none rounded-xl p-5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none placeholder:text-gray-300 shadow-sm"
               />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Starts At</label>
                  <input 
                     type="datetime-local" 
                     value={formData.startTime}
                     onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                     className="w-full bg-slate-50 border-none rounded-xl py-3 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                     required
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ends At</label>
                  <input 
                     type="datetime-local" 
                     value={formData.endTime}
                     onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                     className="w-full bg-slate-50 border-none rounded-xl py-3 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                     required
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-indigo-50/20 p-5 rounded-4xl border border-indigo-100/30">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Audience</label>
                  <select 
                     value={formData.type}
                     onChange={(e) => setFormData({...formData, type: e.target.value})}
                     disabled={userRole === "mentor"}
                     className="w-full bg-white border-none rounded-xl py-3 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer shadow-sm"
                  >
                     <option value="company">COMPANY WIDE</option>
                     <option value="department">SPECIFIC DEPT</option>
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Department</label>
                  <select 
                     value={formData.department}
                     onChange={(e) => setFormData({...formData, department: e.target.value})}
                     disabled={userRole === "mentor" || formData.type === "company"}
                     className="w-full bg-white border-none rounded-xl py-3 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer shadow-sm disabled:opacity-30"
                  >
                     <option value="">ALL DEPTS</option>
                     <option value="AI">AI DEVELOPMENT</option>
                     <option value="ODOO">ODOO SYSTEMS</option>
                     <option value="JAVA">JAVA CORE</option>
                     <option value="MOBILE">MOBILE APP</option>
                     <option value="QC">QUALITY ASSURANCE</option>
                  </select>
               </div>
            </div>

            <div className="flex justify-end gap-4 pt-5 border-t border-gray-50">
               <button 
                 type="button" 
                 onClick={() => setShowAddModal(false)}
                 className="px-8 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
               >
                 Discard
               </button>
               <button 
                 type="submit" 
                 disabled={submitting}
                 className="px-10 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
               >
                 {submitting ? "Processing..." : "Create Event"}
               </button>
            </div>
        </form>
      </Modal>

      {/* Event Details Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Event Details"
        size="lg"
      >
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
                <div className="flex items-center gap-6">
                   <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group ${selectedEvent?.type === 'company' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CalendarIcon className="w-8 h-8 relative z-10" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">{selectedEvent?.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                         <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">Created by {selectedEvent?.creator?.profile?.name || 'Administrator'}</span>
                      </div>
                   </div>
                </div>
                <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border ${selectedEvent?.type === 'company' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                   {selectedEvent?.type === 'company' ? 'Organizational Scope' : 'Stream Restricted'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Starts At</label>
                  <input 
                     type="datetime-local" 
                     value={formData.startTime}
                     onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                     className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                     required
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ends At</label>
                  <input 
                     type="datetime-local" 
                     value={formData.endTime}
                     onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                     className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                     required
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex items-center gap-6 group hover:bg-white transition-all shadow-sm hover:shadow-xl">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <Clock className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Event Schedule</div>
                        <div className="text-[13px] font-black text-gray-900 tracking-tight uppercase whitespace-nowrap">
                            {selectedEvent && formatTimeRange(selectedEvent.start_time, selectedEvent.end_time)}
                        </div>
                    </div>
                </div>
                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex items-center gap-6 group hover:bg-white transition-all shadow-sm hover:shadow-xl">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                        <MapPin className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Event Location</div>
                        <div className="text-[13px] font-black text-gray-900 tracking-tight uppercase">{selectedEvent?.location || 'Unspecified Sector'}</div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 relative overflow-hidden group/desc hover:bg-white transition-all duration-500 shadow-sm hover:shadow-xl">
                <div className="absolute right-0 top-0 p-8 opacity-5 blur-xl group-hover/desc:scale-150 transition-transform duration-700">
                   <AlertCircle className="w-32 h-32 text-indigo-500" />
                </div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6 block">Technical Specifications</label>
                <p className="text-[14px] font-medium text-gray-700 leading-relaxed relative z-10">
                    "{selectedEvent?.description || "No tactical details provided for this event."}"
                </p>
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-indigo-500 opacity-20" />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-gray-100">
                { (userRole === 'admin' || (selectedEvent?.created_by === userId)) && (
                    <button 
                        onClick={() => handleDeleteEvent(selectedEvent.id)}
                        className="flex items-center gap-3 text-rose-500 hover:text-rose-700 transition-all font-black text-[10px] uppercase tracking-[0.2em] group outline-none"
                    >
                        <Trash2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        Decommission Event
                    </button>
                )}
                <div className="flex items-center gap-5 w-full md:w-auto">
                   <button 
                     onClick={() => setSelectedEvent(null)}
                     className="flex-1 md:flex-none px-12 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all outline-none"
                   >
                     Terminate Details
                   </button>
                </div>
            </div>
        </div>
      </Modal>
    </DashboardLayout>
  );

  function formatTimeRange(start: string, end: string) {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${e.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
}
