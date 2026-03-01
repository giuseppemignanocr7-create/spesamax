// ============================================
// SpesaMax — Complete Mock Data (Italian Market)
// ============================================

export const USER_PROFILE = {
  id: 'usr_001',
  name: 'Marco',
  surname: 'Rossi',
  email: 'marco.rossi@email.com',
  cap: '20121',
  city: 'Milano',
  isPremium: true,
  premiumUntil: '2026-06-15',
  avatar: null,
  monthlySavings: 127.80,
  totalSavings: 1534.60,
  listsCount: 3,
  contributionsCount: 42,
  reputation: 4.8,
  memberSince: '2025-09-01',
  preferences: {
    maxStores: 3,
    maxDistance: 15,
    preferredStores: ['esselunga', 'lidl', 'conad'],
    dietaryFilters: ['senza-glutine'],
    notifications: true,
  }
};

export const STORES = [
  { id: 'store_001', name: 'Esselunga', chain: 'esselunga', address: 'Via Ripamonti 89, Milano', distance: 1.2, rating: 4.5, lat: 45.4408, lng: 9.2035, openNow: true, hours: '08:00-21:00', color: '#E31937', logo: 'ES' },
  { id: 'store_002', name: 'Lidl', chain: 'lidl', address: 'Viale Corsica 42, Milano', distance: 2.1, rating: 4.2, lat: 45.4520, lng: 9.2180, openNow: true, hours: '08:00-21:30', color: '#0050AA', logo: 'LI' },
  { id: 'store_003', name: 'Conad City', chain: 'conad', address: 'Corso Buenos Aires 15, Milano', distance: 3.4, rating: 4.0, lat: 45.4740, lng: 9.2090, openNow: true, hours: '07:30-20:30', color: '#E2001A', logo: 'CO' },
  { id: 'store_004', name: 'Carrefour Express', chain: 'carrefour', address: 'Via Torino 28, Milano', distance: 0.8, rating: 3.8, lat: 45.4620, lng: 9.1850, openNow: false, hours: '08:00-20:00', color: '#004E9F', logo: 'CA' },
  { id: 'store_005', name: 'Eurospin', chain: 'eurospin', address: 'Via Mecenate 76, Milano', distance: 4.5, rating: 4.1, lat: 45.4380, lng: 9.2360, openNow: true, hours: '08:30-20:00', color: '#FFD700', logo: 'EU' },
  { id: 'store_006', name: 'Coop', chain: 'coop', address: 'Piazzale Lotto 9, Milano', distance: 5.2, rating: 4.3, lat: 45.4670, lng: 9.1560, openNow: true, hours: '08:00-21:00', color: '#E4002B', logo: 'CP' },
  { id: 'store_007', name: 'Penny Market', chain: 'penny', address: 'Via Padova 121, Milano', distance: 3.8, rating: 3.9, lat: 45.4960, lng: 9.2250, openNow: true, hours: '08:00-20:30', color: '#CD1719', logo: 'PE' },
  { id: 'store_008', name: 'Pam Local', chain: 'pam', address: 'Via Dante 7, Milano', distance: 1.0, rating: 3.7, lat: 45.4650, lng: 9.1870, openNow: true, hours: '07:00-22:00', color: '#003DA5', logo: 'PA' },
];

