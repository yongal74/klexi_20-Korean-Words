# Daily Korean

## Overview

Daily Korean is a comprehensive Korean language learning mobile application built with Expo (React Native). It provides daily vocabulary flashcards organized by TOPIK proficiency levels (TOPIK I-II, Levels 1-4), interactive quizzes with wrong answer tracking, Hangeul alphabet learning, related words with K-Drama expressions, custom vocabulary, text-to-speech pronunciation, progress tracking, and bookmarking. The app uses a tab-based navigation with four main sections: Learn (flashcards), Quiz, Progress, and Settings, plus stack screens for Hangeul, Review, Custom Words, and Related Words.

## Recent Changes (Feb 2026)

- Added Hangeul alphabet learning screen with all 40 characters, pronunciation tips, examples, and syllable formation
- Added Related Words system showing 20 related words per vocabulary item (including 5 K-Drama expressions)
- Added two course modes: 20 words/day (2-month course) or 10 words/day (4-month course)
- Added Custom Vocabulary with sentence generation for user-created words
- Added Wrong Answer Review system with TTS auto-play for words and sentences
- Added Text-to-Speech (expo-speech) throughout flashcards, quiz, and review screens
- Created SEO-optimized landing page with schema markup, FAQ, testimonials, and feature highlights
- Updated AppContext with custom words, wrong answers, and course mode state management
- Updated storage layer with CustomWord and WrongAnswer data structures

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, using the new architecture (`newArchEnabled: true`)
- **Routing**: expo-router with file-based routing. Tab layout at `app/(tabs)/` with four tabs: index (Learn), quiz, progress, settings. Stack screens: hangeul, review, custom-words, related-words-screen
- **State Management**: React Context (`lib/AppContext.tsx`) wraps the entire app and manages user settings, daily learning state, progress data, bookmarks, custom words, and wrong answers. TanStack React Query is also set up for server API calls
- **Local Storage**: All user data persists via `@react-native-async-storage/async-storage` in `lib/storage.ts`. Keys: settings, progress, daily state, bookmarks, custom words, wrong answers
- **Vocabulary Data**: Hardcoded in `lib/vocabulary.ts` as a static dictionary organized by TOPIK level
- **Hangeul Data**: Complete Korean alphabet data in `lib/hangeul.ts` with consonants, vowels, double consonants, compound vowels, and syllable examples
- **Related Words**: Category-based and manual mappings in `lib/related-words.ts` with K-Drama expression integration
- **Text-to-Speech**: expo-speech for Korean/English pronunciation on flashcards, quiz, review, custom words, and Hangeul screens
- **Animations**: react-native-reanimated for flashcard flip animations and quiz feedback
- **Haptics**: expo-haptics for tactile feedback on interactions
- **Fonts**: Noto Sans KR (Korean font) loaded via `@expo-google-fonts/noto-sans-kr`
- **Styling**: Dark theme by default using constants in `constants/colors.ts`. StyleSheet-based styling throughout
- **Platform Support**: iOS, Android, and Web. Platform-specific adjustments for web insets and keyboard handling

### Key Screens

- **Learn** (`app/(tabs)/index.tsx`): Flashcards with TTS, bookmark, and related words navigation
- **Quiz** (`app/(tabs)/quiz.tsx`): Multiple choice quiz with wrong answer tracking and TTS
- **Progress** (`app/(tabs)/progress.tsx`): Stats, streaks, and daily history
- **Settings** (`app/(tabs)/settings.tsx`): Course mode (20/10 words), TOPIK level, pronunciation toggle, tools navigation
- **Hangeul** (`app/hangeul.tsx`): Korean alphabet learning with tabs for consonants, vowels, doubles, compounds, syllables
- **Review** (`app/review.tsx`): Wrong answer list with auto-play TTS for all words and sentences
- **Custom Words** (`app/custom-words.tsx`): Add/manage custom vocabulary with sentence generation
- **Related Words** (`app/related-words-screen.tsx`): 20 related words per vocabulary item with K-Drama section

### Backend (Express)

- **Server**: Express 5 server in `server/index.ts` with CORS configured for Replit domains
- **Landing Page**: SEO-optimized HTML at `server/templates/landing-page.html` with schema.org markup, FAQ, and feature sections
- **Routes**: Defined in `server/routes.ts` — minimal API routes
- **Static Serving**: In production, serves the Expo web build from `dist/`. In development, proxies to Metro

### Database Schema (Drizzle + PostgreSQL)

- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: `shared/schema.ts` — users table with id, username, password
- **Current Status**: Database schema exists but app uses client-side AsyncStorage for all data persistence

### Build & Deployment

- **Development**: Two processes — Expo dev server (`expo:dev` port 8081) and Express server (`server:dev` port 5000)
- **Production Build**: Custom build script bundles web app via Metro, serves via Express

## External Dependencies

### Core Libraries
- **Expo SDK 54**: Mobile app framework
- **React 19.1** / **React Native 0.81.5**: UI framework
- **expo-router**: File-based routing
- **expo-speech**: Text-to-speech for Korean pronunciation
- **react-native-reanimated**: Animations
- **expo-haptics**: Tactile feedback
- **@react-native-async-storage/async-storage**: Local data persistence
- **@tanstack/react-query**: Server state management
- **@expo-google-fonts/noto-sans-kr**: Korean font support
