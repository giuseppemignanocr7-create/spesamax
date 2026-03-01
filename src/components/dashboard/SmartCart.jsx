import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, ChevronDown, ChevronUp, Tag, Clock,
  ExternalLink, Check, Flame
} from 'lucide-react';
import { OPTIMIZED_CART } from '../../data/mockData';

function StoreGroup({ group, index }) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15 }}
      className="border border-gray-200/50 dark:border-white/5 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        {/* Store logo */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: group.store.color }}
        >
          {group.store.logo}
        </div>

        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900 dark:text-white">{group.store.name}</span>
            <span className="text-xs text-gray-400">{group.store.distance} km</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {group.items.length} prodotti
            </span>
            {group.items.some(i => i.isOffer) && (
              <span className="badge-green text-[10px]">
                <Flame className="w-3 h-3" /> Offerte attive
              </span>
            )}
          </div>
        </div>

        <div className="text-right mr-2">
          <p className="text-lg font-bold text-gray-900 dark:text-white">€{group.subtotal.toFixed(2)}</p>
        </div>

        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {group.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-white/5"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-xs">
                    {item.product.brand[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.product.brand} {item.product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.product.weight} {item.quantity > 1 ? `x${item.quantity}` : ''}
                      </span>
                      {item.isOffer && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 dark:text-red-400">
                          <Clock className="w-3 h-3" />
                          Scade {new Date(item.offerEnd).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      €{(item.price * item.quantity).toFixed(2)}
                    </p>
                    {item.isOffer && (
                      <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">OFFERTA</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SmartCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-5 lg:p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Carrello Ottimizzato</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Spesa Settimanale — {OPTIMIZED_CART.storeGroups.reduce((a, g) => a + g.items.length, 0)} prodotti
            </p>
          </div>
        </div>
        <button className="btn-secondary text-xs px-4 py-2">
          <ExternalLink className="w-3.5 h-3.5 inline mr-1" />
          Dettaglio
        </button>
      </div>

      <div className="space-y-3">
        {OPTIMIZED_CART.storeGroups.map((group, i) => (
          <StoreGroup key={group.store.id} group={group} index={i} />
        ))}
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Totale ottimizzato</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-400 line-through">€{OPTIMIZED_CART.totalSingleStore}</span>
              <span className="badge-green">-{OPTIMIZED_CART.savingsPercent}%</span>
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
            €{OPTIMIZED_CART.totalOptimized}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
