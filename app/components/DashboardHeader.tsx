"use client";

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Search, Bell, User, Building2, Activity, LogOut, ChevronDown } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

export function DashboardHeader() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [quickViewEntity, setQuickViewEntity] = useState<{ id: string, type: 'intern' | 'mentor' | 'task' } | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data.results || []);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-[var(--nav-header-bg)] text-[var(--nav-text)] z-50 flex items-center justify-between px-8 border-b border-white/5 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-black text-(--nav-text) tracking-tighter uppercase leading-none">Management System</h2>
          <p className="text-[10px] font-bold text-(--nav-text-muted) uppercase tracking-widest mt-1 opacity-60 italic">Live Tracking Dashboard</p>
        </div>
      </div>

      {/* Global Search - Only Visible to Admins */}
      {((session?.user as any)?.role === 'admin') && (
        <div className="hidden md:block flex-1 max-w-xl mx-8 relative">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--nav-text-muted)] group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-2xl py-2.5 pl-12 pr-4 text-sm font-bold text-(--nav-text) focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-(--nav-text-muted) placeholder:font-medium outline-hidden"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--nav-header-bg)] border border-slate-900/10 dark:border-white/10 rounded-2xl shadow-xl shadow-black/20 overflow-hidden z-[100]">
              <div className="py-2">
                {suggestions.map((item: any, idx) => (
                  <div key={idx} className="px-4 py-3 hover:bg-slate-900/5 dark:hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-900/5 dark:border-white/5 last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs">
                      {item.type === 'intern' ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[var(--nav-text)]">{item.name || item.title}</div>
                      <div className="text-[10px] text-[var(--nav-text-muted)] font-black uppercase tracking-widest">{item.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all border border-white/5 active:scale-95"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {mounted && (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
        </button>

        <div className="flex items-center gap-4 group cursor-pointer relative px-4 py-2 rounded-2xl hover:bg-white/5 transition-colors">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
            {session?.user?.name?.charAt(0) || "A"}
          </div>

          <div className="text-left hidden lg:block">
            <div className="text-sm font-bold text-white leading-tight">{session?.user?.name || "Administrator"}</div>
            <div className="flex items-center gap-2">
              <div className="text-[10px] text-gray-400 font-medium">{session?.user?.email || "admin@internhub.com"}</div>
              <span className="bg-indigo-500/20 text-indigo-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">ADMIN</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 active:scale-95"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
