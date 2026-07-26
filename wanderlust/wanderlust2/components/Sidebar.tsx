import React from 'react';
import { Place } from '../types';
import { X, Sparkles, LogOut, LogIn, Trash2 } from 'lucide-react';

interface SidebarProps {
  places: Place[];
  selectedPlaceId: string | null;
  onSelectPlace: (id: string) => void;
  onGetSuggestions: () => void;
  onDeletePlace: (id: string) => void;
  isGenerating: boolean;
  isOpen: boolean;
  onClose: () => void;
  authToken: string | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  guestCount: number;
  guestLimit: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  places,
  selectedPlaceId,
  onSelectPlace,
  onGetSuggestions,
  onDeletePlace,
  isGenerating,
  isOpen,
  onClose,
  authToken,
  onLogout,
  onOpenAuth,
  guestCount,
  guestLimit,
}) => {
  const visited = places.filter(p => p.status === 'visited');
  const wishlist = places.filter(p => p.status === 'wishlist');
  const recommended = places.filter(p => p.status === 'recommended');

  return (
    <div className={`sidebar ${isOpen ? '' : 'closed'}`}>
      <div className="sidebar-header">
        <h1>Wanderlust</h1>
        <button className="btn-secondary btn" onClick={onClose} style={{ padding: '4px 8px' }}>
          <X size={16} />
        </button>
      </div>

      <div className="auth-bar">
        {authToken ? (
          <>
            <span>Logged in</span>
            <button className="btn btn-secondary" onClick={onLogout} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
              <LogOut size={12} /> Logout
            </button>
          </>
        ) : (
          <>
            <span>Guest ({guestCount}/{guestLimit} suggestions)</span>
            <button className="btn btn-primary" onClick={onOpenAuth} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
              <LogIn size={12} /> Sign In
            </button>
          </>
        )}
      </div>

      <div className="sidebar-list">
        {visited.length > 0 && (
          <>
            <h3 style={{ padding: '8px 4px', fontSize: '0.85rem', color: '#22c55e' }}>Visited ({visited.length})</h3>
            {visited.map(p => (
              <PlaceCard key={p.id} place={p} isSelected={p.id === selectedPlaceId} onClick={() => onSelectPlace(p.id)} onDelete={() => onDeletePlace(p.id)} />
            ))}
          </>
        )}
        {wishlist.length > 0 && (
          <>
            <h3 style={{ padding: '8px 4px', fontSize: '0.85rem', color: '#38bdf8' }}>Wishlist ({wishlist.length})</h3>
            {wishlist.map(p => (
              <PlaceCard key={p.id} place={p} isSelected={p.id === selectedPlaceId} onClick={() => onSelectPlace(p.id)} onDelete={() => onDeletePlace(p.id)} />
            ))}
          </>
        )}
        {recommended.length > 0 && (
          <>
            <h3 style={{ padding: '8px 4px', fontSize: '0.85rem', color: '#a78bfa' }}>Recommended ({recommended.length})</h3>
            {recommended.map(p => (
              <PlaceCard key={p.id} place={p} isSelected={p.id === selectedPlaceId} onClick={() => onSelectPlace(p.id)} onDelete={() => onDeletePlace(p.id)} />
            ))}
          </>
        )}
        {places.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px', fontSize: '0.9rem' }}>
            Click anywhere on the map to add a place, or get AI suggestions below.
          </p>
        )}
      </div>

      <div className="sidebar-actions">
        <button className="btn btn-primary" onClick={onGetSuggestions} disabled={isGenerating} style={{ width: '100%' }}>
          {isGenerating ? <><span className="loading-spinner"></span>Generating...</> : <><Sparkles size={16} style={{ marginRight: 6 }}/> Get AI Suggestions</>}
        </button>
      </div>
    </div>
  );
};

interface PlaceCardProps {
  place: Place;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function PlaceCard({ place, isSelected, onClick, onDelete }: PlaceCardProps) {
  return (
    <div className={`place-card ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>{place.name}</h3>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '2px' }}>
          <Trash2 size={14} />
        </button>
      </div>
      <span className={`status-badge ${place.status}`}>{place.status}</span>
      {place.notes && <p style={{ marginTop: 4 }}>{place.notes.slice(0, 100)}{place.notes.length > 100 ? '...' : ''}</p>}
    </div>
  );
}

export default Sidebar;
