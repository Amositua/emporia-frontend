import { apiClient } from './apiClient';

export const sellerApi = {
  async login({ phoneNumber, businessName }) {
    return apiClient.request('/auth/seller/login', {
      method: 'POST',
      body: { phoneNumber, businessName },
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
};

export const driverApi = {
  async login({ phoneNumber, businessName, linkCode }) {
    return apiClient.request('/auth/driver/login', {
      method: 'POST',
      body: { phoneNumber, businessName, linkCode },
    });
  },
};
