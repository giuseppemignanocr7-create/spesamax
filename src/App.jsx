import { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, ArrowRight, ShoppingCart, Zap, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from './hooks/useTheme';
import { geocodeCap, storeLocation } from './utils/geocode';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import ListeSpesa from './pages/ListeSpesa';
import Negozi from './pages/Negozi';
import Prezzi from './pages/Prezzi';
import AiAssistant from './pages/AiAssistant';
import Community from './pages/Community';
import Impostazioni from './pages/Impostazioni';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);border:3px solid white;box-shadow:0 4px 14px rgba(16,185,129,0.4);display:flex;align-items:center;justify-content:center">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, zoom, { duration: 1.5 }); }, [center, zoom, map]);
  return null;
}

function CapOnboarding({ onComplete }) {
  const [step, setStep] = useState(1); // 1=enter CAP, 2=confirm on map
  const [cap, setCap] = useState('');
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const [cityName, setCityName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (step === 1 && inputRef.current) inputRef.current.focus();
  }, [step]);

  const handleSearch = async () => {
    const val = cap.trim();
    if (val.length !== 5 || !/^\d{5}$/.test(val)) return;
    setLoading(true);
    try {
      const result = await geocodeCap(val);
      setCoords({ lat: result.lat, lng: result.lng });
      setCityName(result.city || '');
      setStep(2);
    } catch {
      alert('Impossibile trovare il CAP. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    storeLocation(cap, { lat: coords.lat, lng: coords.lng, city: cityName });
    window.dispatchEvent(new CustomEvent('cap:changed', { detail: cap }));
    onComplete();
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
        className="w-full max-w-lg"
      >
        <div className="glass-card overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {/* Step 1: Enter CAP */}
                <div className="gradient-brand p-6 pb-8 text-center text-white">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-extrabold">Dove fai la spesa?</h2>
                  <p className="text-sm text-white/80 mt-2">
                    Inserisci il CAP per trovare negozi e offerte vicino a te
                  </p>
                </div>

                <div className="p-6 -mt-4">
                  <div className="glass-card p-5 border-2 border-brand-200 dark:border-brand-700/50 shadow-xl">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400" />
                        <input
                          ref={inputRef}
                          type="text"
                          inputMode="numeric"
                          maxLength={5}
                          placeholder="Inserisci CAP (es. 20121)"
                          value={cap}
                          onChange={e => setCap(e.target.value.replace(/\D/g, '').slice(0, 5))}
                          onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                          className="input-field pl-11 text-lg font-bold tracking-wider"
                        />
                      </div>
                      <button
                        onClick={handleSearch}
                        disabled={cap.length !== 5 || loading}
                        className="btn-primary px-6 flex items-center gap-2 disabled:opacity-40 text-base"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Navigation className="w-4 h-4" /> Cerca</>}
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
              </motion.div>
            )}

            {step === 2 && coords && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                {/* Step 2: Confirm location on map */}
                <div className="relative">
                  <div className="h-[300px] w-full">
                    <MapContainer
                      center={[coords.lat, coords.lng]}
                      zoom={14}
                      scrollWheelZoom={true}
                      zoomControl={false}
                      className="h-full w-full"
                      style={{ borderRadius: '1rem 1rem 0 0' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <FlyTo center={[coords.lat, coords.lng]} zoom={14} />
                      <Marker position={[coords.lat, coords.lng]} icon={userIcon} />
                      <Circle
                        center={[coords.lat, coords.lng]}
                        radius={2000}
                        pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.08, weight: 2 }}
                      />
                    </MapContainer>
                  </div>

                  {/* Back button */}
                  <button
                    onClick={() => setStep(1)}
                    className="absolute top-3 left-3 z-[1000] p-2 rounded-xl bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-surface-700 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>

                {/* Confirm panel */}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                        {cityName || 'La tua zona'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">CAP {cap}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirm}
                    className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Conferma e inizia a risparmiare
                  </button>

                  <button
                    onClick={() => setStep(1)}
                    className="w-full mt-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 py-2 transition-colors"
                  >
                    Cambia CAP
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
