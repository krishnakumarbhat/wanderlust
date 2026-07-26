import React, { useState } from 'react';
import { PlaceStatus, Coordinates } from '../types';

interface AddPlaceModalProps {
  coords: Coordinates;
  onAdd: (name: string, status: PlaceStatus, notes: string) => void;
  onClose: () => void;
}

const AddPlaceModal: React.FC<AddPlaceModalProps> = ({ coords, onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<PlaceStatus>('wishlist');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), status, notes.trim());
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Add Place</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
          Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Manali" autoFocus />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as PlaceStatus)}>
              <option value="visited">Visited</option>
              <option value="wishlist">Wishlist</option>
            </select>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>Add</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlaceModal;
