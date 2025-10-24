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