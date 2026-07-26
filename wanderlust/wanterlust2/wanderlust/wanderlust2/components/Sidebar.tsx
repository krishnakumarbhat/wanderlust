import React, { useState } from 'react';
import { Place, PlaceStatus } from '../types';
import { MapPin, CheckCircle2, Trash2, Plane, Sparkles, Loader2 } from 'lucide-react';
import { getPlaceInfo } from '../services/geminiService';

interface SidebarProps {
  places: Place[];
  selectedPlaceId: string | null;
  onPlaceSelect: (id: string) => void;
  onDeletePlace: (id: string) => void;
  onGenerateRecommendations: () => void;
  isGenerating: boolean;
  isLoggedIn: boolean;
  guestSuggestionCount: number;
  guestSuggestionLimit: number;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  places,
  selectedPlaceId,
  onPlaceSelect,
  onDeletePlace,
  onGenerateRecommendations,
  isGenerating,
  isLoggedIn,
  guestSuggestionCount,
  guestSuggestionLimit,
  onOpenLogin,
  onOpenRegister,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<PlaceStatus>(PlaceStatus.VISITED);
  const [aiInfo, setAiInfo] = useState<{ [key: string]: string }>({});
  const [loadingInfo, setLoadingInfo] = useState<string | null>(null);

  const filteredPlaces = places.filter(p => p.status === activeTab);
  
  // Calculate stats
  const visitedCount = places.filter(p => p.status === PlaceStatus.VISITED).length;
  const bucketCount = places.filter(p => p.status === PlaceStatus.BUCKET_LIST).length;

  const handleGetInfo = async (place: Place) => {
    if (aiInfo[place.id]) return; // Already have info
    
    setLoadingInfo(place.id);
    const info = await getPlaceInfo(place.name);
    setAiInfo(prev => ({ ...prev, [place.id]: info }));
    setLoadingInfo(null);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-xl w-full md:w-96 absolute z-10 md:relative transition-all">
      {/* Header */}
      <div className="p-6 bg-indigo-600 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Plane className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Wanderlust</h1>
        </div>
        <p className="text-indigo-100 text-sm">Map your world, plan your journey.</p>

        <div className="mt-4">
          {isLoggedIn ? (
            <div className="flex items-center justify-between gap-2 bg-indigo-700/40 px-3 py-2 rounded-lg">
              <span className="text-xs text-indigo-100">Logged in • Unlimited suggestions</span>
              <button
                onClick={onLogout}
                className="text-xs px-2 py-1 rounded bg-indigo-900/40 hover:bg-indigo-900/60"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={onOpenLogin}
                className="flex-1 text-xs px-3 py-2 rounded-lg bg-indigo-900/40 hover:bg-indigo-900/60"
              >
                Login
              </button>
              <button
                onClick={onOpenRegister}
                className="flex-1 text-xs px-3 py-2 rounded-lg bg-indigo-900/40 hover:bg-indigo-900/60"
              >
                Register
              </button>
            </div>
          )}
        </div>
        
        <div className="flex gap-4 mt-6">
          <div className="flex-1 bg-indigo-700/50 p-2 rounded-lg text-center">
            <span className="block text-2xl font-bold">{visitedCount}</span>
            <span className="text-xs uppercase tracking-wider opacity-80">Visited</span>
          </div>
          <div className="flex-1 bg-indigo-700/50 p-2 rounded-lg text-center">
            <span className="block text-2xl font-bold">{bucketCount}</span>
            <span className="text-xs uppercase tracking-wider opacity-80">Bucket</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab(PlaceStatus.VISITED)}
          className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2
            ${activeTab === PlaceStatus.VISITED 
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
        >
          <CheckCircle2 size={16} />
          Visited
        </button>
        <button
          onClick={() => setActiveTab(PlaceStatus.BUCKET_LIST)}
          className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2
            ${activeTab === PlaceStatus.BUCKET_LIST 
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
        >
          <MapPin size={16} />
          Bucket List
        </button>
      </div>

      {/* AI Action Area */}
      {activeTab === PlaceStatus.BUCKET_LIST && (
        <div className="p-4 border-b border-indigo-100 bg-indigo-50/30">
          <button
            onClick={onGenerateRecommendations}
            disabled={isGenerating}
            className="w-full py-2 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 font-medium"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                Consulting AI Guide...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Suggest Destinations
              </>
            )}
          </button>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Based on your visited and bucket-list places, we'll find better matches.
          </p>
          {!isLoggedIn && (
            <p className="text-xs text-slate-500 mt-1 text-center">
              Guest uses: {guestSuggestionCount}/{guestSuggestionLimit}
            </p>
          )}
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredPlaces.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No places in your {activeTab === PlaceStatus.VISITED ? 'visited' : 'bucket'} list yet.</p>
            <p className="text-sm mt-2">Click anywhere on the map to add one!</p>
          </div>
        ) : (
          filteredPlaces.map((place) => (
            <div 
              key={place.id}
              onClick={() => onPlaceSelect(place.id)}
              className={`group bg-white border rounded-xl p-4 transition-all cursor-pointer hover:shadow-md
                ${selectedPlaceId === place.id ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md' : 'border-slate-200'}`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-slate-800">{place.name}</h3>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeletePlace(place.id); }}
                  className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  title="Remove place"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              {place.notes && (
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{place.notes}</p>
              )}

              {/* Inline AI Info */}
              {selectedPlaceId === place.id && (
                <div className="mt-3 pt-3 border-t border-slate-100 animate-fadeIn">
                  {aiInfo[place.id] ? (
                    <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 leading-relaxed">
                      <div className="flex items-center gap-1.5 mb-1 text-indigo-600 font-medium text-xs uppercase">
                        <Sparkles size={12} />
                        Travel Tip
                      </div>
                      {aiInfo[place.id]}
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleGetInfo(place); }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 mt-2"
                    >
                      {loadingInfo === place.id ? (
                        <Loader2 className="animate-spin h-3 w-3" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      {loadingInfo === place.id ? 'Learning about place...' : 'Tell me about this place'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-400 text-center">
        Powered by Flask Hybrid Recommender & Leaflet
      </div>
    </div>
  );
};

export default Sidebar;
