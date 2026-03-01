import db from '../db/connection.js';
import { v4 as uuid } from 'uuid';

/**
 * Cart Optimization Engine
 * Solves the multi-store shopping optimization problem:
 * Given a list of products and available stores, find the optimal
 * combination of stores that minimizes total cost while considering
 * distance, number of stops, and time constraints.
 *
 * This is a variant of the Weighted Set Cover problem (NP-hard).
 * We use a greedy heuristic with scoring function.
 */

// Haversine distance between two coordinates (km)
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Estimate travel time (minutes) based on distance
function estimateTravelTime(distanceKm) {
  if (distanceKm < 1) return 5;
  if (distanceKm < 3) return 10;
  if (distanceKm < 5) return 15;
  return Math.round(distanceKm * 3.5); // ~17 km/h average in city
}

// Estimate shopping time per store (minutes)
function estimateShoppingTime(itemsCount) {
  return 10 + itemsCount * 2; // base 10 min + 2 min per item
}

/**
 * Optimize a shopping list across multiple stores
 * @param {string} listId - Shopping list ID
 * @param {string} userId - User ID
 * @param {Object} options - Optimization options
 * @returns {Object} Optimized cart with store groups and savings
 */
export function optimizeCart(listId, userId, options = {}) {
  const {
    maxStores = 3,
    priority = 'balanced', // 'savings', 'balanced', 'convenience'
    userLat = 45.4642,
    userLng = 9.1900,
    searchRadius = 15,
  } = options;

  // 1. Get list items with product info
  const items = db.prepare(`
    SELECT li.*, p.name as product_name, p.brand, p.weight, p.category, p.id as prod_id
    FROM list_items li
    JOIN products p ON p.id = li.product_id
    WHERE li.list_id = ? AND li.is_checked = 0
  `).all(listId);

  if (items.length === 0) {
    return { error: 'Lista vuota o tutti gli articoli già spuntati.' };
  }

  // 2. Get all active stores with distances
  const stores = db.prepare('SELECT * FROM stores WHERE is_active = 1').all();
  const storesWithDistance = stores.map(s => ({
    ...s,
    distance: haversine(userLat, userLng, s.latitude, s.longitude),
    categories: JSON.parse(s.categories || '[]'),
  })).filter(s => s.distance <= searchRadius)
    .sort((a, b) => a.distance - b.distance);

  // 3. Build price matrix: product -> store -> price data
  const priceMatrix = {};
  for (const item of items) {
    const prices = db.prepare(`
      SELECT pr.*, s.id as sid
      FROM prices pr
      JOIN stores s ON s.id = pr.store_id
      WHERE pr.product_id = ?
    `).all(item.prod_id);

    priceMatrix[item.prod_id] = {};
    for (const p of prices) {
      priceMatrix[item.prod_id][p.sid] = {
        price: p.price,
        offerPrice: p.offer_price,
        effectivePrice: p.offer_price || p.price,
        offerLabel: p.offer_label,
        offerEnd: p.offer_end,
      };
    }
  }

  // 4. Strategy selection based on priority
  let result;
  if (priority === 'convenience') {
    result = optimizeSingleStore(items, storesWithDistance, priceMatrix);
  } else if (priority === 'savings') {
    result = optimizeMaxSavings(items, storesWithDistance, priceMatrix, maxStores);
  } else {
    result = optimizeBalanced(items, storesWithDistance, priceMatrix, maxStores, userLat, userLng);
  }

  // 5. Calculate route
  const route = calculateRoute(result.storeGroups, userLat, userLng);

  // 6. Save to database
  const cartId = uuid();
  db.prepare(`INSERT INTO optimized_carts (id, user_id, list_id, total_original, total_optimized, total_savings, stores_count, total_distance_km, estimated_time_min, route_data, store_groups) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    cartId, userId, listId,
    result.totalOriginal, result.totalOptimized, result.totalSavings,
    result.storeGroups.length, route.totalDistance, route.totalTime,
    JSON.stringify(route), JSON.stringify(result.storeGroups)
  );

  return {
    id: cartId,
    ...result,
    route,
  };
}

// Strategy 1: Single best store
function optimizeSingleStore(items, stores, priceMatrix) {
  let bestStore = null;
  let bestTotal = Infinity;

  for (const store of stores) {
    let total = 0;
    let covered = 0;
    for (const item of items) {
      const price = priceMatrix[item.prod_id]?.[store.id];
      if (price) {
        total += price.effectivePrice * item.quantity;
        covered++;
      }
    }
    // Penalize stores that don't have all products
    if (covered < items.length) total += (items.length - covered) * 10;
    if (total < bestTotal) {
      bestTotal = total;
      bestStore = store;
    }
  }

  const storeItems = items.map(item => {
    const price = priceMatrix[item.prod_id]?.[bestStore.id];
    return {
      ...item,
      assignedStore: bestStore.id,
      price: price?.price || 0,
      effectivePrice: price?.effectivePrice || 0,
      offerLabel: price?.offerLabel,
    };
  });

  const totalOriginal = storeItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalOptimized = storeItems.reduce((sum, i) => sum + i.effectivePrice * i.quantity, 0);

  return {
    storeGroups: [{
      store: bestStore,
      items: storeItems,
      subtotal: totalOptimized,
    }],
    totalOriginal: Math.round(totalOriginal * 100) / 100,
    totalOptimized: Math.round(totalOptimized * 100) / 100,
    totalSavings: Math.round((totalOriginal - totalOptimized) * 100) / 100,
  };
}

// Strategy 2: Maximum savings (greedy per-item)
function optimizeMaxSavings(items, stores, priceMatrix, maxStores) {
  // For each item, find the absolute cheapest store
  const assignments = {};
  const storeUsage = {};

  for (const item of items) {
    let bestPrice = Infinity;
    let bestStoreId = null;

    for (const store of stores) {
      const price = priceMatrix[item.prod_id]?.[store.id];
      if (price && price.effectivePrice < bestPrice) {
        bestPrice = price.effectivePrice;
        bestStoreId = store.id;
      }
    }

    if (bestStoreId) {
      assignments[item.prod_id] = { storeId: bestStoreId, price: bestPrice };
      storeUsage[bestStoreId] = (storeUsage[bestStoreId] || 0) + 1;
    }
  }

  // If too many stores, consolidate
  const usedStores = Object.keys(storeUsage);
  if (usedStores.length > maxStores) {
    // Keep top stores by item count, reassign rest
    const sorted = usedStores.sort((a, b) => storeUsage[b] - storeUsage[a]);
    const kept = new Set(sorted.slice(0, maxStores));

    for (const item of items) {
      const assignment = assignments[item.prod_id];
      if (assignment && !kept.has(assignment.storeId)) {
        // Reassign to cheapest among kept stores
        let bestPrice = Infinity;
        let bestStoreId = null;
        for (const sid of kept) {
          const price = priceMatrix[item.prod_id]?.[sid];
          if (price && price.effectivePrice < bestPrice) {
            bestPrice = price.effectivePrice;
            bestStoreId = sid;
          }
        }
        if (bestStoreId) {
          assignments[item.prod_id] = { storeId: bestStoreId, price: bestPrice };
        }
      }
    }
  }

  return buildResult(items, assignments, stores, priceMatrix);
}

// Strategy 3: Balanced (savings vs convenience)
function optimizeBalanced(items, stores, priceMatrix, maxStores, userLat, userLng) {
  // Score each store based on: average savings + distance penalty
  const storeScores = {};

  for (const store of stores) {
    let totalSavings = 0;
    let itemsCovered = 0;

    for (const item of items) {
      const price = priceMatrix[item.prod_id]?.[store.id];
      if (price) {
        // Find max price across all stores for this product
        const allPrices = Object.values(priceMatrix[item.prod_id] || {});
        const maxPrice = Math.max(...allPrices.map(p => p.price));
        totalSavings += (maxPrice - price.effectivePrice) * item.quantity;
        itemsCovered++;
      }
    }

    const coverageRatio = itemsCovered / items.length;
    const distancePenalty = store.distance * 0.5; // €0.50 per km penalty
    const score = totalSavings * coverageRatio - distancePenalty;

    storeScores[store.id] = { store, score, itemsCovered, totalSavings };
  }

  // Select top stores by score
  const rankedStores = Object.values(storeScores)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxStores);

  const selectedStoreIds = new Set(rankedStores.map(s => s.store.id));

  // Assign each item to cheapest among selected stores
  const assignments = {};
  for (const item of items) {
    let bestPrice = Infinity;
    let bestStoreId = null;

    for (const sid of selectedStoreIds) {
      const price = priceMatrix[item.prod_id]?.[sid];
      if (price && price.effectivePrice < bestPrice) {
        bestPrice = price.effectivePrice;
        bestStoreId = sid;
      }
    }

    if (bestStoreId) {
      assignments[item.prod_id] = { storeId: bestStoreId, price: bestPrice };
    }
  }

  return buildResult(items, assignments, stores, priceMatrix);
}

// Build final result from assignments
function buildResult(items, assignments, stores, priceMatrix) {
  const groups = {};

  for (const item of items) {
    const assignment = assignments[item.prod_id];
    if (!assignment) continue;

    if (!groups[assignment.storeId]) {
      const store = stores.find(s => s.id === assignment.storeId);
      groups[assignment.storeId] = { store, items: [], subtotal: 0 };
    }

    const priceData = priceMatrix[item.prod_id]?.[assignment.storeId];
    const enrichedItem = {
      ...item,
      assignedStore: assignment.storeId,
      price: priceData?.price || 0,
      effectivePrice: priceData?.effectivePrice || 0,
      offerLabel: priceData?.offerLabel,
      offerEnd: priceData?.offerEnd,
    };

    groups[assignment.storeId].items.push(enrichedItem);
    groups[assignment.storeId].subtotal += enrichedItem.effectivePrice * item.quantity;
  }

  const storeGroups = Object.values(groups).map(g => ({
    ...g,
    subtotal: Math.round(g.subtotal * 100) / 100,
  }));

  const totalOptimized = storeGroups.reduce((sum, g) => sum + g.subtotal, 0);
  const totalOriginal = items.reduce((sum, item) => {
    const prices = Object.values(priceMatrix[item.prod_id] || {});
    const maxPrice = prices.length > 0 ? Math.max(...prices.map(p => p.price)) : 0;
    return sum + maxPrice * item.quantity;
  }, 0);

  return {
    storeGroups,
    totalOriginal: Math.round(totalOriginal * 100) / 100,
    totalOptimized: Math.round(totalOptimized * 100) / 100,
    totalSavings: Math.round((totalOriginal - totalOptimized) * 100) / 100,
  };
}

// Calculate optimal route (nearest neighbor heuristic for TSP)
function calculateRoute(storeGroups, startLat, startLng) {
  if (storeGroups.length === 0) return { stops: [], totalDistance: 0, totalTime: 0 };

  const points = storeGroups.map(g => ({
    id: g.store.id,
    name: g.store.name,
    address: g.store.address,
    lat: g.store.latitude,
    lng: g.store.longitude,
    itemsCount: g.items.length,
  }));

  // Nearest neighbor TSP
  const visited = new Set();
  const route = [];
  let currentLat = startLat;
  let currentLng = startLng;
  let totalDistance = 0;

  while (visited.size < points.length) {
    let nearest = null;
    let nearestDist = Infinity;

    for (const point of points) {
      if (visited.has(point.id)) continue;
      const dist = haversine(currentLat, currentLng, point.lat, point.lng);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = point;
      }
    }

    if (nearest) {
      visited.add(nearest.id);
      totalDistance += nearestDist;
      route.push({
        ...nearest,
        distanceFromPrevious: Math.round(nearestDist * 100) / 100,
        travelTime: estimateTravelTime(nearestDist),
        shoppingTime: estimateShoppingTime(nearest.itemsCount),
      });
      currentLat = nearest.lat;
      currentLng = nearest.lng;
    }
  }

  // Add return trip
  const returnDist = haversine(currentLat, currentLng, startLat, startLng);
  totalDistance += returnDist;

  const totalTravelTime = route.reduce((sum, s) => sum + s.travelTime, 0) + estimateTravelTime(returnDist);
  const totalShoppingTime = route.reduce((sum, s) => sum + s.shoppingTime, 0);

  return {
    stops: route,
    totalDistance: Math.round(totalDistance * 100) / 100,
    totalTime: totalTravelTime + totalShoppingTime,
    travelTime: totalTravelTime,
    shoppingTime: totalShoppingTime,
    returnDistance: Math.round(returnDist * 100) / 100,
  };
}

export default { optimizeCart };
