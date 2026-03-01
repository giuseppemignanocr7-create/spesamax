import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ShoppingCart, MoreVertical, Trash2, Edit3, Copy,
  Share2, Check, X, ChevronDown, ChevronUp, Tag, Clock,
  Sparkles, GripVertical, Search, Loader2, AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { SHOPPING_LISTS, CURRENT_CART, PRODUCTS, PRICES, STORES } from '../data/mockData';

function ListCard({ list, isSelected, onClick, onDelete }) {
  const itemsText = list.items_count != null ? `${list.items_count} prodotti` : `${list.itemCount || 0} prodotti`;
  const checkedText = list.checked_count ? ` · ${list.checked_count} spuntati` : '';
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative group">
      <button
        onClick={onClick}
        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
          isSelected
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 shadow-lg shadow-brand-500/10'
            : 'border-gray-200/50 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 bg-white dark:bg-white/5'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: list.color || '#10b981' }} />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{list.name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{itemsText}{checkedText}</p>
          </div>
          {list.is_optimized ? (
            <span className="badge-green text-[10px]">Ottimizzata</span>
          ) : list.isActive ? (
            <span className="badge-green text-[10px]">Attiva</span>
          ) : null}
        </div>
      </button>
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(list.id); }}
          className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-300 hover:text-red-500 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
}