export const PRODUCTS = [
  { id: 'prod_001', name: 'Spaghetti N.5', brand: 'Barilla', category: 'Pasta', weight: '500g', ean: '8076802085738', image: null, unitPrice: '€/kg', isOrganic: false },
  { id: 'prod_002', name: 'Latte Intero UHT', brand: 'Granarolo', category: 'Latticini', weight: '1L', ean: '8002670100016', image: null, unitPrice: '€/L', isOrganic: false },
  { id: 'prod_003', name: 'Passata di Pomodoro', brand: 'Mutti', category: 'Conserve', weight: '700g', ean: '8005110070407', image: null, unitPrice: '€/kg', isOrganic: false },
  { id: 'prod_004', name: 'Olio Extra Vergine', brand: 'Monini', category: 'Condimenti', weight: '1L', ean: '8005510001013', image: null, unitPrice: '€/L', isOrganic: false },
  { id: 'prod_005', name: 'Pan Bauletto Bianco', brand: 'Mulino Bianco', category: 'Pane', weight: '400g', ean: '8076809514392', image: null, unitPrice: '€/kg', isOrganic: false },
  { id: 'prod_006', name: 'Mozzarella di Bufala', brand: 'Galbani', category: 'Latticini', weight: '125g', ean: '8000430200010', image: null, unitPrice: '€/kg', isOrganic: false },
  { id: 'prod_007', name: 'Caffè Macinato Classico', brand: 'Lavazza', category: 'Caffè', weight: '250g', ean: '8000070012004', image: null, unitPrice: '€/kg', isOrganic: false },
  { id: 'prod_008', name: 'Nutella', brand: 'Ferrero', category: 'Dolci', weight: '750g', ean: '3017620422003', image: null, unitPrice: '€/kg', isOrganic: false },
  { id: 'prod_009', name: 'Parmigiano Reggiano DOP', brand: 'Parmareggio', category: 'Formaggi', weight: '200g', ean: '8002670100099', image: null, unitPrice: '€/kg', isOrganic: false },
  { id: 'prod_010', name: 'Tonno all\'Olio d\'Oliva', brand: 'Rio Mare', category: 'Conserve', weight: '3x80g', ean: '8004030100015', image: null, unitPrice: '€/kg', isOrganic: false },
  { id: 'prod_011', name: 'Biscotti Abbracci', brand: 'Mulino Bianco', category: 'Dolci', weight: '350g', ean: '8076809527392', image: null, unitPrice: '€/kg', isOrganic: false },
  { id: 'prod_012', name: 'Yogurt Bianco Intero', brand: 'Müller', category: 'Latticini', weight: '2x125g', ean: '4025500100018', image: null, unitPrice: '€/kg', isOrganic: false },
  { id: 'prod_013', name: 'Detersivo Piatti', brand: 'Fairy', category: 'Casa', weight: '900ml', ean: '8001841213019', image: null, unitPrice: '€/L', isOrganic: false },
  { id: 'prod_014', name: 'Carta Igienica 4 rotoli', brand: 'Scottex', category: 'Casa', weight: '4 rotoli', ean: '5029053500010', image: null, unitPrice: '€/pz', isOrganic: false },
  { id: 'prod_015', name: 'Banane', brand: 'Chiquita', category: 'Frutta', weight: '1kg', ean: '0000000000001', image: null, unitPrice: '€/kg', isOrganic: false },
  { id: 'prod_016', name: 'Acqua Naturale', brand: 'Levissima', category: 'Bevande', weight: '6x1.5L', ean: '8002270014912', image: null, unitPrice: '€/L', isOrganic: false },
];

