# Project Overview

This is a digital wellness application built with React Native/Expo that helps users reduce screen time, build healthy digital habits, and connect with a community of like-minded individuals. The app provides goal tracking, progress monitoring, social features, and community engagement to support users on their digital wellness journey.

## Key Technologies

- **Framework**: React Native with Expo
- **UI Library**: React Native components with custom styling
- **Navigation**: Expo Router with tab-based navigation
- **State Management**: React hooks and context providers
- **Backend**: Firebase Authentication and Firestore
- **Storage**: Firebase Storage and AsyncStorage
- **Styling**: Custom CSS-in-JS styling approach
- **Icons**: Lucide React Native icons
- **Internationalization**: Custom translation system with multiple language support

## Project Structure

```
├── app/                    # Main application screens and routing
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks for state and logic
├── lib/                    # Business logic, services, and utilities
├── assets/                 # Images and static assets
├── constants/              # Application constants (colors, themes)
├── supabase/               # Database migrations (legacy)
```

## Core Features

1. **User Authentication**: Email/password authentication with Firebase
2. **Goal Tracking**: Create, track, and complete daily wellness goals
3. **Progress Monitoring**: Dashboard with statistics and insights
4. **Social Features**: Friend system, messaging, and user search
5. **Community**: Post sharing, comments, and engagement
6. **Profile Management**: Customizable profiles with avatar support
7. **Subscription Plans**: Tiered feature access (Normal, Pro, ProMax)
8. **Internationalization**: Multi-language support (English, Chinese, Spanish, etc.)
9. **Dark Mode**: Theme switching capability

## Architecture

The application follows a modular architecture with clear separation of concerns:

- **Screens** (`app/`): Contain UI logic and component composition
- **Components** (`components/`): Reusable UI elements
- **Hooks** (`hooks/`): Custom hooks for shared logic and state management
- **Services** (`lib/`): Business logic, API integrations, and data access layers
- **Utilities** (`lib/`): Helper functions and cross-cutting concerns

Data is persisted using a combination of Firebase (primary) and AsyncStorage (local caching). The app uses a custom translation system to support multiple languages.

## Building and Running

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager
- Expo CLI (installed globally)

### Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for web
npm run build:web

# Run linting
npm run lint
```

### Environment Setup

The application requires several environment variables to be configured in a `.env` file:

- Firebase configuration keys (API key, project ID, etc.)
- Supabase configuration (legacy)

## Development Conventions

1. **Component Structure**: Components follow a consistent structure with styles defined at the bottom of the file
2. **State Management**: Uses React hooks and custom context providers for state management
3. **Styling**: Uses StyleSheet.create for component styling with dynamic theming support
4. **Error Handling**: Comprehensive error handling with user-friendly messages
5. **Internationalization**: All user-facing strings are translated using the custom translation system
6. **Type Safety**: TypeScript is used throughout with strict typing
7. **Code Organization**: Files are organized by feature/domain with clear naming conventions

## Testing

Currently, the project doesn't have a comprehensive testing suite implemented. For development, you can:

1. Run the application in development mode with `npm run dev`
2. Use Expo's built-in development tools for debugging
3. Test functionality manually through the UI

## Deployment

The application can be deployed to multiple platforms:

1. **Web**: Build with `npm run build:web` and deploy the output
2. **Mobile**: Use Expo's build services to create native app bundles
3. **Expo Go**: Run directly on devices using the Expo Go app during development

For production deployment, ensure all environment variables are properly configured and Firebase/Supabase services are set up correctly.

implement the stripe payment system:
Front-End to Back-End Connection Summary

  Architecture Overview

  This application uses Firebase as the backend platform with Firestore as the database and Cloud Functions for
  server-side logic. The front-end connects to these services through the Firebase SDK, while Stripe handles payment
  processing.

  Connection Flow

  1. Front-End Initialization
   - The front-end loads Firebase SDKs from CDN (/__/firebase/10.0.0/ endpoints)
   - Firebase Hosting automatically serves the appropriate SDK versions
   - The app initializes Firebase with firebase.initializeApp() through the auto-generated init.js

  2. Authentication Flow
   - Firebase UI handles user authentication (Google, Email)
   - On successful authentication, a user document is created in Firestore
   - A Stripe customer is automatically created via Cloud Functions (createStripeCustomer)

  3. Data Synchronization
   - The front-end uses Firestore listeners to receive real-time updates:
     - Payment methods collection: stripe_customers/{userId}/payment_methods
     - Payments collection: stripe_customers/{userId}/payments
   - Changes in these collections automatically update the UI

  4. Payment Processing Flow
   1. Add Payment Method:
      - Front-end collects card details using Stripe Elements
      - Calls stripe.confirmCardSetup() with the setup secret
      - Adds payment method ID to Firestore: stripe_customers/{userId}/payment_methods

   2. Create Payment:
      - User submits payment form in front-end
      - Front-end adds payment data to Firestore: stripe_customers/{userId}/payments
      - Cloud Function createStripePayment is triggered
      - Function creates actual Stripe payment and updates Firestore with result

   3. 3D Secure Handling:
      - If required, Cloud Function confirmStripePayment handles confirmation
      - Front-end listens for status changes and updates UI accordingly

  Key Code Components

  Front-End Connection Points:
   1. Firebase Initialization:
   1    <script src="/__/firebase/10.0.0/firebase-app-compat.js"></script>
   2    <script src="/__/firebase/10.0.0/firebase-auth-compat.js"></script>
   3    <script src="/__/firebase/10.0.0/firebase-firestore-compat.js"></script>
   4    <script src="/__/firebase/init.js"></script>

   2. Firestore Listeners:
   1    firebase.firestore().collection('stripe_customers')
   2      .doc(currentUser.uid)
   3      .collection('payment_methods')
   4      .onSnapshot((snapshot) => { /* UI updates */ });

   3. Stripe Integration:
   1    const stripe = Stripe('pk_test_...'); // Publishable key
   2    const { setupIntent, error } = await stripe.confirmCardSetup(
   3      customerData.setup_secret, { /* payment method */ });

  Back-End Connection Points:
   1. Cloud Functions Triggers:
    1    // Triggered when user is created
    2    exports.createStripeCustomer = functions.auth.user().onCreate(async (user) => { ... });
    3 
    4    // Triggered when payment method is added
    5    exports.addPaymentMethodDetails = functions.firestore
    6      .document('/stripe_customers/{userId}/payment_methods/{pushId}')
    7      .onCreate(async (snap, context) => { ... });
    8 
    9    // Triggered when payment is created
   10    exports.createStripePayment = functions.firestore
   11      .document('stripe_customers/{userId}/payments/{pushId}')
   12      .onCreate(async (snap, context) => { ... });

   2. Stripe API Integration:
   1    const stripe = new Stripe(functions.config().stripe.secret, {
   2      apiVersion: '2020-08-27',
   3    });
   4 
   5    // Create customer
   6    const customer = await stripe.customers.create({ email: user.email });
   7 
   8    // Create payment
   9    const payment = await stripe.paymentIntents.create({ /* payment details */ });

  Data Flow Summary

   1. User authenticates → Firebase creates user → Cloud Function creates Stripe customer
   2. User adds payment method → Front-end collects card details → Stripe processes setup → Firestore updated → Cloud
      Function retrieves payment method details
   3. User initiates payment → Front-end adds to Firestore → Cloud Function creates Stripe payment → Firestore updated
      with result
   4. Real-time listeners update UI as data changes in Firestore
