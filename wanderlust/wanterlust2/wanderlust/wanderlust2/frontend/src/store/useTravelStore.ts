import { create } from 'zustand';
import {
  Destination,
  MOCK_DESTINATIONS,
  MOCK_SOCIAL_FEED,
  MOCK_USER,
  MOCK_TRAVEL_POSTS,
  MOCK_USER_TRIPS,
  SocialFeedItem,
  TravelPost,
  UserTrip,
} from '../data/mock';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  places_visited: number;
  countries: number;
  followers: number;
  following: number;
}

type TabId = 'map' | 'discover' | 'feed' | 'bucketlist' | 'profile';

interface TravelStore {
  // Auth
  token: string | null;
  user: UserProfile | null;
  login: (email: string, password: string) => void;
  register: (username: string, email: string, password: string) => void;
  logout: () => void;

  // Location
  userLat: number;
  userLng: number;
  setUserLocation: (lat: number, lng: number) => void;

  // Destinations & Discovery
  recommendations: Destination[];
  currentSwipeIndex: number;
  swipeRight: (destination: Destination) => void;
  swipeLeft: () => void;
  resetSwipeDeck: () => void;

  // Bucket List
  bucketList: Destination[];
  addToBucketList: (destination: Destination) => void;
  removeFromBucketList: (id: string) => void;
  toggleVisited: (id: string) => void;

  // Social (simple feed items for profile)
  socialFeed: SocialFeedItem[];

  // Travel Posts (rich feed with trip sequences)
  travelPosts: TravelPost[];
  toggleRouteLike: (postId: string) => void;
  toggleFollow: (postId: string) => void;

  // User's own trips (for profile timeline)
  userTrips: UserTrip[];
  saveRouteToMyTrips: (trip: UserTrip) => void;
  addStopToTrip: (tripId: string, city: string, country: string) => void;
  removeStopFromTrip: (tripId: string, stopIndex: number) => void;
  reorderTripStop: (tripId: string, fromIndex: number, toIndex: number) => void;
  updateTripTitle: (tripId: string, title: string) => void;
  updateTripHighlight: (tripId: string, highlight: string) => void;
  deleteTrip: (tripId: string) => void;
  addNewTrip: (title: string) => void;

  // View other user profile
  viewingProfile: string | null;  // postId of user being viewed
  setViewingProfile: (postId: string | null) => void;

  // Active tab
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  // Map
  selectedMarkerId: string | null;
  setSelectedMarker: (id: string | null) => void;
  mapCenter: [number, number];
  setMapCenter: (center: [number, number]) => void;
}