export const PRICES = [
  // Barilla Spaghetti
  { productId: 'prod_001', storeId: 'store_001', price: 0.89, offerPrice: 0.69, offerEnd: '2026-03-07', pricePerUnit: 1.38, confidence: 1.0 },
  { productId: 'prod_001', storeId: 'store_002', price: 0.79, offerPrice: null, offerEnd: null, pricePerUnit: 1.58, confidence: 0.95 },
  { productId: 'prod_001', storeId: 'store_003', price: 0.95, offerPrice: 0.75, offerEnd: '2026-03-05', pricePerUnit: 1.50, confidence: 0.9 },
  { productId: 'prod_001', storeId: 'store_005', price: 0.69, offerPrice: null, offerEnd: null, pricePerUnit: 1.38, confidence: 0.95 },
  // Latte Granarolo
  { productId: 'prod_002', storeId: 'store_001', price: 1.39, offerPrice: 1.09, offerEnd: '2026-03-04', pricePerUnit: 1.09, confidence: 1.0 },
  { productId: 'prod_002', storeId: 'store_002', price: 1.19, offerPrice: null, offerEnd: null, pricePerUnit: 1.19, confidence: 0.95 },
  { productId: 'prod_002', storeId: 'store_003', price: 1.29, offerPrice: null, offerEnd: null, pricePerUnit: 1.29, confidence: 0.9 },
  { productId: 'prod_002', storeId: 'store_006', price: 1.35, offerPrice: 0.99, offerEnd: '2026-03-06', pricePerUnit: 0.99, confidence: 1.0 },
  // Mutti Passata
  { productId: 'prod_003', storeId: 'store_001', price: 1.59, offerPrice: null, offerEnd: null, pricePerUnit: 2.27, confidence: 1.0 },
  { productId: 'prod_003', storeId: 'store_002', price: 1.39, offerPrice: 0.99, offerEnd: '2026-03-08', pricePerUnit: 1.41, confidence: 0.95 },
  { productId: 'prod_003', storeId: 'store_003', price: 1.49, offerPrice: null, offerEnd: null, pricePerUnit: 2.13, confidence: 0.9 },
  { productId: 'prod_003', storeId: 'store_005', price: 1.29, offerPrice: null, offerEnd: null, pricePerUnit: 1.84, confidence: 0.95 },
  // Monini Olio
  { productId: 'prod_004', storeId: 'store_001', price: 7.99, offerPrice: 5.99, offerEnd: '2026-03-06', pricePerUnit: 5.99, confidence: 1.0 },
  { productId: 'prod_004', storeId: 'store_003', price: 8.49, offerPrice: null, offerEnd: null, pricePerUnit: 8.49, confidence: 0.9 },
  { productId: 'prod_004', storeId: 'store_006', price: 7.89, offerPrice: null, offerEnd: null, pricePerUnit: 7.89, confidence: 1.0 },
  // Mulino Bianco Pan Bauletto
  { productId: 'prod_005', storeId: 'store_001', price: 1.69, offerPrice: null, offerEnd: null, pricePerUnit: 4.23, confidence: 1.0 },
  { productId: 'prod_005', storeId: 'store_002', price: 1.49, offerPrice: 1.19, offerEnd: '2026-03-07', pricePerUnit: 2.98, confidence: 0.95 },
  { productId: 'prod_005', storeId: 'store_005', price: 1.39, offerPrice: null, offerEnd: null, pricePerUnit: 3.48, confidence: 0.95 },
  // Galbani Mozzarella
  { productId: 'prod_006', storeId: 'store_001', price: 1.89, offerPrice: 1.49, offerEnd: '2026-03-05', pricePerUnit: 11.92, confidence: 1.0 },
  { productId: 'prod_006', storeId: 'store_003', price: 1.99, offerPrice: null, offerEnd: null, pricePerUnit: 15.92, confidence: 0.9 },
  { productId: 'prod_006', storeId: 'store_006', price: 1.85, offerPrice: null, offerEnd: null, pricePerUnit: 14.80, confidence: 1.0 },
  // Lavazza
  { productId: 'prod_007', storeId: 'store_001', price: 3.49, offerPrice: 2.69, offerEnd: '2026-03-06', pricePerUnit: 10.76, confidence: 1.0 },
  { productId: 'prod_007', storeId: 'store_002', price: 2.99, offerPrice: null, offerEnd: null, pricePerUnit: 11.96, confidence: 0.95 },
  { productId: 'prod_007', storeId: 'store_003', price: 3.29, offerPrice: null, offerEnd: null, pricePerUnit: 13.16, confidence: 0.9 },
  // Nutella
  { productId: 'prod_008', storeId: 'store_001', price: 4.99, offerPrice: null, offerEnd: null, pricePerUnit: 6.65, confidence: 1.0 },
  { productId: 'prod_008', storeId: 'store_002', price: 4.49, offerPrice: 3.49, offerEnd: '2026-03-08', pricePerUnit: 4.65, confidence: 0.95 },
  { productId: 'prod_008', storeId: 'store_005', price: 4.29, offerPrice: null, offerEnd: null, pricePerUnit: 5.72, confidence: 0.95 },
  // Parmigiano
  { productId: 'prod_009', storeId: 'store_001', price: 4.29, offerPrice: null, offerEnd: null, pricePerUnit: 21.45, confidence: 1.0 },
  { productId: 'prod_009', storeId: 'store_003', price: 3.99, offerPrice: 3.49, offerEnd: '2026-03-05', pricePerUnit: 17.45, confidence: 0.9 },
  { productId: 'prod_009', storeId: 'store_006', price: 4.19, offerPrice: null, offerEnd: null, pricePerUnit: 20.95, confidence: 1.0 },
  // Rio Mare
  { productId: 'prod_010', storeId: 'store_001', price: 4.39, offerPrice: 3.29, offerEnd: '2026-03-07', pricePerUnit: 13.71, confidence: 1.0 },
  { productId: 'prod_010', storeId: 'store_002', price: 3.99, offerPrice: null, offerEnd: null, pricePerUnit: 16.63, confidence: 0.95 },
  { productId: 'prod_010', storeId: 'store_005', price: 3.69, offerPrice: null, offerEnd: null, pricePerUnit: 15.38, confidence: 0.95 },
  // Abbracci
  { productId: 'prod_011', storeId: 'store_001', price: 2.49, offerPrice: null, offerEnd: null, pricePerUnit: 7.11, confidence: 1.0 },
  { productId: 'prod_011', storeId: 'store_002', price: 2.19, offerPrice: null, offerEnd: null, pricePerUnit: 6.26, confidence: 0.95 },
  { productId: 'prod_011', storeId: 'store_003', price: 2.39, offerPrice: 1.89, offerEnd: '2026-03-04', pricePerUnit: 5.40, confidence: 0.9 },
  // Yogurt
  { productId: 'prod_012', storeId: 'store_001', price: 1.29, offerPrice: null, offerEnd: null, pricePerUnit: 5.16, confidence: 1.0 },
  { productId: 'prod_012', storeId: 'store_002', price: 0.99, offerPrice: null, offerEnd: null, pricePerUnit: 3.96, confidence: 0.95 },
  // Fairy
  { productId: 'prod_013', storeId: 'store_001', price: 2.99, offerPrice: 1.99, offerEnd: '2026-03-06', pricePerUnit: 2.21, confidence: 1.0 },
  { productId: 'prod_013', storeId: 'store_002', price: 2.49, offerPrice: null, offerEnd: null, pricePerUnit: 2.77, confidence: 0.95 },
  { productId: 'prod_013', storeId: 'store_005', price: 2.29, offerPrice: null, offerEnd: null, pricePerUnit: 2.54, confidence: 0.95 },
  // Scottex
  { productId: 'prod_014', storeId: 'store_001', price: 2.49, offerPrice: null, offerEnd: null, pricePerUnit: 0.62, confidence: 1.0 },
  { productId: 'prod_014', storeId: 'store_002', price: 1.99, offerPrice: null, offerEnd: null, pricePerUnit: 0.50, confidence: 0.95 },
  { productId: 'prod_014', storeId: 'store_005', price: 1.79, offerPrice: null, offerEnd: null, pricePerUnit: 0.45, confidence: 0.95 },
  // Banane
  { productId: 'prod_015', storeId: 'store_001', price: 1.99, offerPrice: 1.49, offerEnd: '2026-03-05', pricePerUnit: 1.49, confidence: 1.0 },
  { productId: 'prod_015', storeId: 'store_002', price: 1.69, offerPrice: null, offerEnd: null, pricePerUnit: 1.69, confidence: 0.95 },
  { productId: 'prod_015', storeId: 'store_003', price: 1.89, offerPrice: null, offerEnd: null, pricePerUnit: 1.89, confidence: 0.9 },
  // Acqua
  { productId: 'prod_016', storeId: 'store_001', price: 3.29, offerPrice: null, offerEnd: null, pricePerUnit: 0.37, confidence: 1.0 },
  { productId: 'prod_016', storeId: 'store_002', price: 2.49, offerPrice: null, offerEnd: null, pricePerUnit: 0.28, confidence: 0.95 },
  { productId: 'prod_016', storeId: 'store_005', price: 1.99, offerPrice: null, offerEnd: null, pricePerUnit: 0.22, confidence: 0.95 },
];

