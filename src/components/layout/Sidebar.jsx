import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingCart, MapPin, BarChart3,
  Bot, Users, Settings, X, Crown, TrendingUp, Zap, Navigation, Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { USER_PROFILE } from '../../data/mockData';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/liste', icon: ShoppingCart, label: 'Liste Spesa' },
  { to: '/negozi', icon: MapPin, label: 'Negozi' },
  { to: '/prezzi', icon: BarChart3, label: 'Prezzi' },
  { to: '/ai', icon: Bot, label: 'AI Assistant' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/impostazioni', icon: Settings, label: 'Impostazioni' },
];

function CapWidget() {
  const [cap, setCap] = useState(() => localStorage.getItem('spesamax_cap') || '');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(cap);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const save = () => {
    const val = draft.trim();
    if (val.length === 5 && /^\d{5}$/.test(val)) {
      setCap(val);
      localStorage.setItem('spesamax_cap', val);
      window.dispatchEvent(new CustomEvent('cap:changed', { detail: val }));
      setEditing(false);
    }
  };

  if (!cap && !editing) {
    return (
      <div className="px-4 pb-2">
        <button
          onClick={() => { setEditing(true); setDraft(''); }}
          className="w-full flex items-center gap-2.5 p-3 rounded-xl border-2 border-dashed border-brand-300 dark:border-brand-700 bg-brand-50/50 dark:bg-brand-500/5 hover:bg-brand-100 dark:hover:bg-brand-500/10 transition-colors"
        >
          <Navigation className="w-5 h-5 text-brand-500" />
          <div className="text-left">
            <p className="text-sm font-bold text-brand-700 dark:text-brand-300">Inserisci il tuo CAP</p>
            <p className="text-[10px] text-brand-500/70 dark:text-brand-400/70">Per trovare negozi e offerte vicino a te</p>
          </div>
        </button>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-700/50">
          <Navigation className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="20121"
            value={draft}
            onChange={e => setDraft(e.target.value.replace(/\D/g, '').slice(0, 5))}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setEditing(false); setDraft(cap); } }}
            className="flex-1 bg-transparent text-sm font-bold text-brand-700 dark:text-brand-300 placeholder-brand-300 dark:placeholder-brand-600 outline-none w-0"
          />
          <button
            onClick={save}
            disabled={draft.length !== 5}
            className="p-1.5 rounded-lg bg-brand-500 text-white disabled:opacity-30 hover:bg-brand-600 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-2">
      <button
        onClick={() => { setEditing(true); setDraft(cap); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-brand-50 dark:bg-brand-500/5 hover:bg-brand-100 dark:hover:bg-brand-500/10 border border-brand-200/50 dark:border-brand-800/30 transition-colors group"
      >
        <Navigation className="w-4 h-4 text-brand-500" />
        <div className="flex-1 text-left">
          <p className="text-xs text-brand-600/70 dark:text-brand-400/70">La tua zona</p>
          <p className="text-sm font-extrabold text-brand-700 dark:text-brand-300">{cap}</p>
        </div>
        <span className="text-[10px] font-semibold text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">Cambia</span>
      </button>
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const profile = user || USER_PROFILE;
  const displayName = user ? `${user.name} ${user.surname}` : `${USER_PROFILE.name} ${USER_PROFILE.surname}`;
  const initials = user ? `${user.name[0]}${user.surname[0]}` : `${USER_PROFILE.name[0]}${USER_PROFILE.surname[0]}`;
  const isPremium = user ? user.plan === 'premium' : USER_PROFILE.isPremium;
  const totalSavings = user?.total_savings ?? USER_PROFILE.totalSavings;
  const monthlySavings = user?.monthly_savings ?? USER_PROFILE.monthlySavings;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 flex flex-col
          bg-white/90 dark:bg-surface-800/90 backdrop-blur-xl
          border-r border-gray-200/50 dark:border-white/5
          transform transition-transform duration-300 ease-out
          lg:relative lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-gray-200/50 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                Spesa<span className="text-gradient">Max</span>
              </h1>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User card */}
        <div className="px-4 py-4">
          <div className="glass-card p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {displayName}
              </p>
              <div className="flex items-center gap-1.5">
                {isPremium && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <Crown className="w-3 h-3" /> Premium
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Risparmiati</p>
              <p className="text-sm font-bold text-brand-600 dark:text-brand-400">€{totalSavings}</p>
            </div>
          </div>
        </div>

        {/* CAP selector */}
        <CapWidget />

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Savings summary */}
        <div className="px-4 pb-4">
          <div className="p-4 rounded-2xl gradient-brand-soft border border-brand-200/50 dark:border-brand-800/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">Questo mese</span>
            </div>
            <p className="text-2xl font-extrabold text-brand-700 dark:text-brand-300">
              €{monthlySavings}
            </p>
            <p className="text-xs text-brand-600/70 dark:text-brand-400/70 mt-1">
              risparmiati questo mese
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
