# Daily Korean

## Overview

Daily Korean is a Korean language learning mobile application built with Expo (React Native). It provides daily vocabulary flashcards organized by TOPIK proficiency levels (TOPIK I-II, Levels 1-4), interactive quizzes, progress tracking, and bookmarking. The app uses a tab-based navigation with four main sections: Learn (flashcards), Quiz, Progress, and Settings. Vocabulary data is bundled client-side, and user progress/settings are persisted locally via AsyncStorage. A backend Express server exists but is minimally used — the app is primarily client-driven.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, using the new architecture (`newArchEnabled: true`)
- **Routing**: expo-router with file-based routing. The main app uses a tab layout at `app/(tabs)/` with four tabs: index (Learn), quiz, progress, settings
- **State Management**: React Context (`lib/AppContext.tsx`) wraps the entire app and manages user settings, daily learning state, progress data, and bookmarks. TanStack React Query is also set up (`lib/query-client.ts`) for server API calls but is lightly used
- **Local Storage**: All user data (settings, progress, daily state, bookmarks) persists via `@react-native-async-storage/async-storage` in `lib/storage.ts`
- **Vocabulary Data**: Hardcoded in `lib/vocabulary.ts` as a static dictionary organized by TOPIK level. Words include Korean text, English translation, pronunciation, part of speech, example sentences, and categories
- **Animations**: react-native-reanimated for flashcard flip animations and quiz feedback
- **Haptics**: expo-haptics for tactile feedback on interactions
- **Fonts**: Noto Sans KR (Korean font) loaded via `@expo-google-fonts/noto-sans-kr`
- **Styling**: Dark theme by default using constants in `constants/colors.ts`. StyleSheet-based styling throughout
- **Platform Support**: iOS, Android, and Web. Platform-specific adjustments for web insets and keyboard handling

### Backend (Express)

- **Server**: Express 5 server in `server/index.ts` with CORS configured for Replit domains and localhost
- **Routes**: Defined in `server/routes.ts` — currently minimal with no application-specific API routes implemented
- **Storage Layer**: `server/storage.ts` provides an in-memory storage implementation (`MemStorage`) with basic user CRUD operations. Implements an `IStorage` interface for future database backing
- **Static Serving**: In production, serves the Expo web build from a `dist/` directory. In development, proxies to the Expo Metro bundler

### Database Schema (Drizzle + PostgreSQL)

- **ORM**: Drizzle ORM with PostgreSQL dialect, configured in `drizzle.config.ts`
- **Schema**: Defined in `shared/schema.ts` — currently only has a `users` table with `id` (UUID), `username`, and `password` fields
- **Validation**: Uses `drizzle-zod` to generate Zod schemas from Drizzle table definitions
- **Current Status**: The database schema exists but isn't actively connected to the app's main functionality. The app currently uses client-side AsyncStorage for all data persistence. The database infrastructure is in place for future server-side features

### Build & Deployment

- **Development**: Two processes run simultaneously — Expo dev server (`expo:dev`) and Express server (`server:dev` via tsx)
- **Production Build**: Custom build script (`scripts/build.js`) that starts Metro, bundles the web app, then serves via Express
- **Server Build**: Uses esbuild to bundle the server code

## External Dependencies

### Core Libraries
- **Expo SDK 54**: Mobile app framework with managed workflow
- **React 19.1** / **React Native 0.81.5**: UI framework
- **expo-router 6**: File-based navigation
- **TanStack React Query 5**: Server state management (configured, lightly used)

### Database & ORM
- **PostgreSQL**: Database (requires `DATABASE_URL` environment variable)
- **Drizzle ORM 0.39**: TypeScript ORM for PostgreSQL
- **drizzle-zod**: Schema validation bridge
- **pg**: PostgreSQL client driver

### Server
- **Express 5**: HTTP server
- **http-proxy-middleware**: Proxies to Expo Metro dev server in development

### UI & UX
- **react-native-reanimated**: Animations (flashcard flips, shake effects)
- **react-native-gesture-handler**: Touch gesture support
- **react-native-keyboard-controller**: Keyboard-aware scrolling
- **expo-haptics**: Haptic feedback
- **expo-blur / expo-glass-effect**: Visual effects
- **@expo/vector-icons** (Ionicons, MaterialCommunityIcons, Feather): Icon sets
- **@expo-google-fonts/noto-sans-kr**: Korean typography

### Storage
- **@react-native-async-storage/async-storage**: Client-side key-value storage for all user data

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required for Drizzle)
- `EXPO_PUBLIC_DOMAIN`: Domain for API calls from the client
- `REPLIT_DEV_DOMAIN`: Used for CORS and Expo proxy configuration
- `REPLIT_DOMAINS`: Additional allowed CORS origins
- `REPLIT_INTERNAL_APP_DOMAIN`: Production deployment domain