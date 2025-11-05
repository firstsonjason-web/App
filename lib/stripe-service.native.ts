// Native (iOS/Android) implementation
import { initStripe, useStripe, StripeProvider } from '@stripe/stripe-react-native';

// Initialize Stripe with the publishable key
initStripe({
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SJwQ0BXjOxrF9eiUDKWbDcs0ZrjrIE6asS3mCt9Tj9PHWmNq4XVo5VzHOCvbUvH9ENxwEx2ioBlZ4eKyrl0XkCJ00200nBwlX',
  merchantIdentifier: 'merchant.com.yourapp.digitwellness',
});

export { useStripe, StripeProvider };
