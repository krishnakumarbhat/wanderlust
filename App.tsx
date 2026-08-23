import React, { useState, useEffect, useCallback } from 'react';
import { Place, PlaceStatus, Coordinates } from './types';
import WorldMap from './components/WorldMap';
import Sidebar from './components/Sidebar';
import AddPlaceModal from './components/AddPlaceModal';
import AuthModal from './components/AuthModal';
import { getTravelRecommendations, loginUser, registerUser, fetchSharedMap } from './services/geminiService';
import { motion } from 'framer-motion';
import { Menu, Eye } from 'lucide-react';

const App: React.FC = () => {
  // Load initial state from localStorage if available
  const [places, setPlaces] = useState<Place[]>(() => {
    const saved = localStorage.getItem('wanderlust_places');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [modalCoords, setModalCoords] = useState<Coordinates | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // For mobile/toggle
  const [isGenerating, setIsGenerating] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('wanderlust_auth_token'));
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Dark mode
  const [isDark, setIsDark] = useState<boolean>(() => localStorage.getItem('wanderlust_theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('wanderlust_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Shared (read-only) map view via ?share=<token>
  const [sharedOwner, setSharedOwner] = useState<string | null>(null);
  useEffect(() => {
    const shareToken = new URLSearchParams(window.location.search).get('share');
    if (!shareToken) return;
    fetchSharedMap(shareToken)
      .then(({ owner, places: sharedPlaces }) => {
        setPlaces(sharedPlaces);
        setSharedOwner(owner);
        window.history.replaceState(null, '', window.location.pathname);
      })
      .catch(() => alert('This share link is invalid or expired.'));
  }, []);

  // Active trip route shown on the map
  const [activeTripStops, setActiveTripStops] = useState<{ name: string; lat: number; lng: number }[]>([]);
  const readOnly = sharedOwner !== null;

  // Persist to localStorage
  useEffect(() => {
    if (!readOnly) localStorage.setItem('wanderlust_places', JSON.stringify(places));
  }, [places, readOnly]);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('wanderlust_auth_token', authToken);
    } else {
      localStorage.removeItem('wanderlust_auth_token');
    }
  }, [authToken]);

  const handleAddPlace = (name: string, status: PlaceStatus, notes: string) => {
    if (!modalCoords) return;

    const newPlace: Place = {
      id: crypto.randomUUID(),
      name,
      lat: modalCoords.lat,
      lng: modalCoords.lng,
      status,
      notes,
      addedAt: Date.now(),
    };

    setPlaces(prev => [...prev, newPlace]);
    setModalCoords(null);
    setSelectedPlaceId(newPlace.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false); // Close sidebar on mobile after add
  };

  const handleDeletePlace = (id: string) => {
    setPlaces(prev => prev.filter(p => p.id !== id));
    if (selectedPlaceId === id) setSelectedPlaceId(null);
  };

  const handleMapClick = useCallback((coords: Coordinates) => {
    if (readOnly) return;
    setModalCoords(coords);
  }, [readOnly]);

  const handleGenerateRecommendations = async () => {
    if (isGenerating) {
      return;
    }

    setIsGenerating(true);
    try {
      const recommendations = await getTravelRecommendations(places);

      const existingKeys = new Set(
        places.map((place) => `${place.name.trim().toLowerCase()}_${place.lat.toFixed(3)}_${place.lng.toFixed(3)}`)
      );
      const seenInBatch = new Set<string>();

      const newPlaces: Place[] = recommendations
        .map(rec => ({
          id: crypto.randomUUID(),
          name: rec.name,
          lat: rec.lat,
          lng: rec.lng,
          status: PlaceStatus.BUCKET_LIST,
          notes: `AI Recommendation: ${rec.description}`,
          addedAt: Date.now(),
        }))
        .filter((place) => {
          const key = `${place.name.trim().toLowerCase()}_${place.lat.toFixed(3)}_${place.lng.toFixed(3)}`;
          if (existingKeys.has(key) || seenInBatch.has(key)) {
            return false;
          }
          seenInBatch.add(key);
          return true;
        });

      setPlaces(prev => [...prev, ...newPlaces]);

      // Optionally select the first new place to fly to it
      if (newPlaces.length > 0) {
        setSelectedPlaceId(newPlaces[0].id);
      }
    } catch (e) {
      console.error("Failed to generate recommendations", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSubmit = async (payload: { username?: string; email: string; password: string }) => {
    const response = authModalMode === 'login'
      ? await loginUser(payload)
      : await registerUser(payload);
    setAuthToken(response.token);
  };

  const handleLogout = () => {
    setAuthToken(null);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden relative bg-slate-100 dark:bg-slate-950">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden absolute top-4 left-4 z-20 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-md text-slate-700 dark:text-slate-200"
      >
        <Menu size={24} />
      </button>

      {/* Shared-view banner */}
      {readOnly && (
        <motion.div
          initial={{ y: -40 }}
          animate={{ y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-indigo-600 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg"
        >
          <Eye size={13} />
          Viewing {sharedOwner}'s shared map (read-only)
        </motion.div>
      )}

      {/* Sidebar Container */}
      <div
        className={`
          fixed md:relative inset-y-0 left-0 z-30
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-96'}
          w-80 md:w-96 shadow-2xl md:shadow-none h-full
        `}
      >
        <Sidebar
          places={places}
          selectedPlaceId={selectedPlaceId}
          authToken={authToken}
          isDark={isDark}
          onToggleDark={() => setIsDark(d => !d)}
          activeTripStops={activeTripStops}
          onSelectTripStops={setActiveTripStops}
          onPlaceSelect={(id) => {
            setSelectedPlaceId(id);
            if (window.innerWidth < 768) setIsSidebarOpen(false);
          }}
          onDeletePlace={handleDeletePlace}
          onGenerateRecommendations={handleGenerateRecommendations}
          isGenerating={isGenerating}
          isLoggedIn={Boolean(authToken)}
          readOnly={readOnly}
          onOpenLogin={() => openAuthModal('login')}
          onOpenRegister={() => openAuthModal('register')}
          onLogout={handleLogout}
        />
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-20 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Map Container */}
      <div className="flex-1 h-full relative">
        <WorldMap
          places={places}
          selectedPlaceId={selectedPlaceId}
          routeStops={activeTripStops}
          onMapClick={handleMapClick}
          onPlaceSelect={setSelectedPlaceId}
        />
      </div>

      {/* Add Place Modal */}
      {!readOnly && (
        <AddPlaceModal
          coordinates={modalCoords}
          onClose={() => setModalCoords(null)}
          onAdd={handleAddPlace}
        />
      )}

      <AuthModal
        open={isAuthModalOpen}
        mode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSubmit={handleAuthSubmit}
      />
    </div>
  );
};

export default App;
