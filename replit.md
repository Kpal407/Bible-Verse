# Daily Word - Replit.md

## Overview

Daily Word is a React Native mobile app built with Expo that delivers Bible verses to users. The app features:
- A **Today** tab showing a daily verse of the day
- A **Browse** tab for exploring verses organized by categories (Daily Devotional, Faith, Hope, etc.)
- A **Bible** tab with a full King James Version Bible reader (browse by book, chapter, and verse)
- A **Saved** tab for bookmarking favorite verses

The app works on iOS, Android, and Web. It has a companion Express.js backend server, though the current backend is mostly a scaffold (no custom API routes yet). Verse data is stored locally in a static TypeScript file (`data/verses.ts`). Saved verses are persisted locally on the device using AsyncStorage.

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend (React Native / Expo)

- **Framework**: Expo with Expo Router (file-based routing, similar to Next.js but for mobile)
- **Navigation**: Tab-based layout with four tabs (Today, Browse, Bible, Saved). Uses `expo-router/unstable-native-tabs` on iOS with Liquid Glass support, and a classic BlurView tab bar on other platforms
- **Routing structure**:
  - `app/(tabs)/index.tsx` → Today screen
  - `app/(tabs)/browse.tsx` → Browse categories
  - `app/(tabs)/bible.tsx` → KJV Bible book list (Old/New Testament sections)
  - `app/(tabs)/saved.tsx` → Saved verses
  - `app/category/[id].tsx` → Dynamic category detail screen
  - `app/bible/chapters.tsx` → Chapter grid for a selected book
  - `app/bible/reader.tsx` → Full chapter reader with KJV verse text
- **Theming**: Light/dark mode support via `constants/colors.ts`. Colors adapt automatically based on device color scheme using `useColorScheme()`
- **Fonts**: Google Fonts loaded via `@expo-google-fonts` — Inter (body) and Playfair Display (headings)
- **State management**: React Context (`SavedVersesContext`) for saved verses; TanStack React Query (`@tanstack/react-query`) is set up for future server data fetching
- **Animations/Haptics**: `expo-haptics` for tactile feedback, `expo-linear-gradient` for card gradients, `react-native-reanimated` available

### Backend (Express.js)

- **Server**: Express 5 in `server/index.ts`
- **Routes**: Defined in `server/routes.ts` — includes `/api/verses/:categoryId` for AI-generated KJV verses, and `/api/bible/:book/:chapter` for full KJV Bible chapter reading (proxied from bible-api.com with server-side caching)
- **Storage**: `server/storage.ts` provides a `MemStorage` class (in-memory user store) and an `IStorage` interface. Can be swapped for a database-backed implementation
- **CORS**: Configured to allow Replit dev domains and localhost for development

### Data Layer

- **Verse data**: Static data in `data/verses.ts` provides 10 categories with 25-30 hardcoded verses each (250+ total) as a base set. The category detail screen dynamically fetches additional AI-generated verses from `/api/verses/:categoryId` and merges them with local data, deduplicating by reference. Users can tap "Load More Verses" to fetch additional batches infinitely
- **Shuffle on visit**: Category detail screen uses `useFocusEffect` to shuffle verses each time the screen is opened, plus a pull-to-refresh and shuffle button for manual re-ordering
- **Saved verses**: Persisted client-side using `@react-native-async-storage/async-storage` under the key `@daily_word_saved_verses`
- **Database (scaffold)**: Drizzle ORM configured with PostgreSQL (`drizzle.config.ts`, `shared/schema.ts`). A `users` table is defined but not actively used yet. Ready for expansion

### Shared Schema

- Located in `shared/schema.ts`, importable via `@shared/*` path alias
- Uses Drizzle ORM + `drizzle-zod` for type-safe schema definitions and validation
- Currently defines a `users` table with `id`, `username`, `password`

### Build & Dev

- **Dev**: Run `npm run expo:dev` (Expo) and `npm run server:dev` (Express) concurrently
- **Production build**: `scripts/build.js` handles static Expo build, `npm run server:build` bundles the server with esbuild
- **DB migrations**: `npm run db:push` uses Drizzle Kit to push schema changes to the database

---

## External Dependencies

| Dependency | Purpose |
|---|---|
| **Expo SDK ~54** | Core mobile framework, device APIs |
| **Expo Router ~6** | File-based navigation |
| **React Native 0.81** | Mobile UI rendering |
| **Express 5** | Backend API server |
| **Drizzle ORM + drizzle-zod** | Database ORM + schema validation (PostgreSQL) |
| **PostgreSQL (via `pg`)** | Database (requires `DATABASE_URL` env var) |
| **TanStack React Query v5** | Server state / data fetching (set up, not heavily used yet) |
| **AsyncStorage** | Local on-device persistence for saved verses |
| **expo-linear-gradient** | Gradient backgrounds on cards |
| **expo-haptics** | Haptic feedback on interactions |
| **expo-blur** | Blurred tab bar on iOS |
| **expo-glass-effect** | Liquid Glass tab bar (iOS 26+) |
| **react-native-reanimated** | Animations |
| **react-native-gesture-handler** | Touch/gesture handling |
| **@expo-google-fonts/inter** | Inter font family |
| **@expo-google-fonts/playfair-display** | Playfair Display font family |
| **@expo/vector-icons** | Icon sets (Ionicons, MaterialIcons, Feather, MaterialCommunityIcons) |
| **react-native-safe-area-context** | Safe area insets for notches/home bars |
| **react-native-keyboard-controller** | Keyboard-aware scroll behavior |
| **http-proxy-middleware** | Dev proxy setup |

### Environment Variables Required

- `DATABASE_URL` — PostgreSQL connection string (needed for Drizzle/DB features)
- `EXPO_PUBLIC_DOMAIN` — Domain used to build API URLs from the mobile app
- `REPLIT_DEV_DOMAIN` / `REPLIT_DOMAINS` — Automatically set by Replit for CORS configuration
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI API key (provided by Replit AI Integrations)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI base URL (provided by Replit AI Integrations)

### AI Integration

- **OpenAI** (via Replit AI Integrations): Used server-side to generate real Bible verses on demand. The `/api/verses/:categoryId` endpoint prompts GPT to return accurate, verbatim scripture with proper book/chapter/verse references. Integration files are in `server/replit_integrations/`