function CartItem({ item, index, onToggle, onDelete }) {
  const name = item.product_name || item.custom_name || '';
  const brand = item.brand || '';
  const weight = item.weight || '';
  const isChecked = !!item.is_checked;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
        isChecked ? 'bg-brand-50/50 dark:bg-brand-500/5 opacity-60' : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/8'
      }`}
    >
      <button
        onClick={() => onToggle(item.id, !isChecked)}
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          isChecked
            ? 'bg-brand-500 border-brand-500 text-white'
            : 'border-gray-300 dark:border-gray-600 hover:border-brand-400'
        }`}
      >
        {isChecked && <Check className="w-3.5 h-3.5" />}
      </button>

      <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">
        {(brand || name)[0]?.toUpperCase() || '?'}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold text-gray-900 dark:text-white truncate ${isChecked ? 'line-through' : ''}`}>
          {brand} {name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {weight && <span className="text-xs text-gray-500 dark:text-gray-400">{weight}</span>}
          {item.quantity > 1 && (
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">x{item.quantity}</span>
          )}
          {item.best_price && item.best_store_name && (
            <span className="text-[10px] text-gray-400">miglior prezzo: {item.best_store_name}</span>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0 flex items-center gap-2">
        {item.best_price && (
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            €{(item.best_price * (item.quantity || 1)).toFixed(2)}
          </p>
        )}
        <button
          onClick={() => onDelete(item.id)}
          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-300 hover:text-red-500 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export default function ListeSpesa() {
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const [listItems, setListItems] = useState([]);
  const [listDetail, setListDetail] = useState(null);
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [useMock, setUseMock] = useState(false);

  // Load lists
  const fetchLists = useCallback(async () => {
    try {
      const data = await api.getLists();
      if (data.lists?.length) {
        setLists(data.lists);
        if (!selectedListId) setSelectedListId(data.lists[0].id);
      } else {
        setUseMock(true);
        setLists(SHOPPING_LISTS);
        setSelectedListId('list_001');
      }
    } catch {
      setUseMock(true);
      setLists(SHOPPING_LISTS);
      setSelectedListId('list_001');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLists(); }, [fetchLists]);

  // Load selected list items
  useEffect(() => {
    if (!selectedListId || useMock) {
      setListItems(CURRENT_CART.items.map((item, i) => {
        const product = PRODUCTS.find(p => p.id === item.productId);
        return { id: i, product_name: product?.name, brand: product?.brand, weight: product?.weight, quantity: item.quantity, is_checked: 0, best_price: null };
      }));
      return;
    }
    api.getList(selectedListId)
      .then(data => {
        setListDetail(data.list);
        setListItems(data.items || []);
      })
      .catch(() => {});
  }, [selectedListId, useMock]);

  // Create list
  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    try {
      const data = await api.createList({ name: newListName.trim() });
      setLists(prev => [data.list, ...prev]);
      setSelectedListId(data.list.id);
      setNewListName('');
      setShowNewList(false);
    } catch {
      alert('Errore nella creazione della lista');
    }
  };

  // Delete list
  const handleDeleteList = async (id) => {
    if (!confirm('Eliminare questa lista?')) return;
    try {
      await api.deleteList(id);
      setLists(prev => prev.filter(l => l.id !== id));
      if (selectedListId === id) {
        setSelectedListId(lists.find(l => l.id !== id)?.id || null);
      }
    } catch {
      alert('Errore nell\'eliminazione');
    }
  };

  // Toggle item check
  const handleToggleItem = async (itemId, checked) => {
    setListItems(prev => prev.map(i => i.id === itemId ? { ...i, is_checked: checked ? 1 : 0 } : i));
    if (!useMock) {
      try { await api.updateListItem(selectedListId, itemId, { is_checked: checked }); } catch {}
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId) => {
    setListItems(prev => prev.filter(i => i.id !== itemId));
    if (!useMock) {
      try { await api.deleteListItem(selectedListId, itemId); } catch {}
    }
  };

  // Add product to list
  const handleAddProduct = async (product) => {
    if (useMock) {
      setListItems(prev => [...prev, { id: Date.now(), product_name: product.name, brand: product.brand, weight: product.weight, quantity: 1, is_checked: 0, best_price: product.best_price }]);
    } else {
      try {
        const data = await api.addListItem(selectedListId, { product_id: product.id, quantity: 1 });
        setListItems(prev => [...prev, data.item]);
      } catch {}
    }
    setShowAddProduct(false);
    setProductSearch('');
    setProductResults([]);
  };

  // Search products for adding
  useEffect(() => {
    if (!productSearch.trim()) { setProductResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const data = await api.getProducts({ search: productSearch, limit: 8 });
        setProductResults(data.products || []);
      } catch {
        setProductResults(PRODUCTS.filter(p =>
          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
          p.brand.toLowerCase().includes(productSearch.toLowerCase())
        ).slice(0, 8));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch]);

  // Optimize list
  const handleOptimize = async () => {
    if (useMock || !selectedListId) {
      navigate('/ai');
      return;
    }
    setOptimizing(true);
    try {
      const result = await api.optimizeList(selectedListId, { priority: 'balanced' });
      setOptimizeResult(result);
    } catch (err) {
      alert(err.message || 'Errore nell\'ottimizzazione');
    } finally {
      setOptimizing(false);
    }
  };

  // Copy list to clipboard
  const handleCopyList = () => {
    const text = listItems.map(i => `${i.is_checked ? '✅' : '⬜'} ${i.brand || ''} ${i.product_name || i.custom_name || ''} x${i.quantity || 1}`).join('\n');
    navigator.clipboard.writeText(`Lista: ${listDetail?.name || 'Spesa'}\n\n${text}`);
    alert('Lista copiata negli appunti!');
  };

  // Share list
  const handleShareList = async () => {
    const text = listItems.map(i => `- ${i.brand || ''} ${i.product_name || ''} x${i.quantity || 1}`).join('\n');
    if (navigator.share) {
      try {
        await navigator.share({ title: listDetail?.name || 'Lista Spesa SpesaMax', text });
      } catch {}
    } else {
      handleCopyList();
    }
  };

  const activeItems = listItems.filter(i => !i.is_checked);
  const checkedItems = listItems.filter(i => i.is_checked);
  const totalCost = listItems.reduce((sum, i) => sum + (i.best_price || 0) * (i.quantity || 1), 0);
  const filteredItems = searchQuery
    ? listItems.filter(i => (i.product_name || i.brand || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : listItems;

  const currentListName = lists.find(l => l.id === selectedListId)?.name || 'Lista';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Liste della Spesa</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {lists.length} liste · Gestisci e ottimizza
          </p>
        </div>
        <button onClick={() => setShowNewList(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuova Lista
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar - Lists */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-3">
          <AnimatePresence>
            {showNewList && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-card p-4">
                <input type="text" placeholder="Nome della lista..." value={newListName} onChange={(e) => setNewListName(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleCreateList()} className="input-field text-sm mb-3" />
                <div className="flex gap-2">
                  <button onClick={handleCreateList} className="btn-primary text-xs flex-1 py-2">Crea</button>
                  <button onClick={() => { setShowNewList(false); setNewListName(''); }} className="btn-secondary text-xs py-2 px-3">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {lists.map(list => (
            <ListCard
              key={list.id}
              list={list}
              isSelected={selectedListId === list.id}
              onClick={() => setSelectedListId(list.id)}
              onDelete={!useMock ? handleDeleteList : null}
            />
          ))}

          {/* Quick stats */}
          <div className="glass-card p-4 mt-4">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Riepilogo</h4>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Prodotti</span>
                <span className="font-bold text-gray-900 dark:text-white">{listItems.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Da comprare</span>
                <span className="font-bold text-gray-900 dark:text-white">{activeItems.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Completati</span>
                <span className="font-bold text-brand-600 dark:text-brand-400">{checkedItems.length}</span>
              </div>
              {totalCost > 0 && (
                <div className="pt-2 border-t border-gray-200/50 dark:border-white/5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Costo stimato</span>
                    <span className="font-extrabold text-brand-600 dark:text-brand-400">€{totalCost.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Optimize result */}
          {optimizeResult && (
            <div className="glass-card p-4 border-2 border-brand-500/30">
              <h4 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">Risultato Ottimizzazione</h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Totale</span><span className="font-bold">€{optimizeResult.totalOptimized}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Risparmio</span><span className="font-extrabold text-brand-600">€{optimizeResult.totalSavings}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Negozi</span><span className="font-bold">{optimizeResult.storeGroups?.length || 0}</span></div>
                {optimizeResult.route && (
                  <div className="flex justify-between"><span className="text-gray-500">Percorso</span><span className="font-bold">{optimizeResult.route.totalDistance} km · {optimizeResult.route.totalTime} min</span></div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main content - Items */}
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="glass-card p-5 lg:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">{currentListName}</h3>
                <span className="text-xs text-gray-400">{listItems.length} articoli</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleShareList} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-brand-500 transition-colors" title="Condividi">
                  <Share2 className="w-4 h-4" />
                </button>
                <button onClick={handleCopyList} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-brand-500 transition-colors" title="Copia">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search within list */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Cerca nella lista..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-10 text-sm" />
            </div>

            {/* Items */}
            <div className="space-y-2">
              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{searchQuery ? 'Nessun risultato' : 'Lista vuota — aggiungi dei prodotti!'}</p>
                </div>
              )}
              {filteredItems.filter(i => !i.is_checked).map((item, i) => (
                <CartItem key={item.id} item={item} index={i} onToggle={handleToggleItem} onDelete={handleDeleteItem} />
              ))}
              {filteredItems.filter(i => i.is_checked).length > 0 && (
                <>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-3 pb-1">Completati</div>
                  {filteredItems.filter(i => i.is_checked).map((item, i) => (
                    <CartItem key={item.id} item={item} index={i} onToggle={handleToggleItem} onDelete={handleDeleteItem} />
                  ))}
                </>
              )}
            </div>

            {/* Add product */}
            <AnimatePresence>
              {showAddProduct ? (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 p-4 rounded-xl border-2 border-brand-200 dark:border-brand-800/30 bg-brand-50/30 dark:bg-brand-500/5">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Cerca prodotto da aggiungere..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} autoFocus className="input-field pl-10 text-sm" />
                  </div>
                  {productResults.length > 0 && (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {productResults.map(p => (
                        <button key={p.id} onClick={() => handleAddProduct(p)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-500/10 text-left transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-500">{(p.brand || p.name)[0]}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{p.brand} {p.name}</p>
                            <p className="text-xs text-gray-400">{p.weight} · {p.category}</p>
                          </div>
                          {p.best_price && <span className="text-sm font-bold text-brand-600">€{p.best_price.toFixed(2)}</span>}
                          <Plus className="w-4 h-4 text-brand-500" />
                        </button>
                      ))}
                    </div>
                  )}
                  <button onClick={() => { setShowAddProduct(false); setProductSearch(''); setProductResults([]); }} className="mt-2 text-xs text-gray-400 hover:text-gray-600">Chiudi</button>
                </motion.div>
              ) : (
                <button onClick={() => setShowAddProduct(true)} className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-400 hover:border-brand-300 hover:text-brand-500 dark:hover:border-brand-700 dark:hover:text-brand-400 transition-all">
                  <Plus className="w-4 h-4" />
                  Aggiungi prodotto
                </button>
              )}
            </AnimatePresence>

            {/* Bottom actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-200/50 dark:border-white/5">
              <button onClick={handleOptimize} disabled={optimizing || listItems.length === 0} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                {optimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {optimizing ? 'Ottimizzando...' : 'Ottimizza con AI'}
              </button>
              <button onClick={() => navigate('/prezzi')} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <Tag className="w-4 h-4" />
                Confronta Prezzi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