export const PRICE_HISTORY = {
  'prod_001': [
    { date: '2025-10', avg: 0.92 }, { date: '2025-11', avg: 0.89 }, { date: '2025-12', avg: 0.95 },
    { date: '2026-01', avg: 0.88 }, { date: '2026-02', avg: 0.85 }, { date: '2026-03', avg: 0.79 },
  ],
  'prod_004': [
    { date: '2025-10', avg: 8.20 }, { date: '2025-11', avg: 7.99 }, { date: '2025-12', avg: 8.49 },
    { date: '2026-01', avg: 7.50 }, { date: '2026-02', avg: 6.99 }, { date: '2026-03', avg: 5.99 },
  ],
  'prod_007': [
    { date: '2025-10', avg: 3.49 }, { date: '2025-11', avg: 3.29 }, { date: '2025-12', avg: 3.59 },
    { date: '2026-01', avg: 3.19 }, { date: '2026-02', avg: 2.99 }, { date: '2026-03', avg: 2.69 },
  ],
  'prod_008': [
    { date: '2025-10', avg: 4.99 }, { date: '2025-11', avg: 4.79 }, { date: '2025-12', avg: 5.29 },
    { date: '2026-01', avg: 4.69 }, { date: '2026-02', avg: 4.49 }, { date: '2026-03', avg: 3.49 },
  ],
  'prod_010': [
    { date: '2025-10', avg: 4.29 }, { date: '2025-11', avg: 4.49 }, { date: '2025-12', avg: 4.59 },
    { date: '2026-01', avg: 4.19 }, { date: '2026-02', avg: 3.99 }, { date: '2026-03', avg: 3.29 },
  ],
};

