"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "./Button";
import { useAppDispatch, useSidebar, useAppSelector } from "../lib/redux/hooks";
import { toggleSidebar } from "../lib/redux/slices/uiSlice";
import { addSuccess, addError } from "../lib/redux/slices/notificationSlice";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CheckSquare,
  FileText,
  PlusCircle,
  BarChart3,
  LogOut,
  User,
  Shield,
  GraduationCap,
  Menu,
  ClipboardList,
  CalendarDays,
  Building2,
  Bell,
  MessageSquare,
} from "lucide-react";

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const roleIcons = {
  admin: <Shield className="w-4 h-4" />,
  mentor: <GraduationCap className="w-4 h-4" />,
  intern: <User className="w-4 h-4" />,
};

export function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isCollapsed, deviceType } = useSidebar();
  const animationsEnabled = useAppSelector(state => state.ui.animationsEnabled);
  const role = (session?.user as any)?.role;

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/auth/login");

      dispatch(addSuccess({
        title: 'Logged out successfully',
        message: 'You have been logged out securely.',
        duration: 3000
      }));
    } catch (error) {
      dispatch(addError({
        title: 'Logout failed',
        message: 'There was an issue logging you out. Please try again.',
        duration: 5000
      }));
    }
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const getNavLinks = (): NavLink[] => {
    if (role === "admin") {
      return [
        {
          href: "/dashboard/admin",
          label: "Dashboard",
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          href: "/dashboard/admin/interns",
          label: "Interns",
          icon: <Users className="w-5 h-5" />,
        },
        {
          href: "/dashboard/admin/mentors",
          label: "Mentors",
          icon: <UserCheck className="w-5 h-5" />,
        },
        {
          href: "/dashboard/admin/tasks",
          label: "Tasks",
          icon: <CheckSquare className="w-5 h-5" />,
        },
        {
          href: "/dashboard/admin/reports",
          label: "Reports",
          icon: <BarChart3 className="w-5 h-5" />,
        },
        {
          href: "/dashboard/admin/logs",
          label: "Logs",
          icon: <ClipboardList className="w-5 h-5" />,
        },
        {
          href: "/dashboard/admin/attendance",
          label: "Attendance",
          icon: <Menu className="w-5 h-5" />,
        },
        {
          href: "/dashboard/calendar",
          label: "Calendar",
          icon: <CalendarDays className="w-5 h-5" />,
        },
        {
          href: "/dashboard/admin/import",
          label: "Import",
          icon: <PlusCircle className="w-5 h-5" />,
        },
      ];
    }
    if (role === "mentor") {
      return [
        {
          href: "/dashboard/mentor",
          label: "Dashboard",
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          href: "/dashboard/mentor/interns",
          label: "My Interns",
          icon: <Users className="w-5 h-5" />,
        },
        {
          href: "/dashboard/mentor/tasks",
          label: "Manage Tasks",
          icon: <CheckSquare className="w-5 h-5" />,
        },
        {
          href: "/dashboard/mentor/reports",
          label: "View Reports",
          icon: <BarChart3 className="w-5 h-5" />,
        },
        {
          href: "/dashboard/admin/attendance",
          label: "Attendance Monitor",
          icon: <UserCheck className="w-5 h-5" />,
        },
        {
          href: "/dashboard/calendar",
          label: "Event Calendar",
          icon: <CalendarDays className="w-5 h-5" />,
        },
        {
          href: "/profile",
          label: "Profile Settings",
          icon: <User className="w-5 h-5" />,
        },
      ];
    }
    if (role === "intern") {
      return [
        {
          href: "/dashboard/intern",
          label: "Dashboard",
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          href: "/dashboard/intern/tasks",
          label: "My Tasks",
          icon: <CheckSquare className="w-5 h-5" />,
        },
        {
          href: "/dashboard/intern/submit-report",
          label: "Submit Report",
          icon: <FileText className="w-5 h-5" />,
        },
        {
          href: "/dashboard/intern/attendance",
          label: "Attendance History",
          icon: <UserCheck className="w-5 h-5" />,
        },
        {
          href: "/dashboard/calendar",
          label: "Event Calendar",
          icon: <CalendarDays className="w-5 h-5" />,
        },
        {
          href: "/profile",
          label: "Profile Settings",
          icon: <User className="w-5 h-5" />,
        },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <aside
      className={`
        ${isCollapsed ? 'w-20' : 'w-72'}
        h-full flex flex-col relative
        transition-all duration-300 ease-in-out
        ${deviceType === 'mobile' && !isCollapsed ? 'fixed z-50' : ''}
        bg-[var(--nav-bg)] border-r border-white/5
      `}
    >
      {/* Subtle Glow Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />

      {/* Header Section */}
      <div className={`relative ${isCollapsed ? 'p-4' : 'p-6'} border-b border-white/5`}>
        <div className={`flex ${isCollapsed ? 'flex-col' : 'flex-row'} items-center gap-4`}>
          <motion.button
            onClick={handleToggleSidebar}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5 active:scale-95"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="w-5 h-5" />
          </motion.button>

          {!isCollapsed && (
             <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
             >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-[var(--nav-text)] uppercase tracking-wider">Menu</span>
                  <span className="text-[10px] font-bold text-[var(--nav-text-muted)] uppercase tracking-widest">System</span>
                </div>
             </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 overflow-y-auto dm-scrollbar">
        <ul className="space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link href={link.href}>
                  <motion.div
                    className={`
                      relative group flex items-center rounded-xl p-3
                      transition-all duration-200 cursor-pointer
                      ${isCollapsed ? 'justify-center mx-0' : 'gap-4'}
                      ${isActive 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }
                    `}
                    whileHover={{ x: isCollapsed ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                    title={isCollapsed ? link.label : undefined}
                  >
                    <div className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-400 transition-colors'}`}>
                      {link.icon}
                    </div>
                    
                    {!isCollapsed && (
                      <span className="text-xs font-bold tracking-tight uppercase">
                        {link.label}
                      </span>
                    )}

                    {isCollapsed && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-[#1e293b] text-white text-[10px] font-black uppercase rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-2xl border border-white/5 translate-x-2 group-hover:translate-x-0">
                        {link.label}
                      </div>
                    )}
                  </motion.div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Profile */}
      <div className={`p-4 border-t border-white/5 bg-black/20 ${isCollapsed ? 'items-center' : ''}`}>
         <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'p-2 rounded-2xl bg-white/5 border border-white/5'}`}>
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold border border-white/10">
               {session?.user?.name?.charAt(0) || "A"}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black text-white truncate">{session?.user?.name || "Administrator"}</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Super Admin</span>
              </div>
            )}
         </div>
      </div>
    </aside>
  );
}
