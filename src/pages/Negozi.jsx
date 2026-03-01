import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Star, Clock, Navigation, Filter, Search,
  ChevronDown, ExternalLink, Phone, Globe, Heart
} from 'lucide-react';
import { STORES } from '../data/mockData';

const CATEGORIES = ['Tutti', 'Alimentare', 'Bricolage', 'Elettronica', 'Farmacia', 'Pet', 'Garden', 'Sport'];
const DISTANCES = ['5 km', '10 km', '25 km', '50 km'];

function StoreCard({ store, index }) {
  const [liked, setLiked] = useState(false);

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
          style={{ backgroundColor: store.color, boxShadow: `0 8px 20px ${store.color}40` }}
        >
          {store.logo}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">{store.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{store.address}</p>
            </div>
            <button
              onClick={() => setLiked(!liked)}
              className={`p-2 rounded-lg transition-all ${
                liked ? 'text-red-500' : 'text-gray-300 dark:text-gray-600 hover:text-red-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-semibold">{store.distance} km</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="font-semibold">{store.rating}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{store.hours}</span>
            </div>
            {store.openNow ? (
              <span className="badge-green text-[10px]">Aperto ora</span>
            ) : (
              <span className="badge-red text-[10px]">Chiuso</span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors">
              <Navigation className="w-3.5 h-3.5" />
              Indicazioni
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
              Volantino
            </button>
            <button className="py-2 px-3 rounded-lg text-xs text-gray-400 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
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
  const [category, setCategory] = useState('Tutti');
  const [distance, setDistance] = useState('25 km');
  const [view, setView] = useState('list');

  const filtered = STORES.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.address.toLowerCase().includes(search.toLowerCase())
  );

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
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca negozio o indirizzo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 text-sm"
            />
          </div>

          {/* Distance */}
          <div className="flex gap-2">
            {DISTANCES.map(d => (
              <button
                key={d}
                onClick={() => setDistance(d)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  distance === d
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                category === cat
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
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

          {/* Store pins on map */}
          {STORES.slice(0, 6).map((store, i) => {
            const positions = [
              { x: '20%', y: '30%' }, { x: '45%', y: '25%' }, { x: '65%', y: '45%' },
              { x: '30%', y: '60%' }, { x: '75%', y: '35%' }, { x: '55%', y: '70%' }
            ];
            return (
              <div
                key={store.id}
                className="absolute transform -translate-x-1/2 -translate-y-full group cursor-pointer"
                style={{ left: positions[i].x, top: positions[i].y }}
              >
                <div className="relative">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white dark:border-surface-800 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: store.color }}
                  >
                    {store.logo[0]}
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style={{ backgroundColor: store.color }} />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <div className="glass-card px-2 py-1 text-[10px] font-semibold text-gray-900 dark:text-white shadow-lg">
                    {store.name} · {store.distance} km
                  </div>
                </div>
              </div>
            );
          })}

          {/* Center marker (user) */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg animate-pulse" />
            <div className="absolute -inset-3 rounded-full bg-blue-500/20 animate-ping" />
          </div>

          <div className="absolute bottom-3 left-3 glass-card px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
            <MapPin className="w-3.5 h-3.5 inline mr-1 text-brand-500" />
            CAP 20121 · Milano
          </div>
        </div>
      </div>

      {/* Store list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((store, i) => (
          <StoreCard key={store.id} store={store} index={i} />
        ))}
      </div>
    </div>
  );
}
