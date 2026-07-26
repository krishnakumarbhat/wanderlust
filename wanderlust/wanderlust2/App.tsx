import React, { useState, useEffect, useCallback } from 'react';
import { Place, PlaceStatus, Coordinates } from './types';
import WorldMap from './components/WorldMap';
import Sidebar from './components/Sidebar';
import AddPlaceModal from './components/AddPlaceModal';
import AuthModal from './components/AuthModal';
import { getTravelRecommendations, loginUser, registerUser } from './services/geminiService';
import { Menu } from 'lucide-react';

const GUEST_SUGGESTION_LIMIT = 5;
const BACKEND_URL = 'http://localhost:5001';

const App: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>(() => {
    const saved = localStorage.getItem('wanderlust_places');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [modalCoords, setModalCoords] = useState<Coordinates | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('wanderlust_auth_token'));
  const [guestSuggestionCount, setGuestSuggestionCount] = useState<number>(() => {
    return Number(localStorage.getItem('wanderlust_guest_suggestions') || 0);
  });
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
  };

  const handleMapClick = useCallback((coords: Coordinates) => {
    setModalCoords(coords);
  }, []);

  const handleGetSuggestions = async () => {
    if (!authToken && guestSuggestionCount >= GUEST_SUGGESTION_LIMIT) {
      setAuthModalMode('register');
      setIsAuthModalOpen(true);
      return;
    }

    setIsGenerating(true);
    try {
      const visited = places.filter(p => p.status === 'visited').map(p => p.name);
      const wishlist = places.filter(p => p.status === 'wishlist').map(p => p.name);

      const recommendations = await getTravelRecommendations(
        visited,
        wishlist,
        authToken,
        BACKEND_URL,
      );

      const newPlaces: Place[] = recommendations.map((rec: any) => ({
        id: rec.id || crypto.randomUUID(),
        name: rec.name,
        lat: rec.lat,
        lng: rec.lng,
        status: 'recommended' as PlaceStatus,
        notes: rec.reason || rec.description || '',
        addedAt: Date.now(),
      }));

      setPlaces(prev => {
        const existingIds = new Set(prev.map(p => p.name.toLowerCase()));
        const unique = newPlaces.filter(p => !existingIds.has(p.name.toLowerCase()));
        return [...prev, ...unique];
      });

      if (!authToken) {
        setGuestSuggestionCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to get suggestions:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const result = await loginUser(email, password, BACKEND_URL);
    if (result.token) {
      setAuthToken(result.token);
      setIsAuthModalOpen(false);
    }
    return result;
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    const result = await registerUser(username, email, password, BACKEND_URL);
    if (result.token) {
      setAuthToken(result.token);
      setIsAuthModalOpen(false);
    }
    return result;
  };

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('wanderlust_auth_token');
  };

  const handleDeletePlace = (id: string) => {
    setPlaces(prev => prev.filter(p => p.id !== id));
    if (selectedPlaceId === id) setSelectedPlaceId(null);
  };

  return (
    <div className="app-container">
      {!isSidebarOpen && (
        <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={20} />
        </button>
      )}

      <Sidebar
        places={places}
        selectedPlaceId={selectedPlaceId}
        onSelectPlace={setSelectedPlaceId}
        onGetSuggestions={handleGetSuggestions}
        onDeletePlace={handleDeletePlace}
        isGenerating={isGenerating}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        authToken={authToken}
        onLogout={handleLogout}
        onOpenAuth={() => { setAuthModalMode('login'); setIsAuthModalOpen(true); }}
        guestCount={guestSuggestionCount}
        guestLimit={GUEST_SUGGESTION_LIMIT}
      />

      <div className="map-container">
        <WorldMap
          places={places}
          selectedPlaceId={selectedPlaceId}
          onSelectPlace={setSelectedPlaceId}
          onMapClick={handleMapClick}
        />
      </div>

      {modalCoords && (
        <AddPlaceModal
          coords={modalCoords}
          onAdd={handleAddPlace}
          onClose={() => setModalCoords(null)}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          mode={authModalMode}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onClose={() => setIsAuthModalOpen(false)}
          onSwitchMode={(m) => setAuthModalMode(m)}
        />
      )}
    </div>
  );
};

export default App;
