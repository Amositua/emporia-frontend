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

  async createTrade({ goodsType, quantity, amount, deliveryDate, deliveryTime }) {
    const stored = localStorage.getItem('emporia_user');
    const user = stored ? JSON.parse(stored) : null;
    const token = user?.token || user?.accessToken || user?.access_token;

    return apiClient.request('/trade/create', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: { goodsType, quantity, amount, deliveryDate, deliveryTime },
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
};

export const buyerApi = {
  async login({ phoneNumber, inviteCode }) {
    const body = { phoneNumber };
    if (inviteCode) body.inviteCode = inviteCode;
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
};

export const driverApi = {
  async login({ phoneNumber, businessName, linkCode }) {
    return apiClient.request('/auth/driver/login', {
      method: 'POST',
      body: { phoneNumber, businessName, linkCode },
    });
  },
};
