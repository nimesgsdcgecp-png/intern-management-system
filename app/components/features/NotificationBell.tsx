"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Calendar, MessageSquare, Plus, ChevronRight, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuickViewModal } from './QuickViewModal';

interface Notification {
  id: string;
  title: string;
  desc: string;
  type: 'task' | 'intern' | 'mentor' | 'system';
  time: string;
  read: boolean;
  action?: {
    label: string;
    entityId: string;
    entityType: 'intern' | 'mentor' | 'task';
  };
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Directive Staged',
    desc: 'Database Migration strategy has been moved to Executing state.',
    type: 'task',
    time: '2m ago',
    read: false,
    action: { label: 'Review Directive', entityId: 'task-db-mig', entityType: 'task' }
  },
  {
    id: '2',
    title: 'New Candidate Registered',
    desc: 'Sarah Jenkins has completed the onboard profile sequence.',
    type: 'intern',
    time: '15m ago',
    read: false,
    action: { label: 'Audit Profile', entityId: 'intern-sj', entityType: 'intern' }
  },
  {
    id: '3',
    title: 'System Optimization',
    desc: 'Bulk archival sweep completed for Q1 technical logs.',
    type: 'system',
    time: '1h ago',
    read: true,
  }
];

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [quickViewEntity, setQuickViewEntity] = useState<{ id: string, type: 'intern' | 'mentor' | 'task' } | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'task': return <Zap className="w-4 h-4 text-indigo-500" />;
      case 'intern': return <Target className="w-4 h-4 text-emerald-500" />;
      case 'mentor': return <Plus className="w-4 h-4 text-purple-500" />;
      default: return <Calendar className="w-4 h-4 text-amber-500" />;
    }
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-xs"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-swing origin-top' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-indigo-600 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-lg shadow-indigo-500/20">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown / Center */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-slate-900/5 backdrop-blur-[2px]" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="absolute top-full right-0 mt-3 w-96 bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(31,38,135,0.25)] border border-slate-100 dark:border-slate-800 z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-linear-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50">
                <div className="flex flex-col">
                  <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Operational Alerts</h3>
                  <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Notification Hub</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={markAllRead} className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:text-indigo-700 transition active:scale-95">Catch Up</button>
                </div>
              </div>

              <div className="max-h-[440px] overflow-y-auto custom-scrollbar flex flex-col p-2 space-y-1">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800 group relative ${!n.read ? 'bg-indigo-50/20 dark:bg-indigo-500/5 border-indigo-100/30 dark:border-indigo-500/10' : ''}`}
                    >
                      <div className="flex gap-4">
                        <div className={`p-2.5 rounded-xl h-max shrink-0 ${!n.read ? 'bg-white dark:bg-slate-800 shadow-sm border border-indigo-100/50 dark:border-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800/50'}`}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1 gap-2">
                            <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 leading-tight truncate">{n.title}</h4>
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap pt-0.5">{n.time}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{n.desc}</p>
                          
                          {n.action && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuickViewEntity({ id: n.action!.entityId, type: n.action!.entityType });
                                markRead(n.id);
                                setIsOpen(false);
                              }}
                              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98]"
                            >
                              {n.action.label}
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      {!n.read && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.6)]" />}
                    </div>
                  ))
                ) : (
                  <div className="py-16 px-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
                        <Bell className="w-8 h-8 text-slate-200 dark:text-slate-700" />
                    </div>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 tracking-tight">Archives are empty</p>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">No pending notifications</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-50 dark:border-slate-800 flex justify-center">
                  <button onClick={clearAll} className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-rose-500 transition flex items-center gap-2">
                    <Trash2 className="w-3 h-3" /> Clear Intel Archives
                  </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <QuickViewModal 
        isOpen={!!quickViewEntity}
        onClose={() => setQuickViewEntity(null)}
        entityId={quickViewEntity?.id || null}
        entityType={quickViewEntity?.type || null}
      />
    </div>
  );
}