export const CURRENT_CART = {
  id: 'cart_001',
  name: 'Spesa Settimanale',
  createdAt: '2026-03-01',
  items: [
    { productId: 'prod_001', quantity: 2 },
    { productId: 'prod_002', quantity: 3 },
    { productId: 'prod_003', quantity: 1 },
    { productId: 'prod_004', quantity: 1 },
    { productId: 'prod_006', quantity: 2 },
    { productId: 'prod_007', quantity: 1 },
    { productId: 'prod_008', quantity: 1 },
    { productId: 'prod_010', quantity: 1 },
    { productId: 'prod_013', quantity: 1 },
    { productId: 'prod_015', quantity: 1 },
    { productId: 'prod_016', quantity: 1 },
  ],
};

export const OPTIMIZED_CART = {
  totalOptimized: 27.61,
  totalSingleStore: 41.01,
  savings: 13.40,
  savingsPercent: 32.7,
  totalKm: 7.8,
  estimatedTime: 45,
  storeGroups: [
    {
      store: STORES[0], // Esselunga
      items: [
        { product: PRODUCTS[3], quantity: 1, price: 5.99, isOffer: true, offerEnd: '2026-03-06' },
        { product: PRODUCTS[5], quantity: 2, price: 1.49, isOffer: true, offerEnd: '2026-03-05' },
        { product: PRODUCTS[6], quantity: 1, price: 2.69, isOffer: true, offerEnd: '2026-03-06' },
        { product: PRODUCTS[9], quantity: 1, price: 3.29, isOffer: true, offerEnd: '2026-03-07' },
        { product: PRODUCTS[12], quantity: 1, price: 1.99, isOffer: true, offerEnd: '2026-03-06' },
      ],
      subtotal: 16.94,
    },
    {
      store: STORES[1], // Lidl
      items: [
        { product: PRODUCTS[0], quantity: 2, price: 0.79, isOffer: false },
        { product: PRODUCTS[7], quantity: 1, price: 3.49, isOffer: true, offerEnd: '2026-03-08' },
        { product: PRODUCTS[4], quantity: 1, price: 1.19, isOffer: true, offerEnd: '2026-03-07' },
      ],
      subtotal: 6.26,
    },
    {
      store: STORES[5], // Coop
      items: [
        { product: PRODUCTS[1], quantity: 3, price: 0.99, isOffer: true, offerEnd: '2026-03-06' },
        { product: PRODUCTS[14], quantity: 1, price: 1.49, isOffer: true, offerEnd: '2026-03-05' },
      ],
      subtotal: 4.46,
    },
  ],
  route: {
    start: 'Via Roma 1, Milano (Casa)',
    stops: ['Lidl - Viale Corsica 42', 'Esselunga - Via Ripamonti 89', 'Coop - Piazzale Lotto 9'],
    totalDistance: 7.8,
    totalTime: 45,
  },
};

