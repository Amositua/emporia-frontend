import { useMutation, useQuery } from '@tanstack/react-query';
import { sellerApi, buyerApi, driverApi } from '../lib/api';

export function useSellerLogin() {
  return useMutation({
    mutationFn: sellerApi.login,
  });
}

export function useSaveBankAccount() {
  return useMutation({
    mutationFn: sellerApi.saveBankAccount,
  });
}

export function useBankAccountDetails() {
  return useQuery({
    queryKey: ['bankAccountDetails'],
    queryFn: sellerApi.getBankAccountDetails,
  });
}

export function useCreateTrade() {
  return useMutation({
    mutationFn: sellerApi.createTrade,
  });
}

export function useSellerTrades() {
  return useQuery({
    queryKey: ['sellerTrades'],
    queryFn: sellerApi.getTradesForSeller,
  });
}

export function useNetworkDrivers() {
  return useQuery({
    queryKey: ['networkDrivers'],
    queryFn: sellerApi.getNetworkDrivers,
  });
}

export function useBuyerLogin() {
  return useMutation({
    mutationFn: buyerApi.login,
  });
}

export function useBuyerTrades() {
  return useQuery({
    queryKey: ['buyerTrades'],
    queryFn: buyerApi.getBuyerTrades,
  });
}

export function useDriverLogin() {
  return useMutation({
    mutationFn: driverApi.login,
  });
}
