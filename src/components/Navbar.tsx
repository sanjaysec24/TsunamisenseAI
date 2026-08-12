import React, { useState } from 'react';
import { Waves, Activity, Map, History, Bot, BookOpen, Info, Menu, X, Globe, Radio, Database } from 'lucide-react';
import { AppRoute } from '../types';
import { StatusBadge } from './StatusBadge';

interface NavbarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { route: AppRoute; label: string; icon: React.ReactNode }[] = [
    { route: '/', label: 'Overview', icon: <Waves className="w-4 h-4" /> },
    { route: '/monitor', label: 'Monitor', icon: <Radio className="w-4 h-4" /> },
    { route: '/data-engine', label: 'Data Engine', icon: <Database className="w-4 h-4" /> },
    { route: '/analyze', label: 'Analyze', icon: <Activity className="w-4 h-4" /> },
    { route: '/map', label: 'Global Map', icon: <Map className="w-4 h-4" /> },
    { route: '/history', label: 'History', icon: <History className="w-4 h-4" /> },
    { route: '/analyst', label: 'AI Analyst', icon: <Bot className="w-4 h-4" /> },
    { route: '/methodology', label: 'Methodology', icon: <BookOpen className="w-4 h-4" /> },
    { route: '/about', label: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  const handleNavClick = (route: AppRoute) => {
    onNavigate(route);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#060c18]/90 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/30 text-cyan-400 group-hover:border-cyan-400 group-hover:text-cyan-300 transition-all shadow-md shadow-cyan-950/40">
            <Waves className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-slate-100 group-hover:text-cyan-300 transition-colors">
                TSUNAMISENSE <span className="text-cyan-400 font-semibold">AI</span>
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 tracking-wider hidden sm:block">
              EARLY-WARNING DECISION SUPPORT
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => handleNavClick(item.route)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span className={isActive ? 'text-cyan-400' : 'opacity-70'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* System Status Indicator */}
        <div className="hidden sm:flex items-center gap-3" title="System operational for research & decision support. Not an official tsunami warning system.">
          <StatusBadge
            label="SYSTEM OPERATIONAL"
            variant="success"
            pulse
            size="sm"
            icon={<Globe className="w-3.5 h-3.5" />}
          />
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <StatusBadge
            label="OPERATIONAL"
            variant="success"
            pulse
            size="sm"
          />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-[#081021]/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-1 animate-fade-in">
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => handleNavClick(item.route)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-4 mt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between px-2">
            <span>IBM Datathon Project</span>
            <span>Phase 0 — Foundation</span>
          </div>
        </div>
      )}
    </header>
  );
};
