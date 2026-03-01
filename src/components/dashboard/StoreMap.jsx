import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, Star, ChevronRight, Route } from 'lucide-react';
import { OPTIMIZED_CART, STORES } from '../../data/mockData';

export default function StoreMap() {
  const [selectedStore, setSelectedStore] = useState(null);
  const routeStores = OPTIMIZED_CART.storeGroups.map(g => g.store);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="glass-card p-5 lg:p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Percorso Ottimale</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {OPTIMIZED_CART.totalKm} km — {OPTIMIZED_CART.estimatedTime} min
            </p>
          </div>
        </div>
        <button className="btn-secondary text-xs px-4 py-2">
          <Navigation className="w-3.5 h-3.5 inline mr-1" />
          Naviga
        </button>
      </div>

      {/* Map placeholder with route visualization */}
      <div className="relative h-48 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-surface-700 dark:to-surface-800">
        {/* Simulated map background grid */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-500" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Route line */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
          <path
            d="M 60 160 C 100 140, 120 80, 180 70 S 280 50, 320 90 S 350 140, 360 120"
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeDasharray="8,4"
            opacity="0.8"
          />
          {/* Home */}
          <circle cx="60" cy="160" r="8" fill="#6366f1" stroke="white" strokeWidth="2" />
          <text x="60" y="185" textAnchor="middle" className="text-[9px] fill-gray-500 dark:fill-gray-400" fontWeight="600">Casa</text>

          {/* Store 1 */}
          <circle cx="180" cy="70" r="10" fill={routeStores[0]?.color || '#10b981'} stroke="white" strokeWidth="2" />
          <text x="180" y="60" textAnchor="middle" className="text-[10px] fill-white" fontWeight="bold">1</text>
          <text x="180" y="95" textAnchor="middle" className="text-[9px] fill-gray-500 dark:fill-gray-400" fontWeight="600">{routeStores[0]?.name}</text>

          {/* Store 2 */}
          <circle cx="300" cy="80" r="10" fill={routeStores[1]?.color || '#3b82f6'} stroke="white" strokeWidth="2" />
          <text x="300" y="70" textAnchor="middle" className="text-[10px] fill-white" fontWeight="bold">2</text>
          <text x="300" y="105" textAnchor="middle" className="text-[9px] fill-gray-500 dark:fill-gray-400" fontWeight="600">{routeStores[1]?.name}</text>

          {/* Store 3 */}
          <circle cx="360" cy="120" r="10" fill={routeStores[2]?.color || '#ef4444'} stroke="white" strokeWidth="2" />
          <text x="360" y="110" textAnchor="middle" className="text-[10px] fill-white" fontWeight="bold">3</text>
          <text x="360" y="145" textAnchor="middle" className="text-[9px] fill-gray-500 dark:fill-gray-400" fontWeight="600">{routeStores[2]?.name}</text>
        </svg>

        {/* Overlay gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/60 dark:from-surface-800/60 to-transparent" />
      </div>

      {/* Route steps */}
      <div className="space-y-2">
        {/* Start */}
        <div className="flex items-center gap-3 p-2.5 rounded-lg">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-900 dark:text-white">Partenza — Casa</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{OPTIMIZED_CART.route.start}</p>
          </div>
        </div>

        {OPTIMIZED_CART.route.stops.map((stop, i) => (
          <div key={i} className="flex items-center gap-3">
            {/* Connector */}
            <div className="flex flex-col items-center ml-[15px] -my-1">
              <div className="w-0.5 h-3 bg-brand-300 dark:bg-brand-700" />
            </div>
            <div className="flex-1 flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-white/5 -ml-[19px] pl-10">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 -ml-3"
                style={{ backgroundColor: routeStores[i]?.color }}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{stop}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {routeStores[i]?.hours}
                  </span>
                  {routeStores[i]?.openNow && (
                    <span className="badge-green text-[10px] py-0">Aperto</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  €{OPTIMIZED_CART.storeGroups[i]?.subtotal.toFixed(2)}
                </p>
                <p className="text-[10px] text-gray-400">
                  {OPTIMIZED_CART.storeGroups[i]?.items.length} prod.
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary bar */}
      <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Route className="w-3.5 h-3.5" />
            <span>{OPTIMIZED_CART.totalKm} km</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{OPTIMIZED_CART.estimatedTime} min</span>
          </div>
        </div>
        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
          Percorso ottimizzato AI
        </span>
      </div>
    </motion.div>
  );
}
