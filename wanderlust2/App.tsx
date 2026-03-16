import React, { useState, useEffect, useCallback } from 'react';
import { Place, PlaceStatus, Coordinates } from './types';
import WorldMap from './components/WorldMap';
import Sidebar from './components/Sidebar';
import AddPlaceModal from './components/AddPlaceModal';
import AuthModal from './components/AuthModal';
import { getTravelRecommendations, loginUser, registerUser } from './services/geminiService';
import { Menu } from 'lucide-react';

const GUEST_SUGGESTION_LIMIT = 5;

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
  const [guestSuggestionCount, setGuestSuggestionCount] = useState<number>(() => {
    return Number(localStorage.getItem('wanderlust_guest_suggestions') || 0);
  });
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('wanderlust_places', JSON.stringify(places));
  }, [places]);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('wanderlust_auth_token', authToken);
    } else {
      localStorage.removeItem('wanderlust_auth_token');
    }
  }, [authToken]);

  useEffect(() => {
    localStorage.setItem('wanderlust_guest_suggestions', String(guestSuggestionCount));
  }, [guestSuggestionCount]);

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
    setModalCoords(coords);
  }, []);

  const handleGenerateRecommendations = async () => {
    if (isGenerating) {
      return;
    }

    if (!authToken && guestSuggestionCount >= GUEST_SUGGESTION_LIMIT) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      alert('You used all 5 guest suggestions. Please login/register for unlimited suggestions.');
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

      if (!authToken) {
        setGuestSuggestionCount((count) => count + 1);
      }
      
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
    <div className="flex h-screen w-screen overflow-hidden relative bg-slate-100">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden absolute top-4 left-4 z-20 bg-white p-2 rounded-lg shadow-md text-slate-700"
      >
        <Menu size={24} />
      </button>

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
          onPlaceSelect={(id) => {
            setSelectedPlaceId(id);
            if (window.innerWidth < 768) setIsSidebarOpen(false);
          }}
          onDeletePlace={handleDeletePlace}
          onGenerateRecommendations={handleGenerateRecommendations}
          isGenerating={isGenerating}
          isLoggedIn={Boolean(authToken)}
          guestSuggestionCount={guestSuggestionCount}
          guestSuggestionLimit={GUEST_SUGGESTION_LIMIT}
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
          onMapClick={handleMapClick}
          onPlaceSelect={setSelectedPlaceId}
        />
      </div>

      {/* Add Place Modal */}
      <AddPlaceModal 
        coordinates={modalCoords} 
        onClose={() => setModalCoords(null)}
        onAdd={handleAddPlace}
      />

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