export const useTravelStore = create<TravelStore>((set, get) => ({
  // Auth - mocked
  token: null,
  user: null,
  login: (email: string, _password: string) => {
    set({
      token: 'mock-jwt-token',
      user: { ...MOCK_USER, email },
    });
  },
  register: (username: string, email: string, _password: string) => {
    set({
      token: 'mock-jwt-token',
      user: { ...MOCK_USER, username, email, places_visited: 0, countries: 0 },
    });
  },
  logout: () => {
    set({ token: null, user: null });
  },

  // Location - default: somewhere central (London)
  userLat: 51.5074,
  userLng: -0.1278,
  setUserLocation: (lat, lng) => set({ userLat: lat, userLng: lng }),

  // Destinations
  recommendations: [...MOCK_DESTINATIONS],
  currentSwipeIndex: 0,
  swipeRight: (destination) => {
    const { bucketList, currentSwipeIndex } = get();
    const alreadyExists = bucketList.some((d) => d.id === destination.id);
    if (!alreadyExists) {
      set({
        bucketList: [...bucketList, { ...destination, status: 'bucket' }],
        currentSwipeIndex: currentSwipeIndex + 1,
      });
    } else {
      set({ currentSwipeIndex: currentSwipeIndex + 1 });
    }
  },
  swipeLeft: () => {
    set((state) => ({ currentSwipeIndex: state.currentSwipeIndex + 1 }));
  },
  resetSwipeDeck: () => {
    set({ currentSwipeIndex: 0 });
  },

  // Bucket List
  bucketList: [],
  addToBucketList: (destination) => {
    const { bucketList } = get();
    if (!bucketList.some((d) => d.id === destination.id)) {
      set({ bucketList: [...bucketList, { ...destination, status: 'bucket' }] });
    }
  },
  removeFromBucketList: (id) => {
    set((state) => ({
      bucketList: state.bucketList.filter((d) => d.id !== id),
    }));
  },
  toggleVisited: (id) => {
    set((state) => ({
      bucketList: state.bucketList.map((d) =>
        d.id === id
          ? { ...d, status: d.status === 'visited' ? 'bucket' : 'visited' }
          : d
      ),
    }));
  },

  // Social (simple)
  socialFeed: MOCK_SOCIAL_FEED,

  // Travel Posts (rich)
  travelPosts: [...MOCK_TRAVEL_POSTS],
  toggleRouteLike: (postId) => {
    set((state) => ({
      travelPosts: state.travelPosts.map((p) =>
        p.id === postId
          ? {
              ...p,
              isRouteLiked: !p.isRouteLiked,
              routeLikes: p.isRouteLiked ? p.routeLikes - 1 : p.routeLikes + 1,
            }
          : p
      ),
    }));
  },
  toggleFollow: (postId) => {
    set((state) => ({
      travelPosts: state.travelPosts.map((p) =>
        p.id === postId ? { ...p, isFollowing: !p.isFollowing } : p
      ),
    }));
  },

  // User's own trips
  userTrips: [...MOCK_USER_TRIPS],
  saveRouteToMyTrips: (trip) => {
    const { userTrips } = get();
    if (!userTrips.some((t) => t.id === trip.id)) {
      set({ userTrips: [{ ...trip, id: `saved-${Date.now()}` }, ...userTrips] });
    }
  },
  addStopToTrip: (tripId, city, country) => {
    set((state) => ({
      userTrips: state.userTrips.map((t) =>
        t.id === tripId
          ? { ...t, stops: [...t.stops, { city, country }] }
          : t
      ),
    }));
  },
  removeStopFromTrip: (tripId, stopIndex) => {
    set((state) => ({
      userTrips: state.userTrips.map((t) =>
        t.id === tripId
          ? { ...t, stops: t.stops.filter((_, i) => i !== stopIndex) }
          : t
      ),
    }));
  },
  reorderTripStop: (tripId, fromIndex, toIndex) => {
    set((state) => ({
      userTrips: state.userTrips.map((t) => {
        if (t.id !== tripId) return t;
        const stops = [...t.stops];
        const [moved] = stops.splice(fromIndex, 1);
        stops.splice(toIndex, 0, moved);
        return { ...t, stops };
      }),
    }));
  },
  updateTripTitle: (tripId, title) => {
    set((state) => ({
      userTrips: state.userTrips.map((t) =>
        t.id === tripId ? { ...t, tripTitle: title } : t
      ),
    }));
  },
  updateTripHighlight: (tripId, highlight) => {
    set((state) => ({
      userTrips: state.userTrips.map((t) =>
        t.id === tripId ? { ...t, highlight } : t
      ),
    }));
  },
  deleteTrip: (tripId) => {
    set((state) => ({
      userTrips: state.userTrips.filter((t) => t.id !== tripId),
    }));
  },
  addNewTrip: (title) => {
    const newTrip: UserTrip = {
      id: `trip-${Date.now()}`,
      tripTitle: title,
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      stops: [],
      highlight: '',
      daysTotal: 0,
    };
    set((state) => ({ userTrips: [newTrip, ...state.userTrips] }));
  },

  // View other user profile
  viewingProfile: null,
  setViewingProfile: (postId) => set({ viewingProfile: postId }),

  // Active tab
  activeTab: 'map',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Map
  selectedMarkerId: null,
  setSelectedMarker: (id) => set({ selectedMarkerId: id }),
  mapCenter: [30, 10],
  setMapCenter: (center) => set({ mapCenter: center }),
}));
