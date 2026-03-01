const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseUrl = API_URL;
    this.token = localStorage.getItem('spesamax_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('spesamax_token', token);
    } else {
      localStorage.removeItem('spesamax_token');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('spesamax_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.setToken(null);
          window.dispatchEvent(new CustomEvent('auth:expired'));
        }
        throw new ApiError(data.error || 'Errore del server', response.status, data);
      }

      return data;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Errore di connessione al server. Verifica che il backend sia attivo.', 0, null);
    }
  }

  get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url);
  }

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
  }

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ─── AUTH ───────────────────────────────────────────
  async login(email, password) {
    const data = await this.post('/auth/login', { email, password });
    this.setToken(data.token);
    return data;
  }

  async register(userData) {
    const data = await this.post('/auth/register', userData);
    this.setToken(data.token);
    return data;
  }

  async getProfile() {
    return this.get('/auth/me');
  }

  async updateProfile(updates) {
    return this.put('/auth/profile', updates);
  }

  async changePassword(currentPassword, newPassword) {
    return this.put('/auth/password', { currentPassword, newPassword });
  }

  logout() {
    this.setToken(null);
  }

  // ─── PRODUCTS ───────────────────────────────────────
  async getProducts(params = {}) {
    return this.get('/products', params);
  }

  async getProduct(id) {
    return this.get(`/products/${id}`);
  }

  async getProductPrices(id) {
    return this.get(`/products/${id}/prices`);
  }

  async getProductHistory(id) {
    return this.get(`/products/${id}/history`);
  }

  async getCategories() {
    return this.get('/products/categories');
  }

  // ─── STORES ─────────────────────────────────────────
  async getStores(params = {}) {
    return this.get('/stores', params);
  }

  async getStore(id) {
    return this.get(`/stores/${id}`);
  }

  async getChains() {
    return this.get('/stores/chains');
  }

  // ─── SHOPPING LISTS ─────────────────────────────────
  async getLists() {
    return this.get('/lists');
  }

  async getList(id) {
    return this.get(`/lists/${id}`);
  }

  async createList(data) {
    return this.post('/lists', data);
  }

  async updateList(id, data) {
    return this.put(`/lists/${id}`, data);
  }

  async deleteList(id) {
    return this.delete(`/lists/${id}`);
  }

  async addListItem(listId, data) {
    return this.post(`/lists/${listId}/items`, data);
  }

  async updateListItem(listId, itemId, data) {
    return this.put(`/lists/${listId}/items/${itemId}`, data);
  }

  async deleteListItem(listId, itemId) {
    return this.delete(`/lists/${listId}/items/${itemId}`);
  }

  // ─── OPTIMIZER ──────────────────────────────────────
  async optimizeList(listId, options = {}) {
    return this.post(`/optimize/${listId}`, options);
  }

  async getOptimizationHistory() {
    return this.get('/optimize/history');
  }

  // ─── AI ─────────────────────────────────────────────
  async chatWithAI(message, conversationId = null) {
    return this.post('/ai/chat', { message, conversationId });
  }

  async getAISuggestions() {
    return this.get('/ai/suggestions');
  }

  async getConversations() {
    return this.get('/ai/conversations');
  }

  async getConversationMessages(conversationId) {
    return this.get(`/ai/conversations/${conversationId}/messages`);
  }

  // ─── COMMUNITY ──────────────────────────────────────
  async getCommunityReports(params = {}) {
    return this.get('/community', params);
  }

  async createReport(data) {
    return this.post('/community', data);
  }

  async voteReport(reportId, vote) {
    return this.post(`/community/${reportId}/vote`, { vote });
  }

  async getLeaderboard(city = 'Milano') {
    return this.get('/community/leaderboard', { city });
  }

  // ─── NOTIFICATIONS ──────────────────────────────────
  async getNotifications(params = {}) {
    return this.get('/notifications', params);
  }

  async markNotificationRead(id) {
    return this.put(`/notifications/${id}/read`);
  }

  async markAllNotificationsRead() {
    return this.put('/notifications/read-all');
  }

  // ─── ALERTS ─────────────────────────────────────────
  async getAlerts() {
    return this.get('/alerts');
  }

  async createAlert(data) {
    return this.post('/alerts', data);
  }

  async deleteAlert(id) {
    return this.delete(`/alerts/${id}`);
  }

  // ─── DASHBOARD ──────────────────────────────────────
  async getDashboardStats() {
    return this.get('/dashboard/stats');
  }

  // ─── HEALTH ─────────────────────────────────────────
  async checkHealth() {
    return this.get('/health');
  }
}

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

const api = new ApiService();
export default api;
export { ApiError };
