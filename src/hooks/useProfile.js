import { useMutation } from '@tanstack/react-query';
import { sellerApi, buyerApi, driverApi } from '../lib/api';

export function useSellerLogin() {
  return useMutation({
    mutationFn: sellerApi.login,
  });
}

export function useBuyerLogin() {
  return useMutation({
    mutationFn: buyerApi.login,
  });
}

export function useDriverLogin() {
  return useMutation({
    mutationFn: driverApi.login,
  });
}
