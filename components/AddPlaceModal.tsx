import React, { useState } from 'react';
import { Coordinates, PlaceStatus } from '../types';
import { X, MapPin, CheckCircle2 } from 'lucide-react';

interface AddPlaceModalProps {
  coordinates: Coordinates | null;
  onClose: () => void;
  onAdd: (name: string, status: PlaceStatus, notes: string) => void;
}

const AddPlaceModal: React.FC<AddPlaceModalProps> = ({ coordinates, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<PlaceStatus>(PlaceStatus.BUCKET_LIST);
  const [notes, setNotes] = useState('');

  if (!coordinates) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name, status, notes);
      setName('');
      setNotes('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Add New Location</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location Name</label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Eiffel Tower, Paris"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              Coordinates: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">List Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus(PlaceStatus.VISITED)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  status === PlaceStatus.VISITED
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="mb-1" size={20} />
                <span className="text-sm font-medium">Visited</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus(PlaceStatus.BUCKET_LIST)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  status === PlaceStatus.BUCKET_LIST
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <MapPin className="mb-1" size={20} />
                <span className="text-sm font-medium">Bucket List</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Best time to visit? Favorite memory?"
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors shadow-lg"
          >
            Add to Map
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPlaceModal;
