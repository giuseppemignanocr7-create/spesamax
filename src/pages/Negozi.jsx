import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Star, Clock, Navigation, Filter, Search,
  ChevronDown, ExternalLink, Phone, Globe, Heart, Loader2
} from 'lucide-react';
import api from '../services/api';
import { STORES } from '../data/mockData';

const CHAIN_URLS = {
  esselunga: 'https://www.esselunga.it/it-it/offerte.html',
  lidl: 'https://www.lidl.it/volantino',
  conad: 'https://www.conad.it/offerte-e-promozioni.html',
  coop: 'https://www.cooponline.it/offerte',
  carrefour: 'https://www.carrefour.it/offerte/volantino',
  eurospin: 'https://www.eurospin.it/offerte/',
  pam: 'https://www.pampanorama.it/offerte',
  md: 'https://www.mdspa.it/volantino/',
};

const DISTANCES = [5, 10, 25, 50];

function StoreCard({ store, index }) {
  const [liked, setLiked] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('liked_stores') || '[]');
    return saved.includes(store.id);
  });

  const toggleLike = () => {
    const saved = JSON.parse(localStorage.getItem('liked_stores') || '[]');
    const next = liked ? saved.filter(id => id !== store.id) : [...saved, store.id];
    localStorage.setItem('liked_stores', JSON.stringify(next));
    setLiked(!liked);
  };

  const openDirections = () => {
    const lat = store.latitude || 45.46;
    const lng = store.longitude || 9.19;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const openFlyer = () => {
    const chain = (store.chain || '').toLowerCase();
    const url = CHAIN_URLS[chain] || `https://www.google.com/search?q=${encodeURIComponent(store.name + ' volantino offerte')}`;
    window.open(url, '_blank');
  };

  const callStore = () => {
    const phone = store.phone || '';
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(store.name + ' ' + (store.address || '') + ' telefono')}`, '_blank');
    }
  };

  const dist = store.distance_km || store.distance || '?';
  const hours = store.hours || (store.opening_hours?.weekday) || '8:00-21:00';
  const isOpen = store.openNow !== undefined ? store.openNow : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass-card-hover p-5"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg"
          style={{ backgroundColor: store.color || '#10b981', boxShadow: `0 8px 20px ${store.color || '#10b981'}40` }}
        >
          {(store.logo || store.name?.[0] || '?')}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">{store.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{store.address}</p>
            </div>
            <button
              onClick={toggleLike}
              className={`p-2 rounded-lg transition-all ${liked ? 'text-red-500' : 'text-gray-300 dark:text-gray-600 hover:text-red-400'}`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-semibold">{dist} km</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="font-semibold">{store.rating || 4.0}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{hours}</span>
            </div>
            {store.products_count > 0 && (
              <span className="text-[10px] text-gray-400">{store.products_count} prodotti</span>
            )}
            {store.offers_count > 0 && (
              <span className="badge-red text-[10px]">{store.offers_count} offerte</span>
            )}
            {isOpen ? (
              <span className="badge-green text-[10px]">Aperto</span>
            ) : (
              <span className="badge-red text-[10px]">Chiuso</span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
            <button onClick={openDirections} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors">
              <Navigation className="w-3.5 h-3.5" />
              Indicazioni
            </button>
            <button onClick={openFlyer} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
              Volantino
            </button>
            <button onClick={callStore} className="py-2 px-3 rounded-lg text-xs text-gray-400 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" title="Chiama">
              <Phone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Negozi() {
  const [search, setSearch] = useState('');
  const [maxDistance, setMaxDistance] = useState(25);
  const [stores, setStores] = useState(STORES);
  const [loading, setLoading] = useState(true);
  const [cap, setCap] = useState(() => localStorage.getItem('spesamax_cap') || '');

  useEffect(() => {
    const handler = (e) => setCap(e.detail || localStorage.getItem('spesamax_cap') || '');
    window.addEventListener('cap:changed', handler);
    return () => window.removeEventListener('cap:changed', handler);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { radius: maxDistance };
    if (cap) params.cap = cap;
    api.getStores(params)
      .then(data => { if (data.stores?.length) setStores(data.stores); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [maxDistance, cap]);

  const filtered = stores.filter(s => {
    const q = search.toLowerCase();
    const nameMatch = (s.name || '').toLowerCase().includes(q) || (s.address || '').toLowerCase().includes(q) || (s.chain || '').toLowerCase().includes(q);
    const distMatch = !s.distance_km || s.distance_km <= maxDistance;
    return nameMatch && distMatch;
  });

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Negozi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filtered.length} negozi trovati nella tua zona
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Cerca negozio, catena o indirizzo..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10 text-sm" />
          </div>
          <div className="flex gap-2">
            {DISTANCES.map(d => (
              <button
                key={d}
                onClick={() => setMaxDistance(d)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  maxDistance === d
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {d} km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="glass-card p-1 mb-6 overflow-hidden">
        <div className="relative h-64 rounded-xl bg-gradient-to-br from-blue-50 to-green-50 dark:from-surface-700 dark:to-surface-800">
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-500" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#mapGrid)" />
            </svg>
          </div>

          {filtered.slice(0, 6).map((store, i) => {
            const positions = [
              { x: '20%', y: '30%' }, { x: '45%', y: '25%' }, { x: '65%', y: '45%' },
              { x: '30%', y: '60%' }, { x: '75%', y: '35%' }, { x: '55%', y: '70%' }
            ];
            return (
              <div key={store.id} className="absolute transform -translate-x-1/2 -translate-y-full group cursor-pointer" style={{ left: positions[i]?.x, top: positions[i]?.y }}>
                <div className="relative">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white dark:border-surface-800 group-hover:scale-125 transition-transform" style={{ backgroundColor: store.color || '#10b981' }}>
                    {(store.logo || store.name?.[0] || '?')[0]}
                  </div>
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <div className="glass-card px-2 py-1 text-[10px] font-semibold text-gray-900 dark:text-white shadow-lg">
                    {store.name} · {store.distance_km || store.distance || '?'} km
                  </div>
                </div>
              </div>
            );
          })}

          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg animate-pulse" />
            <div className="absolute -inset-3 rounded-full bg-blue-500/20 animate-ping" />
          </div>

          <div className="absolute bottom-3 left-3 glass-card px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
            <MapPin className="w-3.5 h-3.5 inline mr-1 text-brand-500" />
            Milano · entro {maxDistance} km
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((store, i) => (
            <StoreCard key={store.id} store={store} index={i} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-400">
              <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nessun negozio trovato. Prova ad allargare il raggio di ricerca.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
