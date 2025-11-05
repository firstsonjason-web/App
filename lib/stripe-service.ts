// This file is a fallback that should not normally be used
// Platform-specific files (.native.ts and .web.ts) will be resolved first
import React from 'react';
import type { StripeHookResult } from './stripe-service.d';

export const useStripe = (): StripeHookResult => ({
  initPaymentSheet: (params?: any) => Promise.resolve({ error: null }),
  presentPaymentSheet: () => Promise.resolve({ error: null }),
});

export const StripeProvider = ({ children }: { children: React.ReactNode }) => {
  return children;
};
