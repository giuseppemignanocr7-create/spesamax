import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Star, Clock, Navigation, Search,
  ExternalLink, Phone, Heart, Loader2, Map, List, ChevronRight
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { STORES } from '../data/mockData';
import { getStoredLocation, geocodeCap } from '../utils/geocode';

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

const DISTANCES = [3, 5, 10, 25];

function makeStoreIcon(color, letter) {
  return new L.DivIcon({
    className: '',
    html: `<div style="width:36px;height:36px;border-radius:50%;background:${color || '#10b981'};border:3px solid white;box-shadow:0 2px 10px ${color || '#10b981'}60;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:white;font-family:system-ui">${letter || '?'}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

const userIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 6px rgba(59,130,246,0.2),0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

function StoreCard({ store, active, onSelect, onDirections, onFlyer, onCall }) {
  const [liked, setLiked] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('liked_stores') || '[]');
    return saved.includes(store.id);
  });

  const toggleLike = (e) => {
    e.stopPropagation();
    const saved = JSON.parse(localStorage.getItem('liked_stores') || '[]');
    const next = liked ? saved.filter(id => id !== store.id) : [...saved, store.id];
    localStorage.setItem('liked_stores', JSON.stringify(next));
    setLiked(!liked);
  };

  const dist = store.distance_km || store.distance || '?';
  const hours = store.hours || (store.opening_hours?.weekday) || '8:00-21:00';
  const isOpen = store.openNow !== undefined ? store.openNow : true;

  return (
    <div
      onClick={() => onSelect(store)}
      className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
        active
          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10 shadow-lg shadow-brand-500/10'
          : 'border-transparent bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/8 hover:border-gray-200 dark:hover:border-white/10'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md"
          style={{ backgroundColor: store.color || '#10b981' }}
        >
          {(store.logo || store.name?.[0] || '?')}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{store.name}</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">{store.address}</p>
            </div>
            <button
              onClick={toggleLike}
              className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${liked ? 'text-red-500' : 'text-gray-300 dark:text-gray-600 hover:text-red-400'}`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-full">
              <MapPin className="w-3 h-3" /> {dist} km
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {store.rating || 4.0}
            </span>
            {store.offers_count > 0 && (
              <span className="text-[10px] font-semibold text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 px-2 py-0.5 rounded-full">{store.offers_count} offerte</span>
            )}
            {isOpen ? (
              <span className="text-[10px] font-semibold text-green-600 bg-green-50 dark:bg-green-500/10 dark:text-green-400 px-2 py-0.5 rounded-full">Aperto</span>
            ) : (
              <span className="text-[10px] font-semibold text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 px-2 py-0.5 rounded-full">Chiuso</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-2.5">
            <button onClick={(e) => { e.stopPropagation(); onDirections(store); }} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors">
              <Navigation className="w-3 h-3" /> Indicazioni
            </button>
            <button onClick={(e) => { e.stopPropagation(); onFlyer(store); }} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
              <ExternalLink className="w-3 h-3" /> Volantino
            </button>
            <button onClick={(e) => { e.stopPropagation(); onCall(store); }} className="py-1.5 px-2.5 rounded-lg text-gray-400 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" title="Chiama">
              <Phone className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Negozi() {
  const [search, setSearch] = useState('');
  const [maxDistance, setMaxDistance] = useState(10);
  const [stores, setStores] = useState(STORES);
  const [loading, setLoading] = useState(true);
  const [cap, setCap] = useState(() => localStorage.getItem('spesamax_cap') || '');
  const [userCoords, setUserCoords] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // split, map, list
  const [flyTarget, setFlyTarget] = useState(null);
  const listRef = useRef(null);

  // Get user coordinates from stored CAP
  useEffect(() => {
    const loc = getStoredLocation();
    if (loc) {
      setUserCoords({ lat: loc.lat, lng: loc.lng });
    } else if (cap) {
      geocodeCap(cap).then(r => setUserCoords({ lat: r.lat, lng: r.lng }));
    } else {
      setUserCoords({ lat: 45.4642, lng: 9.19 }); // Milan default
    }
  }, [cap]);

  useEffect(() => {
    const handler = (e) => {
      const newCap = e.detail || localStorage.getItem('spesamax_cap') || '';
      setCap(newCap);
      geocodeCap(newCap).then(r => setUserCoords({ lat: r.lat, lng: r.lng }));
    };
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

  const filtered = useMemo(() => stores.filter(s => {
    const q = search.toLowerCase();
    const nameMatch = (s.name || '').toLowerCase().includes(q) || (s.address || '').toLowerCase().includes(q) || (s.chain || '').toLowerCase().includes(q);
    const distMatch = !s.distance_km || s.distance_km <= maxDistance;
    return nameMatch && distMatch;
  }), [stores, search, maxDistance]);

  const openDirections = (store) => {
    const lat = store.latitude || 45.46;
    const lng = store.longitude || 9.19;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const openFlyer = (store) => {
    const chain = (store.chain || '').toLowerCase();
    const url = CHAIN_URLS[chain] || `https://www.google.com/search?q=${encodeURIComponent(store.name + ' volantino offerte')}`;
    window.open(url, '_blank');
  };

  const callStore = (store) => {
    const phone = store.phone || '';
    if (phone) window.location.href = `tel:${phone}`;
    else window.open(`https://www.google.com/search?q=${encodeURIComponent(store.name + ' ' + (store.address || '') + ' telefono')}`, '_blank');
  };

  const handleSelectStore = (store) => {
    setSelectedStore(store.id === selectedStore?.id ? null : store);
    const idNum = typeof store.id === 'number' ? store.id : [...String(store.id || 0)].reduce((a, c) => a * 31 + c.charCodeAt(0), 0);
    const hash = Math.abs(idNum * 2654435761) % 1000;
    const lat = store.latitude || (userCoords?.lat || 45.46) + ((hash % 100) - 50) / 2500;
    const lng = store.longitude || (userCoords?.lng || 9.19) + (((hash / 10) % 100) - 50) / 2500;
    setFlyTarget({ lat, lng });
  };

  const mapCenter = userCoords || { lat: 45.4642, lng: 9.19 };
  const showMap = viewMode === 'split' || viewMode === 'map';
  const showList = viewMode === 'split' || viewMode === 'list';

  return (
    <div className="max-w-[1600px] mx-auto -m-4 lg:-m-6" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="flex flex-col h-full">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 lg:px-6 pt-4 lg:pt-5 pb-3">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Negozi vicino a te</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {cap && <span className="font-semibold text-brand-600 dark:text-brand-400">CAP {cap}</span>}
              {cap && ' · '}{filtered.length} negozi entro {maxDistance} km
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 rounded-xl p-1">
            {[
              { mode: 'split', icon: null, label: 'Split' },
              { mode: 'map', icon: Map, label: '' },
              { mode: 'list', icon: List, label: '' },
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  viewMode === mode ? 'bg-white dark:bg-surface-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search + filters */}
        <div className="px-4 lg:px-6 pb-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Cerca negozio, catena o indirizzo..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10 text-sm h-10" />
            </div>
            <div className="flex gap-1.5">
              {DISTANCES.map(d => (
                <button
                  key={d}
                  onClick={() => setMaxDistance(d)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    maxDistance === d
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}
                >
                  {d} km
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main content: map + list */}
        <div className={`flex-1 flex ${viewMode === 'list' ? 'flex-col' : 'flex-col lg:flex-row'} overflow-hidden px-4 lg:px-6 pb-4 gap-4`}>
          {/* Map */}
          {showMap && (
            <div className={`${viewMode === 'map' ? 'flex-1' : viewMode === 'split' ? 'lg:flex-1 h-[300px] lg:h-auto' : ''} rounded-2xl overflow-hidden shadow-lg border border-gray-200/50 dark:border-white/5 relative`}>
              {userCoords && (
                <MapContainer
                  center={[mapCenter.lat, mapCenter.lng]}
                  zoom={13}
                  scrollWheelZoom={true}
                  zoomControl={false}
                  className="h-full w-full"
                  style={{ minHeight: '300px' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {flyTarget && <FlyTo center={[flyTarget.lat, flyTarget.lng]} zoom={15} />}

                  {/* User position */}
                  <Marker position={[mapCenter.lat, mapCenter.lng]} icon={userIcon} />
                  <Circle
                    center={[mapCenter.lat, mapCenter.lng]}
                    radius={maxDistance * 1000}
                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.04, weight: 1.5, dashArray: '6' }}
                  />

                  {/* Store markers */}
                  {filtered.map((store, idx) => {
                    // Deterministic offset for stores without coordinates
                    const idNum = typeof store.id === 'number' ? store.id : [...String(store.id || idx)].reduce((a, c) => a * 31 + c.charCodeAt(0), 0);
                    const hash = Math.abs(idNum * 2654435761) % 1000;
                    const lat = store.latitude || mapCenter.lat + ((hash % 100) - 50) / 2500;
                    const lng = store.longitude || mapCenter.lng + (((hash / 10) % 100) - 50) / 2500;
                    const isActive = selectedStore?.id === store.id;
                    const letter = (store.logo || store.name?.[0] || '?')[0];
                    return (
                      <Marker
                        key={store.id}
                        position={[lat, lng]}
                        icon={makeStoreIcon(isActive ? '#6366f1' : store.color, letter)}
                        eventHandlers={{ click: () => handleSelectStore(store) }}
                      >
                        <Popup>
                          <div className="text-center min-w-[160px]">
                            <p className="font-bold text-sm">{store.name}</p>
                            <p className="text-xs text-gray-500">{store.address}</p>
                            <p className="text-xs font-semibold text-brand-600 mt-1">{store.distance_km || store.distance || '?'} km</p>
                            <button
                              onClick={() => openDirections(store)}
                              className="mt-2 w-full text-xs font-semibold text-white bg-brand-500 rounded-lg py-1.5 hover:bg-brand-600 transition-colors"
                            >
                              Indicazioni Google Maps
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              )}

              {/* Map overlay info */}
              <div className="absolute bottom-3 left-3 z-[400] glass-card px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-lg">
                <MapPin className="w-3.5 h-3.5 inline mr-1 text-blue-500" />
                {cap ? `CAP ${cap}` : 'La tua posizione'} · {filtered.length} negozi
              </div>
            </div>
          )}

          {/* Store list */}
          {showList && (
            <div ref={listRef} className={`${viewMode === 'list' ? 'flex-1' : viewMode === 'split' ? 'lg:w-[420px] lg:flex-shrink-0' : ''} overflow-y-auto space-y-2 pr-1`}>
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">Nessun negozio trovato</p>
                  <p className="text-xs mt-1">Prova ad allargare il raggio di ricerca</p>
                </div>
              ) : (
                filtered.map(store => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    active={selectedStore?.id === store.id}
                    onSelect={handleSelectStore}
                    onDirections={openDirections}
                    onFlyer={openFlyer}
                    onCall={callStore}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
