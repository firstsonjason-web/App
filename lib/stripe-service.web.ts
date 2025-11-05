// Web implementation - mock/stub for Stripe
import React from 'react';
import type { StripeHookResult } from './stripe-service.d';

// Mock useStripe hook for web
export const useStripe = (): StripeHookResult => ({
  initPaymentSheet: (params?: any) => Promise.resolve({ error: null }),
  presentPaymentSheet: () => Promise.resolve({ error: null }),
});

// Mock StripeProvider for web
export const StripeProvider = ({ children }: { children: React.ReactNode }) => {
  return children;
};
