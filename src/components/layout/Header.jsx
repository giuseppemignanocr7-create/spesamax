import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bell, Moon, Sun, Menu, X, ShoppingCart,
  TrendingDown, Users, ChevronDown, CheckCheck
} from 'lucide-react';
import api from '../../services/api';
import { NOTIFICATIONS } from '../../data/mockData';

const SEARCH_ROUTES = [
  { keywords: ['dashboard', 'home', 'risparmio', 'panoramica'], route: '/', label: 'Dashboard' },
  { keywords: ['lista', 'liste', 'spesa', 'carrello', 'cart'], route: '/liste', label: 'Liste Spesa' },
  { keywords: ['negozi', 'negozio', 'store', 'mappa', 'indicazioni'], route: '/negozi', label: 'Negozi' },
  { keywords: ['prezzi', 'prezzo', 'confronta', 'offerte', 'offerta', 'sconto'], route: '/prezzi', label: 'Prezzi' },
  { keywords: ['ai', 'assistente', 'intelligenza', 'chat', 'suggerimenti'], route: '/ai', label: 'AI Assistant' },
  { keywords: ['community', 'segnala', 'classifica', 'contributi'], route: '/community', label: 'Community' },
  { keywords: ['impostazioni', 'settings', 'profilo', 'account', 'tema'], route: '/impostazioni', label: 'Impostazioni' },
];

export default function Header({ isDark, onToggleTheme, onMenuClick }) {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(NOTIFICATIONS.filter(n => !n.read).length);

  useEffect(() => {
    api.getNotifications()
      .then(data => {
        if (data.notifications?.length) {
          setNotifications(data.notifications.map(n => ({
            id: n.id,
            type: n.type === 'price_alert' ? 'price_drop' : n.type === 'offer_expiring' ? 'offer_ending' : n.type,
            title: n.title,
            message: n.message,
            time: new Date(n.created_at).toLocaleString('it-IT', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
            read: !!n.is_read,
          })));
          setUnreadCount(data.unreadCount || 0);
        }
      })
      .catch(() => {});
  }, []);

  // Search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    const matches = SEARCH_ROUTES.filter(r => r.keywords.some(k => k.includes(q)) || r.label.toLowerCase().includes(q));
    setSearchResults(matches);
  }, [searchQuery]);

  const handleSearchNav = (route) => {
    navigate(route);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleMarkRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try { await api.markNotificationRead(id); } catch {}
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try { await api.markAllNotificationsRead(); } catch {}
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-gray-200/50 dark:border-white/5 bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl z-30">
      {/* Left: Menu + Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca prodotti, negozi, offerte..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-72 lg:w-96 pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-brand-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 glass-card p-1 shadow-xl z-50">
              {searchResults.map(r => (
                <button key={r.route} onClick={() => handleSearchNav(r.route)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-500/10 text-sm text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Vai a <strong>{r.label}</strong>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile search toggle */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="sm:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-all duration-200"
          title={isDark ? 'Modalità chiara' : 'Modalità scura'}
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Sun className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Moon className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition-all duration-200"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-surface-800">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 z-50 glass-card p-2 shadow-2xl"
                >
                  <div className="flex items-center justify-between px-3 py-2 mb-1">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notifiche</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-[10px] font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors" title="Segna tutto come letto">
                          <CheckCheck className="w-3 h-3" /> Letto
                        </button>
                      )}
                      <span className="badge-green">{unreadCount} nuove</span>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto space-y-1">
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => !notif.read && handleMarkRead(notif.id)}
                        className={`p-3 rounded-xl transition-colors cursor-pointer ${
                          notif.read
                            ? 'hover:bg-gray-50 dark:hover:bg-white/5'
                            : 'bg-brand-50/50 dark:bg-brand-500/5 hover:bg-brand-50 dark:hover:bg-brand-500/10'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            notif.type === 'price_drop' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                            notif.type === 'offer_ending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                            notif.type === 'community' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                            'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                          }`}>
                            {notif.type === 'price_drop' ? <TrendingDown className="w-4 h-4" /> :
                             notif.type === 'offer_ending' ? <ShoppingCart className="w-4 h-4" /> :
                             notif.type === 'community' ? <Users className="w-4 h-4" /> :
                             <TrendingDown className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{notif.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notif.message}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notif.time}</p>
                          </div>
                          {!notif.read && (
                            <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 p-3 bg-white dark:bg-surface-800 border-b border-gray-200/50 dark:border-white/5 sm:hidden z-50"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca prodotti, negozi, offerte..."
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
