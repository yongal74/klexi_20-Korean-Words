# Daily Korean

## Overview

Daily Korean is a comprehensive Korean language learning mobile application built with Expo (React Native). It provides daily vocabulary flashcards organized by 6 TOPIK proficiency levels (7,200 total words: 1,200 words per level, 20 words/day × 60 days per level = 360 days total). Features include interactive quizzes with wrong answer tracking, Hangeul alphabet learning, K-Culture themed lessons, Word Network visualization, related words with K-Drama expressions, custom vocabulary, text-to-speech with slow/repeat playback and syllable breakdown, grammar pattern detection on example sentences, sentence practice (fill-in-blank & word ordering), daily missions system, progress tracking, and bookmarking. The app uses a tab-based navigation with four tabs: Home (learning hub), Quiz, Progress, and Settings, plus stack screens for Welcome/Auth, Word Learning, Theme Lessons, Word Network, Hangeul, Review, Custom Words, Related Words, Sentence Practice, and Daily Missions.

## Recent Changes (Feb 2026)

- Added authentication system with email signup/login, social login placeholders (Google, Apple, Kakao), and guest mode
- Redesigned Home tab as learning hub with 4 theme cards: Word Learning, K-Culture Themes, Word Network, Korean Alphabet
- Added K-Culture Themed Lessons with 6 categories: K-Drama, K-Pop, K-Food, Travel, Internet Slang, Manners (3,600 words: 100 per theme per TOPIK level)
- Added Word Network screen for exploring category-based word connections with visual graph
- Moved flashcard learning to dedicated /word-learn route
- Added Welcome screen with auth gating (unauthenticated users redirected to /welcome)
- Added user profile management with sign-out in Settings
- Added Hangeul alphabet learning screen with all 40 characters, pronunciation tips, examples, syllable formation, and Hangeul Principles tab (origin, consonant shapes, vowel philosophy, syllable blocks)
- Added Related Words system showing 20 related words per vocabulary item (including 5 K-Drama expressions)
- Added two course modes: 20 words/day (2-month course) or 10 words/day (4-month course)
- Added Custom Vocabulary with sentence generation for user-created words
- Added Wrong Answer Review system with TTS auto-play for words and sentences
- Added Text-to-Speech (expo-speech) throughout flashcards, quiz, and review screens
- Created SEO-optimized landing page with schema markup, FAQ, testimonials, and feature highlights
- Expanded vocabulary to full 7,200 words (6 TOPIK levels × 1,200 words each, split into 18 modular files)
- Added pronunciation features: slow playback, repeat TTS, syllable breakdown visualization on flashcards
- Added grammar pattern detection (lib/grammar-patterns.ts) showing grammar tags on example sentences
- Added Sentence Practice screen with fill-in-blank and word ordering modes
- Added Daily Missions system with 5 daily tasks and auto-reset persistence
- Added navigation to Sentence Practice and Daily Missions from Settings tools section

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, using the new architecture (`newArchEnabled: true`)
- **Routing**: expo-router with file-based routing. Tab layout at `app/(tabs)/` with four tabs: index (Home), quiz, progress, settings. Stack screens: welcome, word-learn, theme-lessons, word-network, hangeul, review, custom-words, related-words-screen, sentence-practice, daily-missions
- **State Management**: React Context (`lib/AppContext.tsx`) wraps the entire app and manages user settings, daily learning state, progress data, bookmarks, custom words, and wrong answers. TanStack React Query is also set up for server API calls
- **Local Storage**: All user data persists via `@react-native-async-storage/async-storage` in `lib/storage.ts`. Keys: settings, progress, daily state, bookmarks, custom words, wrong answers
- **Vocabulary Data**: 7,200 words in `lib/vocab/` directory (18 modular files: level1-part1.ts through level6-part3.ts, 400 words each), imported via `lib/vocabulary.ts`
- **Grammar Patterns**: Grammar detection utility in `lib/grammar-patterns.ts` identifies patterns in Korean sentences and displays as tags
- **Theme Vocabulary**: 3,600 K-Culture words in `lib/theme-vocab/` directory (6 files: kdrama.ts, kpop.ts, kfood.ts, travel.ts, slang.ts, manners.ts), each with 100 words per TOPIK level, aggregated via `lib/theme-data.ts`
- **Hangeul Data**: Complete Korean alphabet data in `lib/hangeul.ts` with consonants, vowels, double consonants, compound vowels, syllable examples, and Hangeul Principles (origin, consonant shapes, vowel philosophy, syllable blocks, significance)
- **Related Words**: Category-based and manual mappings in `lib/related-words.ts` with K-Drama expression integration
- **Text-to-Speech**: expo-speech for Korean/English pronunciation on flashcards, quiz, review, custom words, and Hangeul screens
- **Animations**: react-native-reanimated for flashcard flip animations and quiz feedback
- **Haptics**: expo-haptics for tactile feedback on interactions
- **Fonts**: Noto Sans KR (Korean font) loaded via `@expo-google-fonts/noto-sans-kr`
- **Styling**: Dark theme by default using constants in `constants/colors.ts`. StyleSheet-based styling throughout
- **Platform Support**: iOS, Android, and Web. Platform-specific adjustments for web insets and keyboard handling

### Key Screens

- **Home** (`app/(tabs)/index.tsx`): Learning hub with 4 theme cards, today's progress, quick access shortcuts, and statistics
- **Quiz** (`app/(tabs)/quiz.tsx`): Multiple choice quiz with wrong answer tracking and TTS
- **Progress** (`app/(tabs)/progress.tsx`): Stats, streaks, and daily history
- **Settings** (`app/(tabs)/settings.tsx`): Course mode (20/10 words), TOPIK level, pronunciation toggle, tools navigation, account management with sign-out
- **Welcome** (`app/welcome.tsx`): Auth screen with email signup/login, social login buttons (Google, Apple, Kakao), and guest skip option
- **Word Learn** (`app/word-learn.tsx`): Flashcards with TTS, bookmark, and related words navigation
- **Theme Lessons** (`app/theme-lessons.tsx`): K-Culture themed vocabulary (K-Drama, K-Pop, K-Food, Travel, Slang, Manners)
- **Word Network** (`app/word-network.tsx`): Visual word connection graph with category-based exploration
- **Hangeul** (`app/hangeul.tsx`): Korean alphabet learning with tabs for consonants, vowels, doubles, compounds, syllables
- **Review** (`app/review.tsx`): Wrong answer list with auto-play TTS for all words and sentences
- **Custom Words** (`app/custom-words.tsx`): Add/manage custom vocabulary with sentence generation
- **Related Words** (`app/related-words-screen.tsx`): 20 related words per vocabulary item with K-Drama section
- **Sentence Practice** (`app/sentence-practice.tsx`): Fill-in-blank and word ordering modes with scoring and TTS
- **Daily Missions** (`app/daily-missions.tsx`): 5 daily tasks with auto-reset and AsyncStorage persistence

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
