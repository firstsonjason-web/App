// Type declarations for stripe-service
import React from 'react';

export interface PaymentSheetError {
  code?: string;
  message?: string;
  localizedMessage?: string;
}

export interface InitPaymentSheetParams {
  merchantDisplayName?: string;
  paymentIntentClientSecret?: string;
  allowsDelayedPaymentMethods?: boolean;
  defaultBillingDetails?: any;
  customerId?: string;
  customerEphemeralKeySecret?: string;
  setupIntentClientSecret?: string;
  applePay?: boolean;
  googlePay?: any;
  style?: 'alwaysLight' | 'alwaysDark' | 'automatic';
  returnURL?: string;
  primaryButtonLabel?: string;
  allowsPaymentMethodsRequiringShippingAddress?: boolean;
  billingDetailsCollectionConfiguration?: any;
  removeSavedPaymentMethodMessage?: string;
  appearance?: any;
}

export interface StripeHookResult {
  initPaymentSheet: (params?: InitPaymentSheetParams) => Promise<{ error?: PaymentSheetError | null }>;
  presentPaymentSheet: () => Promise<{ error?: PaymentSheetError | null }>;
}

export function useStripe(): StripeHookResult;

export const StripeProvider: React.FC<{ children: React.ReactNode }>;
