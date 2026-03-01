import { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, ArrowRight, ShoppingCart, Zap } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import ListeSpesa from './pages/ListeSpesa';
import Negozi from './pages/Negozi';
import Prezzi from './pages/Prezzi';
import AiAssistant from './pages/AiAssistant';
import Community from './pages/Community';
import Impostazioni from './pages/Impostazioni';

function CapOnboarding({ onComplete }) {
  const [cap, setCap] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleSubmit = () => {
    const val = cap.trim();
    if (val.length === 5 && /^\d{5}$/.test(val)) {
      localStorage.setItem('spesamax_cap', val);
      window.dispatchEvent(new CustomEvent('cap:changed', { detail: val }));
      onComplete();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card overflow-hidden">
          {/* Header */}
          <div className="gradient-brand p-6 pb-8 text-center text-white">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold">Benvenuto su SpesaMax!</h2>
            <p className="text-sm text-white/80 mt-2">
              Trova le migliori offerte e risparmia sulla spesa
            </p>
          </div>

          {/* CAP input */}
          <div className="p-6 -mt-4">
            <div className="glass-card p-5 border-2 border-brand-200 dark:border-brand-700/50 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Inserisci il tuo CAP</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Per mostrarti negozi e offerte nella tua zona</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="es. 20121"
                    value={cap}
                    onChange={e => setCap(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                    className="input-field pl-10 text-lg font-bold tracking-widest text-center"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={cap.length !== 5}
                  className="btn-primary px-6 flex items-center gap-2 disabled:opacity-40 text-base"
                >
                  Vai <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              {[
                { icon: ShoppingCart, label: 'Liste Smart', desc: 'Organizza la spesa' },
                { icon: MapPin, label: 'Negozi Vicini', desc: 'Trova offerte' },
                { icon: Navigation, label: 'Percorso', desc: 'Ottimizza il giro' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                  <Icon className="w-5 h-5 text-brand-500 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{label}</p>
                  <p className="text-[10px] text-gray-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const { isDark, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCapOnboarding, setShowCapOnboarding] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('spesamax_cap');
    if (!stored) setShowCapOnboarding(true);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0">
        <Header
          isDark={isDark}
          onToggleTheme={toggle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/liste" element={<ListeSpesa />} />
            <Route path="/negozi" element={<Negozi />} />
            <Route path="/prezzi" element={<Prezzi />} />
            <Route path="/ai" element={<AiAssistant />} />
            <Route path="/community" element={<Community />} />
            <Route path="/impostazioni" element={<Impostazioni />} />
          </Routes>
        </main>
      </div>

      {/* CAP onboarding modal */}
      <AnimatePresence>
        {showCapOnboarding && (
          <CapOnboarding onComplete={() => setShowCapOnboarding(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