export const AI_SUGGESTIONS = [
  {
    id: 'sug_001',
    type: 'substitute',
    icon: '🔄',
    title: 'Sostituto più economico',
    message: 'Spaghetti **De Cecco N.12** a €0.65 da Eurospin invece di Barilla a €0.79. Stessa qualità, risparmi €0.28 su 2 pacchi.',
    savings: 0.28,
    priority: 'medium',
    timestamp: '2026-03-01T14:30:00',
  },
  {
    id: 'sug_002',
    type: 'price_alert',
    icon: '🔥',
    title: 'Minimo storico!',
    message: 'Olio Extra Vergine Monini a **€5.99** da Esselunga — il prezzo più basso degli ultimi 6 mesi! Normalmente €7.99. Offerta valida fino al 6 marzo.',
    savings: 2.00,
    priority: 'high',
    timestamp: '2026-03-01T10:00:00',
  },
  {
    id: 'sug_003',
    type: 'timing',
    icon: '⏰',
    title: 'Aspetta 2 giorni',
    message: 'Il **Parmigiano Reggiano Parmareggio** andrà in offerta da Conad giovedì a €3.49 (-17%). Se puoi aspettare, risparmi €0.80.',
    savings: 0.80,
    priority: 'medium',
    timestamp: '2026-03-01T09:15:00',
  },
  {
    id: 'sug_004',
    type: 'bundle',
    icon: '📦',
    title: 'Offerta 3x2 disponibile',
    message: 'Müller Yogurt è in offerta **3x2** da Esselunga fino all\'8 marzo. Ne prendi 3 al prezzo di 2 (€2.58 invece di €3.87).',
    savings: 1.29,
    priority: 'high',
    timestamp: '2026-03-01T08:00:00',
  },
  {
    id: 'sug_005',
    type: 'insight',
    icon: '📊',
    title: 'Trend prezzo Nutella',
    message: 'La Nutella 750g è scesa del **30%** nell\'ultimo mese. Prezzo attuale €3.49 da Lidl. Probabile risalita a marzo. Consigliamo acquisto ora.',
    savings: 1.50,
    priority: 'high',
    timestamp: '2026-03-01T07:30:00',
  },
];

