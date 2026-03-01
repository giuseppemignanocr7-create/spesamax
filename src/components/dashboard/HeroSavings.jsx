import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowRight, MapPin, Clock, ShoppingBag, Sparkles } from 'lucide-react';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';
import { OPTIMIZED_CART, WEEKLY_STATS } from '../../data/mockData';

export default function HeroSavings() {
  const navigate = useNavigate();
  const savings = useAnimatedCounter(OPTIMIZED_CART.savings, 2000);
  const percent = useAnimatedCounter(OPTIMIZED_CART.savingsPercent, 2000, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl gradient-brand p-6 lg:p-8 text-white shadow-2xl shadow-brand-500/30"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-white/80">Piano Spesa Ottimizzato</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
              Risparmi €{savings}
            </h2>
            <p className="text-white/70 mt-1 text-sm">
              <span className="text-white font-semibold">-{percent}%</span> rispetto a comprare tutto in un solo negozio
            </p>
          </div>

          <div className="hidden lg:block text-right">
            <div className="text-xs text-white/60 mb-1">Spesa totale ottimizzata</div>
            <div className="text-2xl font-bold">€{OPTIMIZED_CART.totalOptimized}</div>
            <div className="text-xs text-white/60 mt-1">
              vs €{OPTIMIZED_CART.totalSingleStore} in un negozio
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="w-4 h-4 text-white/70" />
              <span className="text-xs text-white/70">Negozi</span>
            </div>
            <p className="text-xl font-bold">{OPTIMIZED_CART.storeGroups.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-white/70" />
              <span className="text-xs text-white/70">Percorso</span>
            </div>
            <p className="text-xl font-bold">{OPTIMIZED_CART.totalKm} km</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-white/70" />
              <span className="text-xs text-white/70">Tempo</span>
            </div>
            <p className="text-xl font-bold">{OPTIMIZED_CART.estimatedTime} min</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => navigate('/liste')} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-brand-700 font-bold shadow-lg hover:shadow-xl hover:bg-white/95 active:scale-[0.98] transition-all duration-200">
            Vedi Piano Completo
            <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => navigate('/negozi')} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/15 backdrop-blur-sm text-white font-semibold border border-white/20 hover:bg-white/25 active:scale-[0.98] transition-all duration-200">
            <MapPin className="w-4 h-4" />
            Vedi Negozi
          </button>
        </div>

        {/* Savings vs last week */}
        <div className="mt-4 flex items-center gap-2 text-sm text-white/70">
          <TrendingUp className="w-4 h-4 text-white" />
          <span>
            <span className="text-white font-semibold">+€{WEEKLY_STATS.savingsVsLastWeek}</span> rispetto alla settimana scorsa ({'+' + WEEKLY_STATS.savingsVsLastWeekPercent}%)
          </span>
        </div>
      </div>
    </motion.div>
  );
}
