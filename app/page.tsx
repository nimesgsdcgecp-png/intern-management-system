"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  Shield,
  Target,
  Command
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCTA = () => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session?.user) {
      const role = (session.user as any)?.role;
      router.push(`/dashboard/${role}`);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700 transition-colors duration-500 overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 border-b border-gray-100 py-4 shadow-sm" : "bg-transparent py-8"
      }`}>
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center text-slate-600">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => router.push("/")}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Zap className="text-white w-5 h-5" fill="currentColor" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight uppercase italic">
              Intern <span className="text-indigo-600">Hub</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#solutions" className="hover:text-indigo-600 transition-colors">Solutions</a>
            <a href="#testimonials" className="hover:text-indigo-600 transition-colors">Feedback</a>
          </div>

          <div className="flex items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCTA}
              className="bg-slate-900 text-white px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2 group italic"
            >
              {status === "authenticated" ? "Dashboard" : "Get Started"}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-48 pb-32">
          <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial="initial"
              animate="animate"
              className="space-y-10"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100">
                Internship Management
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-6xl lg:text-7xl font-black tracking-tighter text-slate-900 leading-tight uppercase italic">
                Modern <br />
                <span className="text-indigo-600">Internship Hub</span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-lg text-slate-500 leading-relaxed max-w-xl font-medium">
                A simple and effective platform to manage your interns and track their progress in real-time.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleCTA}
                  className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all italic"
                >
                  Start Now
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="flex items-center justify-center px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all">
                  Learn More
                </button>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative hidden lg:block"
            >
              <div className="bg-slate-50 rounded-4xl border border-slate-100 p-8">
                <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                   <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                   </div>
                   <div className="p-8 aspect-video flex flex-col gap-6">
                      <div className="flex gap-4">
                         <div className="w-1/3 h-20 bg-slate-50 rounded-2xl border border-slate-100" />
                         <div className="w-1/3 h-20 bg-slate-50 rounded-2xl border border-slate-100" />
                         <div className="w-1/3 h-20 bg-slate-50 rounded-2xl border border-slate-100" />
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                         System Overview
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 relative border-t border-slate-50">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center max-w-3xl mx-auto mb-24">
              <h2 className="text-indigo-600 font-black tracking-[0.3em] uppercase text-[10px] mb-6 italic">Platform Features</h2>
              <h3 className="text-5xl lg:text-6xl font-black text-slate-900 mb-8 tracking-tighter uppercase italic">Designed for Everyone.</h3>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">A simple platform bridging the gap between interns and their mentors.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  role: "The Managers",
                  title: "Admins",
                  desc: "Complete control over users, departments, and system settings.",
                  icon: <Shield className="w-8 h-8 text-indigo-600" />
                },
                {
                  role: "The Guides",
                  title: "Mentors",
                  desc: "Monitor intern progress, review logs, and provide expert feedback.",
                  icon: <Target className="w-8 h-8 text-indigo-600" />
                },
                {
                  role: "The Performers",
                  title: "Interns",
                  desc: "Log daily work, track tasks, and follow their own growth journey.",
                  icon: <Command className="w-8 h-8 text-indigo-600" />
                }
              ].map((card, i) => (
                <div 
                  key={i}
                  className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-indigo-50 transition-colors">
                    {card.icon}
                  </div>
                  <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4 italic">{card.role}</div>
                  <h4 className="text-2xl font-black text-slate-900 mb-6 tracking-tight uppercase italic">{card.title}</h4>
                  <p className="text-slate-500 font-medium mb-10 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Access CTA */}
        <section className="py-48 bg-slate-900 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-8 relative z-10 text-center">
            <div className="text-white">
              <h2 className="text-5xl lg:text-7xl font-black mb-10 tracking-tighter uppercase italic leading-none">
                Ready to manage <br className="hidden md:block" /> your interns?
              </h2>
              <p className="text-xl text-slate-400 mb-16 max-w-2xl mx-auto font-medium">
                Join organizations worldwide using Intern Hub to build the workforce of tomorrow.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-8 justify-center items-center relative z-10">
                <button 
                  onClick={handleCTA}
                  className="bg-white text-slate-900 px-12 py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all active:scale-95 italic"
                >
                  Get Started
                </button>
                <Link href="#" className="text-slate-400 hover:text-white font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 group italic">
                  Learn More
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-24 border-t border-slate-100 px-8 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-20 mb-20">
            <div className="space-y-8 max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Zap className="text-white w-5 h-5" fill="currentColor" />
                </div>
                <span className="text-xl font-black text-slate-900 uppercase italic tracking-widest leading-none">
                  Intern <span className="text-indigo-600">Hub</span>
                </span>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed">
                Empowering the next generation of talent through simple and effective management tools.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-20">
               <div className="space-y-6">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Platform</div>
                  <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                     <li className="hover:text-indigo-600 cursor-pointer transition-colors">Analytics</li>
                     <li className="hover:text-indigo-600 cursor-pointer transition-colors">Management</li>
                  </ul>
               </div>
               <div className="space-y-6">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Connect</div>
                  <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                     <li className="hover:text-indigo-600 cursor-pointer transition-colors">Support</li>
                     <li className="hover:text-indigo-600 cursor-pointer transition-colors">Contact</li>
                  </ul>
               </div>
            </div>
          </div>
          
          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] italic">
              © {new Date().getFullYear()} Intern Hub — Modern Support
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
