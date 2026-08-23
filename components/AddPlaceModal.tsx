import React, { useState } from 'react';
import { Coordinates, PlaceStatus } from '../types';
import { X, MapPin, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddPlaceModalProps {
  coordinates: Coordinates | null;
  onClose: () => void;
  onAdd: (name: string, status: PlaceStatus, notes: string) => void;
}

const AddPlaceModal: React.FC<AddPlaceModalProps> = ({ coordinates, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<PlaceStatus>(PlaceStatus.BUCKET_LIST);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), status, notes);
      setName('');
      setNotes('');
    }
  };

  return (
    <AnimatePresence>
      {coordinates && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 12, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Add New Location</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location Name</label>
                <input
                  type="text"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Eiffel Tower, Paris"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">
                  Coordinates: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">List Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus(PlaceStatus.VISITED)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      status === PlaceStatus.VISITED
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
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
                        : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <MapPin className="mb-1" size={20} />
                    <span className="text-sm font-medium">Bucket List</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Best time to visit? Favorite memory?"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-colors shadow-lg"
              >
                Add to Map
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddPlaceModal;
