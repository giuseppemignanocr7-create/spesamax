import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ShoppingCart, MoreVertical, Trash2, Edit3, Copy,
  Share2, Check, X, ChevronDown, ChevronUp, Tag, Clock,
  Sparkles, GripVertical, Search
} from 'lucide-react';
import { SHOPPING_LISTS, CURRENT_CART, PRODUCTS, PRICES, STORES } from '../data/mockData';

function getBestPrice(productId) {
  const productPrices = PRICES.filter(p => p.productId === productId);
  if (!productPrices.length) return null;
  let best = productPrices[0];
  for (const pp of productPrices) {
    const effectivePrice = pp.offerPrice || pp.price;
    const bestEffective = best.offerPrice || best.price;
    if (effectivePrice < bestEffective) best = pp;
  }
  return { ...best, effectivePrice: best.offerPrice || best.price };
}

function ListCard({ list, isSelected, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
        isSelected
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 shadow-lg shadow-brand-500/10'
          : 'border-gray-200/50 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 bg-white dark:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: list.color }}
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{list.name}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {list.itemCount} prodotti · Aggiornata {list.lastUpdated}
          </p>
        </div>
        {list.isActive && (
          <span className="badge-green text-[10px]">Attiva</span>
        )}
      </div>
    </motion.button>
  );
}

function CartItem({ item, index }) {
  const product = PRODUCTS.find(p => p.id === item.productId);
  const bestPrice = getBestPrice(item.productId);
  const store = bestPrice ? STORES.find(s => s.id === bestPrice.storeId) : null;
  const [checked, setChecked] = useState(false);

  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
        checked ? 'bg-brand-50/50 dark:bg-brand-500/5 opacity-60' : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/8'
      }`}
    >
      <button
        onClick={() => setChecked(!checked)}
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          checked
            ? 'bg-brand-500 border-brand-500 text-white'
            : 'border-gray-300 dark:border-gray-600 hover:border-brand-400'
        }`}
      >
        {checked && <Check className="w-3.5 h-3.5" />}
      </button>

      <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 cursor-grab flex-shrink-0" />

      <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">
        {product.brand[0]}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold text-gray-900 dark:text-white truncate ${checked ? 'line-through' : ''}`}>
          {product.brand} {product.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500 dark:text-gray-400">{product.weight}</span>
          {item.quantity > 1 && (
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">x{item.quantity}</span>
          )}
          {bestPrice?.offerPrice && (
            <span className="badge-red text-[10px]">
              <Tag className="w-3 h-3" /> Offerta
            </span>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-gray-900 dark:text-white">
          €{((bestPrice?.effectivePrice || 0) * item.quantity).toFixed(2)}
        </p>
        {store && (
          <div className="flex items-center gap-1 mt-0.5">
            <div
              className="w-3 h-3 rounded text-[6px] text-white flex items-center justify-center font-bold"
              style={{ backgroundColor: store.color }}
            >
              {store.logo[0]}
            </div>
            <span className="text-[10px] text-gray-400">{store.name}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ListeSpesa() {
  const [selectedList, setSelectedList] = useState('list_001');
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const totalItems = CURRENT_CART.items.length;
  const totalCost = CURRENT_CART.items.reduce((sum, item) => {
    const best = getBestPrice(item.productId);
    return sum + (best?.effectivePrice || 0) * item.quantity;
  }, 0);

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Liste della Spesa</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestisci e ottimizza le tue liste
          </p>
        </div>
        <button
          onClick={() => setShowNewList(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuova Lista
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar - Lists */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-3">
          {/* New list form */}
          <AnimatePresence>
            {showNewList && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card p-4"
              >
                <input
                  type="text"
                  placeholder="Nome della lista..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  autoFocus
                  className="input-field text-sm mb-3"
                />
                <div className="flex gap-2">
                  <button className="btn-primary text-xs flex-1 py-2">Crea</button>
                  <button
                    onClick={() => setShowNewList(false)}
                    className="btn-secondary text-xs py-2 px-3"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {SHOPPING_LISTS.map(list => (
            <ListCard
              key={list.id}
              list={list}
              isSelected={selectedList === list.id}
              onClick={() => setSelectedList(list.id)}
            />
          ))}

          {/* Quick stats */}
          <div className="glass-card p-4 mt-4">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Riepilogo
            </h4>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Prodotti</span>
                <span className="font-bold text-gray-900 dark:text-white">{totalItems}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Costo stimato</span>
                <span className="font-bold text-gray-900 dark:text-white">€{totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Negozi consigliati</span>
                <span className="font-bold text-brand-600 dark:text-brand-400">3</span>
              </div>
              <div className="pt-2 border-t border-gray-200/50 dark:border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Risparmio stimato</span>
                  <span className="font-extrabold text-brand-600 dark:text-brand-400">€13.40</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content - Items */}
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="glass-card p-5 lg:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {SHOPPING_LISTS.find(l => l.id === selectedList)?.name || 'Lista'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search within list */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca nella lista o aggiungi prodotto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 text-sm"
              />
            </div>

            {/* Items */}
            <div className="space-y-2">
              {CURRENT_CART.items.map((item, i) => (
                <CartItem key={item.productId} item={item} index={i} />
              ))}
            </div>

            {/* Add item */}
            <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-400 hover:border-brand-300 hover:text-brand-500 dark:hover:border-brand-700 dark:hover:text-brand-400 transition-all">
              <Plus className="w-4 h-4" />
              Aggiungi prodotto
            </button>

            {/* Bottom actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-200/50 dark:border-white/5">
              <button className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Ottimizza con AI
              </button>
              <button className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Vai al Carrello
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