export const COMMUNITY_REPORTS = [
  {
    id: 'rep_001',
    user: { name: 'Laura B.', reputation: 4.9, contributions: 156, avatar: 'LB' },
    store: STORES[0],
    product: 'Pesto alla Genovese Barilla 190g',
    reportedPrice: 1.89,
    normalPrice: 2.49,
    isOffer: true,
    timestamp: '2026-03-01T13:45:00',
    verified: true,
    upvotes: 23,
    downvotes: 1,
    hasReceipt: true,
  },
  {
    id: 'rep_002',
    user: { name: 'Giovanni M.', reputation: 4.5, contributions: 89, avatar: 'GM' },
    store: STORES[1],
    product: 'Philadelphia Original 250g',
    reportedPrice: 2.29,
    normalPrice: 3.19,
    isOffer: true,
    timestamp: '2026-03-01T11:20:00',
    verified: true,
    upvotes: 18,
    downvotes: 0,
    hasReceipt: true,
  },
  {
    id: 'rep_003',
    user: { name: 'Chiara T.', reputation: 4.7, contributions: 203, avatar: 'CT' },
    store: STORES[2],
    product: 'Coca Cola 1.5L',
    reportedPrice: 1.19,
    normalPrice: 1.79,
    isOffer: true,
    timestamp: '2026-03-01T10:05:00',
    verified: false,
    upvotes: 12,
    downvotes: 2,
    hasReceipt: false,
  },
  {
    id: 'rep_004',
    user: { name: 'Andrea F.', reputation: 4.2, contributions: 34, avatar: 'AF' },
    store: STORES[4],
    product: 'Prosciutto Crudo San Daniele 100g',
    reportedPrice: 2.49,
    normalPrice: 3.99,
    isOffer: true,
    timestamp: '2026-03-01T09:30:00',
    verified: true,
    upvotes: 31,
    downvotes: 0,
    hasReceipt: true,
  },
  {
    id: 'rep_005',
    user: { name: 'Sofia R.', reputation: 4.6, contributions: 127, avatar: 'SR' },
    store: STORES[3],
    product: 'Finish Powerball Lavastoviglie 40pz',
    reportedPrice: 5.99,
    normalPrice: 9.99,
    isOffer: true,
    timestamp: '2026-02-28T18:45:00',
    verified: true,
    upvotes: 45,
    downvotes: 1,
    hasReceipt: true,
  },
];

export const WEEKLY_STATS = {
  totalSavings: 31.40,
  productsTracked: 47,
  priceAlerts: 8,
  listsOptimized: 3,
  communityContributions: 5,
  storesCompared: 6,
  avgSavingsPerTrip: 13.40,
  savingsVsLastWeek: 4.20,
  savingsVsLastWeekPercent: 15.4,
};

export const SAVINGS_CHART_DATA = [
  { week: 'Sett 1', risparmio: 18.50, spesa: 65.20 },
  { week: 'Sett 2', risparmio: 22.30, spesa: 71.40 },
  { week: 'Sett 3', risparmio: 15.80, spesa: 58.90 },
  { week: 'Sett 4', risparmio: 28.60, spesa: 82.10 },
  { week: 'Sett 5', risparmio: 19.40, spesa: 63.50 },
  { week: 'Sett 6', risparmio: 25.10, spesa: 75.30 },
  { week: 'Sett 7', risparmio: 31.40, spesa: 68.60 },
  { week: 'Sett 8', risparmio: 27.20, spesa: 72.80 },
];

export const SHOPPING_LISTS = [
  { id: 'list_001', name: 'Spesa Settimanale', itemCount: 11, lastUpdated: '2026-03-01', isActive: true, color: '#10b981' },
  { id: 'list_002', name: 'Cena Sabato (ospiti)', itemCount: 8, lastUpdated: '2026-02-28', isActive: false, color: '#8b5cf6' },
  { id: 'list_003', name: 'Prodotti Casa', itemCount: 5, lastUpdated: '2026-02-25', isActive: false, color: '#f59e0b' },
];

export const NOTIFICATIONS = [
  { id: 'not_001', type: 'price_drop', title: 'Prezzo sceso!', message: 'Olio Monini -25% da Esselunga', time: '2 ore fa', read: false },
  { id: 'not_002', type: 'offer_ending', title: 'Offerta in scadenza', message: 'Nutella 3.49€ da Lidl - scade domani', time: '4 ore fa', read: false },
  { id: 'not_003', type: 'community', title: 'Segnalazione verificata', message: 'Il tuo report su Pesto Barilla è stato confermato', time: '6 ore fa', read: true },
  { id: 'not_004', type: 'savings', title: 'Traguardo raggiunto! 🎉', message: 'Hai superato €1500 di risparmio totale!', time: '1 giorno fa', read: true },
];
