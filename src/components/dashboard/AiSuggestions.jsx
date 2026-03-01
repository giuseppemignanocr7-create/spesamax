import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, ChevronRight, X, ArrowDownRight, TrendingDown } from 'lucide-react';
import { AI_SUGGESTIONS } from '../../data/mockData';

function SuggestionCard({ suggestion, index, onDismiss }) {
  const priorityStyles = {
    high: 'border-l-4 border-l-red-400 dark:border-l-red-500',
    medium: 'border-l-4 border-l-amber-400 dark:border-l-amber-500',
    low: 'border-l-4 border-l-blue-400 dark:border-l-blue-500',
  };

  const typeColors = {
    substitute: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    price_alert: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    timing: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    bundle: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    insight: 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400',
  };

  const formatMessage = (msg) => {
    return msg.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={`relative group p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors ${priorityStyles[suggestion.priority]}`}
    >
      <button
        onClick={() => onDismiss(suggestion.id)}
        className="absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 transition-all"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg ${typeColors[suggestion.type]}`}>
          {suggestion.icon}
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{suggestion.title}</h4>
            {suggestion.priority === 'high' && (
              <span className="badge-red text-[10px]">Urgente</span>
            )}
          </div>
          <p
            className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatMessage(suggestion.message) }}
          />
          {suggestion.savings > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <ArrowDownRight className="w-3.5 h-3.5 text-brand-500" />
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                Risparmi €{suggestion.savings.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function AiSuggestions() {
  const [suggestions, setSuggestions] = useState(AI_SUGGESTIONS);
  const [showAll, setShowAll] = useState(false);

  const displayed = showAll ? suggestions : suggestions.slice(0, 3);
  const totalSavings = suggestions.reduce((sum, s) => sum + s.savings, 0);

  const handleDismiss = (id) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-5 lg:p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">AI Assistant</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {suggestions.length} suggerimenti — risparmi potenziali €{totalSavings.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-semibold animate-pulse-slow">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Attivo</span>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {displayed.map((suggestion, i) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              index={i}
              onDismiss={handleDismiss}
            />
          ))}
        </AnimatePresence>
      </div>

      {suggestions.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/5 transition-colors"
        >
          {showAll ? 'Mostra meno' : `Vedi tutti (${suggestions.length})`}
          <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
        </button>
      )}
    </motion.div>
  );
}
