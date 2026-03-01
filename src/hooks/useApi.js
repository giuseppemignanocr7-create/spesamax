import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Generic hook for API calls with loading/error states and fallback
 */
export function useApi(fetchFn, fallbackData = null, deps = []) {
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      console.warn('API fallback:', err.message);
      setError(err.message);
      if (fallbackData) setData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, setData };
}

/**
 * Dashboard stats
 */
export function useDashboardStats() {
  return useApi(() => api.getDashboardStats(), {
    stats: { productsTracked: 30, activeOffers: 12, storesMonitored: 10, communityReports: 5 },
    topOffers: [],
  });
}

/**
 * Products with prices
 */
export function useProducts(params = {}) {
  return useApi(() => api.getProducts(params), { products: [], total: 0 }, [JSON.stringify(params)]);
}

/**
 * Single product with prices and history
 */
export function useProduct(id) {
  return useApi(() => api.getProduct(id), null, [id]);
}

/**
 * Stores
 */
export function useStores(params = {}) {
  return useApi(() => api.getStores(params), { stores: [] }, [JSON.stringify(params)]);
}

/**
 * Shopping lists
 */
export function useLists() {
  return useApi(() => api.getLists(), { lists: [] });
}

/**
 * Single list with items
 */
export function useList(id) {
  return useApi(() => api.getList(id), null, [id]);
}

/**
 * AI suggestions
 */
export function useAiSuggestions() {
  return useApi(() => api.getAISuggestions(), { suggestions: [] });
}

/**
 * Community reports
 */
export function useCommunityReports(params = {}) {
  return useApi(() => api.getCommunityReports(params), { reports: [], total: 0 }, [JSON.stringify(params)]);
}

/**
 * Notifications
 */
export function useNotifications() {
  return useApi(() => api.getNotifications(), { notifications: [], unreadCount: 0 });
}

/**
 * Price alerts
 */
export function useAlerts() {
  return useApi(() => api.getAlerts(), { alerts: [] });
}

/**
 * Leaderboard
 */
export function useLeaderboard(city = 'Milano') {
  return useApi(() => api.getLeaderboard(city), { leaderboard: [] }, [city]);
}
