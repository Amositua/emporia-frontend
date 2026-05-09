import { apiClient } from './apiClient';

export const sellerApi = {
  async login({ phoneNumber, businessName }) {
    return apiClient.request('/auth/seller/login', {
      method: 'POST',
      body: { phoneNumber, businessName },
    });
  },

  async saveBankAccount({ accountNumber, accountName, bankName }) {
    const stored = localStorage.getItem('emporia_user');
    const user = stored ? JSON.parse(stored) : null;
    const token = user?.token || user?.accessToken || user?.access_token;

    return apiClient.request('/bank-account/save', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: { accountNumber, accountName, bankName },
    });
  },

  async getBankAccountDetails() {
    const stored = localStorage.getItem('emporia_user');
    const user = stored ? JSON.parse(stored) : null;
    const token = user?.token || user?.accessToken || user?.access_token;

    return apiClient.request('/bank-account/details', {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  async createTrade({ goodsType, quantity, amount, deliveryDate, deliveryTime, buyerPhoneNumber, buyerName }) {
    const stored = localStorage.getItem('emporia_user');
    const user = stored ? JSON.parse(stored) : null;
    const token = user?.token || user?.accessToken || user?.access_token;

    const body = { goodsType, quantity, amount, deliveryDate, deliveryTime };
    if (buyerPhoneNumber) body.buyerPhoneNumber = buyerPhoneNumber;
    if (buyerName) body.buyerName = buyerName;

    return apiClient.request('/trade/create', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body,
    });
  },

  async getTradesForSeller() {
    const stored = localStorage.getItem('emporia_user');
    const user = stored ? JSON.parse(stored) : null;
    const token = user?.token || user?.accessToken || user?.access_token;

    return apiClient.request('/trade/seller/getTradeForSeller', {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  async getNetworkDrivers() {
    const stored = localStorage.getItem('emporia_user');
    const user = stored ? JSON.parse(stored) : null;
    const token = user?.token || user?.accessToken || user?.access_token;

    return apiClient.request('/trade/seller/network/drivers', {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  async inviteDriver(tradeId) {
    const stored = localStorage.getItem('emporia_user');
    const user = stored ? JSON.parse(stored) : null;
    const token = user?.token || user?.accessToken || user?.access_token;

    return apiClient.request(`/trade/${tradeId}/driver-invite`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  async unassignDriver(tradeId) {
    const stored = localStorage.getItem('emporia_user');
    const user = stored ? JSON.parse(stored) : null;
    const token = user?.token || user?.accessToken || user?.access_token;

    return apiClient.request(`/trade/${tradeId}/unassign-driver`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  async viewDispute(tradeId) {
    const stored = localStorage.getItem('emporia_user');
    const user = stored ? JSON.parse(stored) : null;
    const token = user?.token || user?.accessToken || user?.access_token;

    return apiClient.request(`/trade/${tradeId}/view-dispute`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  async editTrade(tradeId, data) {
    const stored = localStorage.getItem('emporia_user');
    const user = stored ? JSON.parse(stored) : null;
    const token = user?.token || user?.accessToken || user?.access_token;

    return apiClient.request(`/trade/${tradeId}/edit`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: data,
    });
  },

  async inviteBuyer(tradeId) {
    const stored = localStorage.getItem('emporia_user');
    const user = stored ? JSON.parse(stored) : null;
    const token = user?.token || user?.accessToken || user?.access_token;

    return apiClient.request(`/trade/${tradeId}/buyer-invite`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  async assignDriver(tradeId, driverPhoneNumber) {
    const stored = localStorage.getItem('emporia_user');
    const user = stored ? JSON.parse(stored) : null;
    const token = user?.token || user?.accessToken || user?.access_token;

    return apiClient.request(`/trade/${tradeId}/assign-driver`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: { driverPhoneNumber },
    });
  },
};

export const buyerApi = {
  async login({ phoneNumber, inviteCode, personalName }) {
    console.log({ phoneNumber, inviteCode, personalName })
    const body = { phoneNumber };
    if (inviteCode) body.inviteCode = inviteCode;
    if (personalName) body.personalName = personalName;
    return apiClient.request('/auth/buyer/login', {
      method: 'POST',
      body,
    });
  },

  async getBuyerTrades() {
    const stored = localStorage.getItem('emporia_user');
    const user = stored ? JSON.parse(stored) : null;
    const token = user?.token || user?.accessToken || user?.access_token;

    return apiClient.request('/trade/buyer/getTradeForBuyer', {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  async updateTradeAddress(tradeId, deliveryAddress) {
    const stored = localStorage.getItem('emporia_user');
    const user = stored ? JSON.parse(stored) : null;
    const token = user?.token || user?.accessToken || user?.access_token;

    return apiClient.request(`/trade/${tradeId}/address`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: { deliveryAddress },
    });
  },

  async flagTrade(tradeId, reason) {
    const stored = localStorage.getItem('emporia_user');
    const user = stored ? JSON.parse(stored) : null;
    const token = user?.token || user?.accessToken || user?.access_token;

    return apiClient.request(`/trade/${tradeId}/flag`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: { reason },
    });
  },

  async initializePayment(tradeId, data) {
    const stored = localStorage.getItem('emporia_user');
    const user = stored ? JSON.parse(stored) : null;
    const token = user?.token || user?.accessToken || user?.access_token;

    return apiClient.request(`/payment/initialize/${tradeId}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: data,
    });
  },

  async verifyPayment(tradeId, trxref) {
    const stored = localStorage.getItem('emporia_user');
    const user = stored ? JSON.parse(stored) : null;
    const token = user?.token || user?.accessToken || user?.access_token;

    return apiClient.request(`/payment/verify/${tradeId}/${trxref}`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
};

export const driverApi = {
  async login({ phoneNumber, businessName, linkCode }) {
    console.log({ phoneNumber, businessName, linkCode })
    return apiClient.request('/auth/driver/login', {
      method: 'POST',
      body: { phoneNumber, businessName, linkCode },
    });
  },

  async getDriverTrades() {
    const stored = localStorage.getItem('emporia_user');
    const user = stored ? JSON.parse(stored) : null;
    const token = user?.token || user?.accessToken || user?.access_token;

    return apiClient.request('/trade/driver/getTradeForDriver', {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  async acceptTrade(tradeId) {
    const stored = localStorage.getItem('emporia_user');
    const user = stored ? JSON.parse(stored) : null;
    const token = user?.token || user?.accessToken || user?.access_token;

    return apiClient.request(`/trade/${tradeId}/driver-accept`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  async confirmDelivery(tradeId, deliveryCode) {
    const stored = localStorage.getItem('emporia_user');
    const user = stored ? JSON.parse(stored) : null;
    const token = user?.token || user?.accessToken || user?.access_token;

    return apiClient.request(`/trade/${tradeId}/deliver`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: { deliveryCode },
    });
  },

  /* Persist driver lat/lng in localStorage (keyed per trade).
     In production this would be a WebSocket push or a dedicated backend endpoint. */
  saveDriverLocation(tradeId, lat, lng) {
    try {
      const key = `emporia_driver_location_${tradeId}`;
      localStorage.setItem(key, JSON.stringify({ lat, lng, ts: Date.now() }));
    } catch (_) {}
  },

  getDriverLocation(tradeId) {
    try {
      const raw = localStorage.getItem(`emporia_driver_location_${tradeId}`);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  },
};
