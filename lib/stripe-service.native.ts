// Native (iOS/Android) implementation
import { initStripe, useStripe, StripeProvider } from '@stripe/stripe-react-native';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SJwQ0BXjOxrF9eiUDKWbDcs0ZrjrIE6asS3mCt9Tj9PHWmNq4XVo5VzHOCvbUvH9ENxwEx2ioBlZ4eKyrl0XkCJ00200nBwlX';

initStripe({
  publishableKey: STRIPE_PUBLISHABLE_KEY,
  merchantIdentifier: 'merchant.com.homingchan.app',
});

export { useStripe, StripeProvider };
