import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export function useViewDispute() {
  return useMutation({
    mutationFn: (tradeId) => sellerApi.viewDispute(tradeId),
  });
}

export function useEditTrade() {
  return useMutation({
    mutationFn: ({ tradeId, data }) => sellerApi.editTrade(tradeId, data),
  });
}
export function useInviteBuyer() {
  return useMutation({
    mutationFn: (tradeId) => sellerApi.inviteBuyer(tradeId),
  });
}

export function useInviteDriver() {
  return useMutation({
    mutationFn: (tradeId) => sellerApi.inviteDriver(tradeId),
  });
}

export function useUnassignDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tradeId) => sellerApi.unassignDriver(tradeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerTrades'] });
    },
  });
}

export function useAssignDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tradeId, driverPhoneNumber }) => sellerApi.assignDriver(tradeId, driverPhoneNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerTrades'] });
    },
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

export function useUpdateTradeAddress() {
  return useMutation({
    mutationFn: ({ tradeId, deliveryAddress }) => buyerApi.updateTradeAddress(tradeId, deliveryAddress),
  });
}

export function useFlagTrade() {
  return useMutation({
    mutationFn: ({ tradeId, reason }) => buyerApi.flagTrade(tradeId, reason),
  });
}

export function useInitializePayment() {
  return useMutation({
    mutationFn: ({ tradeId, data }) => buyerApi.initializePayment(tradeId, data),
  });
}

export function useVerifyPayment() {
  return useMutation({
    mutationFn: ({ tradeId, trxref }) => buyerApi.verifyPayment(tradeId, trxref),
  });
}

export function useDriverLogin() {
  return useMutation({
    mutationFn: driverApi.login,
  });
}

export function useDriverTrades() {
  return useQuery({
    queryKey: ['driverTrades'],
    queryFn: driverApi.getDriverTrades,
  });
}

export function useDriverAcceptTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tradeId) => driverApi.acceptTrade(tradeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverTrades'] });
    },
  });
}
export function useConfirmDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tradeId, deliveryCode }) => driverApi.confirmDelivery(tradeId, deliveryCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverTrades'] });
    },
  });
}
