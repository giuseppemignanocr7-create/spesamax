// Geocode Italian CAP to lat/lng using OpenStreetMap Nominatim (free, no API key)
const CACHE_KEY = 'spesamax_geocache';

function getCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; }
}

function setCache(cap, coords) {
  const cache = getCache();
  cache[cap] = coords;
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

// Known Italian CAP → coordinates fallback (major cities)
const KNOWN_CAPS = {
  '00100': { lat: 41.9028, lng: 12.4964, city: 'Roma' },
  '20100': { lat: 45.4642, lng: 9.1900, city: 'Milano' },
  '20121': { lat: 45.4685, lng: 9.1903, city: 'Milano' },
  '20122': { lat: 45.4600, lng: 9.1950, city: 'Milano' },
  '20123': { lat: 45.4630, lng: 9.1750, city: 'Milano' },
  '20124': { lat: 45.4800, lng: 9.2000, city: 'Milano' },
  '20125': { lat: 45.4900, lng: 9.2100, city: 'Milano' },
  '20126': { lat: 45.5000, lng: 9.2200, city: 'Milano' },
  '20127': { lat: 45.5050, lng: 9.2150, city: 'Milano' },
  '20128': { lat: 45.5100, lng: 9.2250, city: 'Milano' },
  '20129': { lat: 45.4750, lng: 9.2050, city: 'Milano' },
  '20131': { lat: 45.4780, lng: 9.2200, city: 'Milano' },
  '20132': { lat: 45.4900, lng: 9.2400, city: 'Milano' },
  '20133': { lat: 45.4700, lng: 9.2350, city: 'Milano' },
  '20134': { lat: 45.4650, lng: 9.2400, city: 'Milano' },
  '20135': { lat: 45.4500, lng: 9.2100, city: 'Milano' },
  '20136': { lat: 45.4450, lng: 9.1950, city: 'Milano' },
  '20137': { lat: 45.4400, lng: 9.2050, city: 'Milano' },
  '20138': { lat: 45.4350, lng: 9.2200, city: 'Milano' },
  '20139': { lat: 45.4300, lng: 9.2100, city: 'Milano' },
  '20141': { lat: 45.4350, lng: 9.1800, city: 'Milano' },
  '20142': { lat: 45.4250, lng: 9.1600, city: 'Milano' },
  '20143': { lat: 45.4400, lng: 9.1650, city: 'Milano' },
  '20144': { lat: 45.4550, lng: 9.1600, city: 'Milano' },
  '20145': { lat: 45.4700, lng: 9.1600, city: 'Milano' },
  '20146': { lat: 45.4650, lng: 9.1500, city: 'Milano' },
  '20147': { lat: 45.4600, lng: 9.1350, city: 'Milano' },
  '20148': { lat: 45.4800, lng: 9.1400, city: 'Milano' },
  '20149': { lat: 45.4850, lng: 9.1650, city: 'Milano' },
  '20151': { lat: 45.5100, lng: 9.1600, city: 'Milano' },
  '20152': { lat: 45.4950, lng: 9.1400, city: 'Milano' },
  '20153': { lat: 45.5050, lng: 9.1500, city: 'Milano' },
  '20154': { lat: 45.4900, lng: 9.1750, city: 'Milano' },
  '20155': { lat: 45.4850, lng: 9.1850, city: 'Milano' },
  '20156': { lat: 45.5000, lng: 9.1800, city: 'Milano' },
  '20157': { lat: 45.5050, lng: 9.1700, city: 'Milano' },
  '20158': { lat: 45.5000, lng: 9.1900, city: 'Milano' },
  '20159': { lat: 45.4950, lng: 9.1950, city: 'Milano' },
  '20161': { lat: 45.5150, lng: 9.1850, city: 'Milano' },
  '20162': { lat: 45.5200, lng: 9.1950, city: 'Milano' },
  '10100': { lat: 45.0703, lng: 7.6869, city: 'Torino' },
  '40100': { lat: 44.4949, lng: 11.3426, city: 'Bologna' },
  '50100': { lat: 43.7696, lng: 11.2558, city: 'Firenze' },
  '30100': { lat: 45.4408, lng: 12.3155, city: 'Venezia' },
  '80100': { lat: 40.8518, lng: 14.2681, city: 'Napoli' },
  '90100': { lat: 38.1157, lng: 13.3615, city: 'Palermo' },
  '16100': { lat: 44.4056, lng: 8.9463, city: 'Genova' },
  '70100': { lat: 41.1171, lng: 16.8719, city: 'Bari' },
  '09100': { lat: 39.2238, lng: 9.1217, city: 'Cagliari' },
  '37100': { lat: 45.4384, lng: 10.9916, city: 'Verona' },
  '35100': { lat: 45.4064, lng: 11.8768, city: 'Padova' },
  '34100': { lat: 45.6495, lng: 13.7768, city: 'Trieste' },
  '25100': { lat: 45.5416, lng: 10.2118, city: 'Brescia' },
  '24100': { lat: 45.6983, lng: 9.6773, city: 'Bergamo' },
};

export async function geocodeCap(cap) {
  // Check cache first
  const cached = getCache()[cap];
  if (cached) return cached;

  // Check known fallback
  if (KNOWN_CAPS[cap]) {
    setCache(cap, KNOWN_CAPS[cap]);
    return KNOWN_CAPS[cap];
  }

  // Try Nominatim
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${cap}&country=Italy&format=json&limit=1`,
      { headers: { 'Accept-Language': 'it' } }
    );
    const data = await res.json();
    if (data.length > 0) {
      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        city: data[0].display_name?.split(',')[0] || '',
      };
      setCache(cap, result);
      return result;
    }
  } catch (e) {
    console.warn('Geocoding failed, using regional fallback', e);
  }

  // Regional fallback based on first 2 digits
  const prefix = cap.substring(0, 2);
  const regionalFallbacks = {
    '00': { lat: 41.90, lng: 12.50, city: 'Roma' },
    '01': { lat: 42.42, lng: 11.87, city: 'Viterbo' },
    '02': { lat: 42.40, lng: 12.86, city: 'Rieti' },
    '03': { lat: 41.63, lng: 13.35, city: 'Frosinone' },
    '04': { lat: 41.47, lng: 12.90, city: 'Latina' },
    '05': { lat: 42.72, lng: 12.11, city: 'Terni' },
    '06': { lat: 43.11, lng: 12.39, city: 'Perugia' },
    '10': { lat: 45.07, lng: 7.69, city: 'Torino' },
    '12': { lat: 44.39, lng: 7.55, city: 'Cuneo' },
    '13': { lat: 45.32, lng: 8.42, city: 'Vercelli' },
    '14': { lat: 44.90, lng: 8.21, city: 'Asti' },
    '15': { lat: 44.91, lng: 8.61, city: 'Alessandria' },
    '16': { lat: 44.41, lng: 8.95, city: 'Genova' },
    '17': { lat: 44.31, lng: 8.48, city: 'Savona' },
    '18': { lat: 43.82, lng: 7.78, city: 'Imperia' },
    '19': { lat: 44.11, lng: 9.82, city: 'La Spezia' },
    '20': { lat: 45.46, lng: 9.19, city: 'Milano' },
    '21': { lat: 45.82, lng: 8.83, city: 'Varese' },
    '22': { lat: 45.81, lng: 9.08, city: 'Como' },
    '23': { lat: 46.17, lng: 9.88, city: 'Sondrio' },
    '24': { lat: 45.70, lng: 9.68, city: 'Bergamo' },
    '25': { lat: 45.54, lng: 10.21, city: 'Brescia' },
    '26': { lat: 45.13, lng: 9.69, city: 'Cremona' },
    '27': { lat: 45.18, lng: 9.16, city: 'Pavia' },
    '28': { lat: 45.45, lng: 8.62, city: 'Novara' },
    '29': { lat: 45.05, lng: 9.70, city: 'Piacenza' },
    '30': { lat: 45.44, lng: 12.32, city: 'Venezia' },
    '31': { lat: 45.67, lng: 12.24, city: 'Treviso' },
    '33': { lat: 46.06, lng: 13.24, city: 'Udine' },
    '34': { lat: 45.65, lng: 13.78, city: 'Trieste' },
    '35': { lat: 45.41, lng: 11.88, city: 'Padova' },
    '36': { lat: 45.55, lng: 11.55, city: 'Vicenza' },
    '37': { lat: 45.44, lng: 10.99, city: 'Verona' },
    '38': { lat: 46.07, lng: 11.12, city: 'Trento' },
    '39': { lat: 46.50, lng: 11.35, city: 'Bolzano' },
    '40': { lat: 44.49, lng: 11.34, city: 'Bologna' },
    '41': { lat: 44.65, lng: 10.92, city: 'Modena' },
    '42': { lat: 44.70, lng: 10.63, city: 'Reggio Emilia' },
    '43': { lat: 44.80, lng: 10.33, city: 'Parma' },
    '44': { lat: 44.84, lng: 11.62, city: 'Ferrara' },
    '47': { lat: 44.06, lng: 12.57, city: 'Rimini' },
    '48': { lat: 44.42, lng: 12.20, city: 'Ravenna' },
    '50': { lat: 43.77, lng: 11.25, city: 'Firenze' },
    '51': { lat: 43.93, lng: 10.91, city: 'Pistoia' },
    '53': { lat: 43.32, lng: 11.33, city: 'Siena' },
    '55': { lat: 43.84, lng: 10.51, city: 'Lucca' },
    '56': { lat: 43.72, lng: 10.40, city: 'Pisa' },
    '57': { lat: 42.76, lng: 10.31, city: 'Livorno' },
    '58': { lat: 42.76, lng: 11.11, city: 'Grosseto' },
    '60': { lat: 43.62, lng: 13.52, city: 'Ancona' },
    '61': { lat: 43.84, lng: 12.84, city: 'Pesaro' },
    '62': { lat: 43.30, lng: 13.45, city: 'Macerata' },
    '63': { lat: 42.85, lng: 13.57, city: 'Ascoli Piceno' },
    '65': { lat: 42.46, lng: 14.21, city: 'Pescara' },
    '66': { lat: 42.35, lng: 13.39, city: "L'Aquila" },
    '67': { lat: 42.35, lng: 13.39, city: "L'Aquila" },
    '70': { lat: 41.12, lng: 16.87, city: 'Bari' },
    '71': { lat: 41.46, lng: 15.55, city: 'Foggia' },
    '72': { lat: 40.63, lng: 17.94, city: 'Brindisi' },
    '73': { lat: 40.35, lng: 18.17, city: 'Lecce' },
    '74': { lat: 40.47, lng: 17.24, city: 'Taranto' },
    '75': { lat: 40.66, lng: 16.60, city: 'Matera' },
    '80': { lat: 40.85, lng: 14.27, city: 'Napoli' },
    '81': { lat: 41.07, lng: 14.33, city: 'Caserta' },
    '83': { lat: 40.91, lng: 14.79, city: 'Avellino' },
    '84': { lat: 40.68, lng: 14.77, city: 'Salerno' },
    '85': { lat: 40.64, lng: 15.80, city: 'Potenza' },
    '87': { lat: 39.30, lng: 16.25, city: 'Cosenza' },
    '88': { lat: 38.91, lng: 16.59, city: 'Catanzaro' },
    '89': { lat: 38.11, lng: 15.65, city: 'Reggio Calabria' },
    '90': { lat: 38.12, lng: 13.36, city: 'Palermo' },
    '91': { lat: 38.02, lng: 12.54, city: 'Trapani' },
    '92': { lat: 37.31, lng: 13.58, city: 'Agrigento' },
    '93': { lat: 37.49, lng: 14.07, city: 'Caltanissetta' },
    '94': { lat: 37.57, lng: 14.27, city: 'Enna' },
    '95': { lat: 37.50, lng: 15.09, city: 'Catania' },
    '96': { lat: 37.07, lng: 15.29, city: 'Siracusa' },
    '97': { lat: 36.93, lng: 14.73, city: 'Ragusa' },
    '98': { lat: 38.19, lng: 15.55, city: 'Messina' },
    '09': { lat: 39.22, lng: 9.12, city: 'Cagliari' },
  };

  const fallback = regionalFallbacks[prefix] || { lat: 41.90, lng: 12.50, city: 'Italia' };
  setCache(cap, fallback);
  return fallback;
}

export function getStoredLocation() {
  const cap = localStorage.getItem('spesamax_cap');
  if (!cap) return null;
  const cache = getCache();
  return cache[cap] ? { cap, ...cache[cap] } : { cap, lat: 45.46, lng: 9.19, city: '' };
}

export function storeLocation(cap, coords) {
  localStorage.setItem('spesamax_cap', cap);
  setCache(cap, coords);
}
