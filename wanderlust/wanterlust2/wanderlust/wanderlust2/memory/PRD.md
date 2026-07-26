# Wanderlust Mobile - PRD

## Original Problem Statement
Build "Wanderlust Mobile", a location-aware travel bucket-list app with AI routing and social features. Mobile-first web app with Interactive Map, Discovery Swipe deck, Bucket List, Social Feed with trip route graphs, and Profile with editable journey timeline.

## Architecture
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: FastAPI (Python) with mock endpoints
- **Maps**: Leaflet + OpenStreetMap (free, no API key)
- **State**: Zustand (auth, location, bucket list, travel posts, user trips, profile viewing)
- **Theme**: Earthy Dark Mode (forest green #0f1715, slate grays, sunset-orange #e8652b)

## User Personas
- Young adventurous travelers (18-35)
- Digital nomads seeking new destinations
- Travel enthusiasts who love AI-powered discovery and social sharing

## What's Been Implemented

### Phase 1 - MVP (Jan 15, 2026)
- [x] 4-tab navigation, Leaflet dark-mode map with 8 pins + search + legend
- [x] Tinder-like swipe deck with framer-motion animations
- [x] Bucket list with stats, mark visited, remove
- [x] Profile auth (mocked), simple social feed, Haversine distances
- [x] FastAPI backend with mock endpoints

### Phase 2 - Social Feed & Profile Upgrade (Jan 15, 2026)
- [x] 5-tab navigation: Map, Discover, Feed (NEW), Bucket, Profile
- [x] Feed Screen with travel posts, trip sequence graphs, route likes, collapsible comments
- [x] Profile with Followers/Following/Countries stats, vertical trip timeline

### Phase 3 - Profile Viewing, Route Saving & Trip Editing (Jan 15, 2026)
- [x] **View Other Profile**: Tap avatar/name in Feed opens slide-up modal with user stats (followers, following, countries) and their trips
- [x] **Save Route**: "Save Route" button on feed posts + "Save" button inside profile modal copies trip route to your own timeline
- [x] **Follow/Unfollow**: Toggle in profile modal syncs with feed post follow state
- [x] **Editable Trip Timeline**: Edit pencil/trash buttons on each trip card
- [x] **Trip Editor**: Inline editing with editable title, highlight, stops list with reorder (up/down arrows), remove (X), and add new stop (city + country inputs)
- [x] **Add Trip**: Create new trips from the profile timeline header
- [x] **Delete Trip**: Remove trips with confirmation
- [x] **Route saved indicator**: Saved routes show green "Saved" state on both feed posts and profile modals

### Testing Results
- Phase 1: 100% backend, 90%+ frontend
- Phase 2: 100% frontend
- Phase 3: 95% frontend (all core features passing, minor timing edge cases)

## Prioritized Backlog
### P0 (Critical - Next Phase)
- [ ] Wire real Flask backend with LangGraph/ChromaDB recommender
- [ ] Live GPS tracking (browser geolocation)
- [ ] JWT authentication with real backend

### P1 (Important)
- [ ] Complex comment reply logic in Feed
- [ ] Geofencing alerts when near a bucket list destination
- [ ] Offline bucket list storage (localStorage persistence)

### P2 (Nice to Have)
- [ ] Share destinations/routes with friends
- [ ] Photo uploads for visited places
- [ ] Achievement badges system

## Next Tasks
1. Get user approval for Phase 3
2. Wire Flask backend connection
3. Implement live GPS tracking
4. Real JWT authentication flow
