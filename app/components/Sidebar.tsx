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
          label: "Manage Interns",
          icon: <Users className="w-5 h-5" />,
        },
        {
          href: "/dashboard/admin/mentors",
          label: "Manage Mentors",
          icon: <UserCheck className="w-5 h-5" />,
        },
        {
          href: "/dashboard/admin/tasks",
          label: "Create Tasks",
          icon: <PlusCircle className="w-5 h-5" />,
        },
        {
          href: "/dashboard/admin/reports",
          label: "View Reports",
          icon: <BarChart3 className="w-5 h-5" />,
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
          href: "/dashboard/intern/reports",
          label: "My Reports",
          icon: <BarChart3 className="w-5 h-5" />,
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
        h-screen flex flex-col relative
        transition-all duration-300 ease-in-out
        ${deviceType === 'mobile' && !isCollapsed ? 'fixed z-50' : ''}
      `}
      style={{
        background: `linear-gradient(180deg,
          hsl(222, 47%, 11%) 0%,
          hsl(217, 33%, 17%) 100%)`,
      }}
    >
      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-white/5 via-transparent to-black/20 pointer-events-none" />

      {/* Header Section */}
      <div className={`relative ${isCollapsed ? 'p-4' : 'p-6'} border-b border-white/10`}>
        <div className={`flex ${isCollapsed ? 'flex-col' : 'flex-row'} items-center gap-4 mb-8`}>
          {/* Toggle Button First */}
          <motion.button
            onClick={handleToggleSidebar}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors border border-white/10 shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="w-5 h-5" />
          </motion.button>

          {/* Logo Second */}
          <motion.div
            className="bg-linear-to-br from-blue-500 to-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0"
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-white font-bold text-2xl">IM</span>
          </motion.div>
          
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="overflow-hidden flex-1"
            >
              <h1 className="text-xl font-bold text-white tracking-tight whitespace-nowrap leading-tight">
                Intern <br />
                <span className="text-blue-400">Management</span>
              </h1>
            </motion.div>
          )}
        </div>

        <div className={`
          relative rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-300
          ${isCollapsed ? 'p-2 flex justify-center' : 'p-3'}
        `}>
          {isCollapsed ? (
            /* Collapsed Profile - Compact Avatar with Status */
            <motion.div
              className="relative group cursor-pointer flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center relative shadow-lg shadow-blue-500/20">
                <User className="w-5 h-5 text-white" />
                {/* Status Indicator */}
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#111827] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                </div>
              </div>

              {/* Enhanced Tooltip for Collapsed State */}
              <motion.div
                className="absolute left-full ml-4 top-0 z-50 opacity-0 group-hover:opacity-100 pointer-events-none"
                initial={{ opacity: 0, x: -10 }}
                whileHover={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-gray-900/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap border border-white/10">
                  <div className="font-medium">{session?.user?.name || "User"}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    {roleIcons[role as keyof typeof roleIcons]}
                    <span className="text-xs text-gray-300 capitalize">{role}</span>
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-xs text-emerald-400 ml-1">Online</span>
                    </div>
                  </div>
                  {/* Tooltip Arrow */}
                  <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900/95 rotate-45 border-l border-t border-white/10"></div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            /* Expanded Profile - Full Details */
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <User className="w-5 h-5 text-white" />
                </div>
                {/* Status Indicator */}
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#111827] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                </div>
              </div>

              <motion.div
                className="flex-1 min-w-0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <p className="text-sm font-bold text-white truncate leading-tight">
                  {session?.user?.name || "User"}
                </p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] uppercase tracking-wider text-gray-400 font-bold border border-white/5">
                    {roleIcons[role as keyof typeof roleIcons]}
                    <span className="capitalize">{role}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50" />
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isCollapsed ? 'px-2 py-4' : 'p-4'} transition-all duration-300`}>
        <ul className={`space-y-${isCollapsed ? '1' : '2'}`}>
          {navLinks.map((link, index) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                  <Link href={link.href}>
                    <motion.div
                      className={`
                        relative group flex items-center rounded-xl
                        transition-all duration-300 ease-in-out cursor-pointer
                        ${isCollapsed
                          ? 'justify-center px-3 py-3 mx-1'
                          : 'px-4 py-3 space-x-3'
                        }
                        ${
                          isActive
                            ? "bg-linear-to-r from-blue-600/90 to-blue-500/70 text-white shadow-lg shadow-blue-500/25 backdrop-blur-sm"
                            : "text-gray-300 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm"
                        }
                      `}
                      whileHover={{
                        scale: isCollapsed ? 1.05 : 1.02,
                        x: isCollapsed ? 0 : 4,
                        transition: { duration: 0.2 },
                      }}
                      whileTap={{ scale: 0.98 }}
                      title={isCollapsed ? link.label : undefined}
                    >
                      {/* Active Indicator for Expanded Sidebar */}
                      {isActive && !isCollapsed && (
                        <motion.div
                          className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-blue-400 to-emerald-400 rounded-r-full"
                          layoutId="activeIndicator"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 40,
                          }}
                        />
                      )}

                      {/* Active Indicator for Collapsed Sidebar */}
                      {isActive && isCollapsed && (
                        <motion.div
                          className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-emerald-500/20 rounded-xl ring-2 ring-blue-400/50"
                          layoutId="activeIndicatorCollapsed"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}

                      {/* Icon */}
                      <motion.div
                        className={`
                          relative z-10 flex items-center justify-center
                          ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}
                          ${isCollapsed ? 'w-5 h-5' : ''}
                        `}
                        whileHover={{
                          rotate: isActive ? 5 : 0,
                          scale: isCollapsed ? 1.1 : 1.0
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {link.icon}
                      </motion.div>

                      {/* Label */}
                      {!isCollapsed && (
                        <motion.span
                          className="relative z-10 font-medium text-sm"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {link.label}
                        </motion.span>
                      )}

                      {/* Enhanced Tooltip for Collapsed State */}
                      {isCollapsed && (
                        <motion.div
                          className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 pointer-events-none"
                          initial={{ opacity: 0, x: -10 }}
                          whileHover={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="bg-gray-900/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap border border-white/10 shadow-lg shadow-black/20">
                            {link.label}
                            {/* Tooltip Arrow */}
                            <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-gray-900/95 rotate-45 border-l border-t border-white/10"></div>
                          </div>
                        </motion.div>
                      )}

                      {/* Hover Glow Effect */}
                      {!isActive && (
                        <motion.div
                          className="absolute inset-0 bg-linear-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 rounded-xl opacity-0 group-hover:opacity-100"
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>

      {/* Footer */}
      <div className={`border-t border-white/10 ${isCollapsed ? 'p-2' : 'p-4'} transition-all duration-300`}>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleLogout}
            variant="secondary"
            icon={<LogOut className={`${isCollapsed ? 'w-4 h-4' : 'w-4 h-4'}`} />}
            className={`
              w-full bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm
              transition-all duration-300 group
              ${isCollapsed ? 'px-3 py-3 justify-center relative' : 'justify-start space-x-2'}
            `}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            {!isCollapsed && <span className="font-medium">Sign Out</span>}

            {/* Enhanced Tooltip for Collapsed Logout */}
            {isCollapsed && (
              <motion.div
                className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 pointer-events-none"
                initial={{ opacity: 0, x: -10 }}
                whileHover={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-gray-900/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap border border-white/10 shadow-lg shadow-black/20">
                  Sign Out
                  {/* Tooltip Arrow */}
                  <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-gray-900/95 rotate-45 border-l border-t border-white/10"></div>
                </div>
              </motion.div>
            )}
          </Button>
        </motion.div>
      </div>
    </aside>
  );
}
