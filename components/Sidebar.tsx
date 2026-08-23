import React, { useState } from 'react';
import { Place, PlaceStatus, Trip, LeaderboardEntry, ProfileMe } from '../types';
import {
  MapPin, CheckCircle2, Trash2, Plane, Sparkles, Loader2, Heart, MessageCircle,
  Share2, Route, Trophy, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getPlaceInfo, fetchCommunity, toggleLike, addComment, shareMap,
  createTrip, fetchTrips, deleteTrip, fetchLeaderboard, fetchProfileMe, CommunityInfo,
} from '../services/geminiService';

interface SidebarProps {
  places: Place[];
  selectedPlaceId: string | null;
  authToken: string | null;
  isDark: boolean;
  onToggleDark: () => void;
  activeTripStops: { name: string; lat: number; lng: number }[];
  onSelectTripStops: (stops: { name: string; lat: number; lng: number }[]) => void;
  onPlaceSelect: (id: string) => void;
  onDeletePlace: (id: string) => void;
  onGenerateRecommendations: () => void;
  isGenerating: boolean;
  isLoggedIn: boolean;
  readOnly: boolean;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout: () => void;
}

type Tab = PlaceStatus | 'trips' | 'community';

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.25, ease: 'easeOut' as const },
  }),
};

const Sidebar: React.FC<SidebarProps> = ({
  places, selectedPlaceId, authToken, isDark, onToggleDark,
  activeTripStops, onSelectTripStops,
  onPlaceSelect, onDeletePlace, onGenerateRecommendations, isGenerating,
  isLoggedIn, readOnly, onOpenLogin, onOpenRegister, onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>(PlaceStatus.VISITED);
  const [aiInfo, setAiInfo] = useState<{ [key: string]: string }>({});
  const [loadingInfo, setLoadingInfo] = useState<string | null>(null);

  // Per-place community state (likes/comments), loaded lazily when a card expands
  const [community, setCommunity] = useState<{ [key: string]: CommunityInfo }>({});
  const [commentDraft, setCommentDraft] = useState('');
  const [sharing, setSharing] = useState(false);

  // Trips
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripName, setTripName] = useState('');
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [tripsLoaded, setTripsLoaded] = useState(false);

  // Community tab
  const [leaderboard, setLeaderboard] = useState<{ places: LeaderboardEntry[]; top_travelers: LeaderboardEntry[] } | null>(null);
  const [profile, setProfile] = useState<ProfileMe | null>(null);

  const filteredPlaces = places.filter(p => p.status === activeTab);
  const visitedCount = places.filter(p => p.status === PlaceStatus.VISITED).length;
  const bucketCount = places.filter(p => p.status === PlaceStatus.BUCKET_LIST).length;

  const requireAuth = (): boolean => {
    if (isLoggedIn && authToken) return true;
    onOpenLogin();
    return false;
  };

  const handleGetInfo = async (place: Place) => {
    if (aiInfo[place.id]) return;
    setLoadingInfo(place.id);
    const info = await getPlaceInfo(place.name);
    setAiInfo(prev => ({ ...prev, [place.id]: info }));
    setLoadingInfo(null);
  };

  const loadCommunity = async (place: Place) => {
    if (community[place.id]) return;
    try {
      const info = await fetchCommunity(place.name, authToken);
      setCommunity(prev => ({ ...prev, [place.id]: info }));
    } catch { /* offline backend — section just stays empty */ }
  };

  const handleSelectPlace = (place: Place) => {
    onPlaceSelect(place.id);
    loadCommunity(place);
  };

  const handleLike = async (place: Place) => {
    if (!requireAuth()) return;
    try {
      const res = await toggleLike(place.name, authToken!);
      setCommunity(prev => ({ ...prev, [place.id]: { ...res, comments: prev[place.id]?.comments ?? [] } }));
    } catch { /* ignore */ }
  };

  const handleComment = async (place: Place) => {
    if (!requireAuth() || !commentDraft.trim()) return;
    try {
      await addComment(place.name, commentDraft.trim(), authToken!);
      setCommentDraft('');
      const info = await fetchCommunity(place.name, authToken);
      setCommunity(prev => ({ ...prev, [place.id]: info }));
    } catch { /* ignore */ }
  };

  const handleShare = async () => {
    if (!places.length) return;
    if (!requireAuth()) return;
    setSharing(true);
    try {
      const res = await shareMap(places, authToken!);
      const url = `${window.location.origin}${window.location.pathname}?share=${res.token}`;
      await navigator.clipboard.writeText(url).catch(() => undefined);
      alert(`Share link copied!\n${url}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not create share link');
    } finally {
      setSharing(false);
    }
  };

  const refreshTrips = async () => {
    if (!authToken) return;
    try {
      const res = await fetchTrips(authToken);
      setTrips(res.trips);
    } catch { /* ignore */ }
    setTripsLoaded(true);
  };

  const handleCreateTrip = async () => {
    if (!requireAuth() || !tripName.trim()) return;
    const stops = places
      .filter(p => p.status === PlaceStatus.BUCKET_LIST)
      .map(p => ({ name: p.name, lat: p.lat, lng: p.lng }));
    if (stops.length < 2) {
      alert('Add at least 2 bucket-list places first — a trip needs stops!');
      return;
    }
    try {
      await createTrip(tripName.trim(), stops, authToken!);
      setTripName('');
      await refreshTrips();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not create trip');
    }
  };

  const handleSelectTrip = (trip: Trip) => {
    if (selectedTripId === trip.id) {
      setSelectedTripId(null);
      onSelectTripStops([]);
      return;
    }
    setSelectedTripId(trip.id);
    onSelectTripStops(trip.stops ?? []);
  };

  const handleDeleteTrip = async (id: number) => {
    if (!authToken) return;
    try {
      await deleteTrip(id, authToken);
      if (selectedTripId === id) { setSelectedTripId(null); onSelectTripStops([]); }
      setTrips(prev => prev.filter(t => t.id !== id));
    } catch { /* ignore */ }
  };

  const openTab = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'trips' && !tripsLoaded) refreshTrips();
    if (tab === 'community') {
      fetchLeaderboard().then(setLeaderboard).catch(() => undefined);
      if (isLoggedIn && authToken) fetchProfileMe(authToken).then(setProfile).catch(() => undefined);
    }
  };

  const tabButton = (tab: Tab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => openTab(tab)}
      className={`flex-1 py-2.5 text-xs font-medium transition-colors flex flex-col items-center justify-center gap-0.5
        ${activeTab === tab
          ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
    >
      {icon}
      {label}
    </button>
  );

  const placeCard = (place: Place, index: number) => {
    const info = community[place.id];
    return (
      <motion.div
        key={place.id}
        custom={index}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        onClick={() => handleSelectPlace(place)}
        className={`group bg-white dark:bg-slate-800 border rounded-xl p-4 transition-all cursor-pointer hover:shadow-md
          ${selectedPlaceId === place.id
            ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md'
            : 'border-slate-200 dark:border-slate-700'}`}
      >
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">{place.name}</h3>
          {!readOnly && (
            <button
              onClick={(e) => { e.stopPropagation(); onDeletePlace(place.id); }}
              className="text-slate-300 hover:text-red-500 transition-colors p-1"
              title="Remove place"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {place.notes && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{place.notes}</p>
        )}

        {/* Community row */}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleLike(place); }}
            className={`flex items-center gap-1 text-xs font-medium transition-colors ${info?.liked_by_me ? 'text-rose-600' : 'text-slate-400 hover:text-rose-500'}`}
          >
            <Heart size={13} fill={info?.liked_by_me ? 'currentColor' : 'none'} />
            {info?.likes ?? 0}
          </button>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <MessageCircle size={13} />
            {info?.comments.length ?? 0}
          </span>
        </div>

        {/* Expanded detail */}
        <AnimatePresence>
          {selectedPlaceId === place.id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                {info?.comments.map((c, i) => (
                  <div key={i} className="text-sm mb-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
                    <span className="font-medium text-indigo-600 dark:text-indigo-400 text-xs">{c.username}</span>
                    <p className="text-slate-700 dark:text-slate-200">{c.text}</p>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <input
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment(place)}
                    placeholder="Write a comment..."
                    className="flex-1 min-w-0 text-xs px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-transparent text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    onClick={() => handleComment(place)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Post
                  </button>
                </div>

                {aiInfo[place.id] ? (
                  <div className="mt-2 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    <div className="flex items-center gap-1.5 mb-1 text-indigo-600 dark:text-indigo-400 font-medium text-xs uppercase">
                      <Sparkles size={12} /> Travel Tip
                    </div>
                    {aiInfo[place.id]}
                  </div>
                ) : (
                  <button
                    onClick={() => handleGetInfo(place)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium flex items-center gap-1 mt-2"
                  >
                    {loadingInfo === place.id
                      ? <Loader2 className="animate-spin h-3 w-3" />
                      : <Sparkles className="h-3 w-3" />}
                    {loadingInfo === place.id ? 'Learning about place...' : 'Tell me about this place'}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700 shadow-xl w-full md:w-96 absolute z-10 md:relative transition-all">
      {/* Header */}
      <div className="p-6 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6" />
            <h1 className="text-2xl font-bold tracking-tight">Wanderlust</h1>
          </div>
          <button
            onClick={onToggleDark}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
        <p className="text-indigo-100 text-sm">Map your world, plan your journey.</p>

        <div className="mt-4">
          {isLoggedIn ? (
            <div className="flex items-center justify-between gap-2 bg-white/10 px-3 py-2 rounded-lg">
              <span className="text-xs text-indigo-100">Logged in</span>
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  disabled={sharing}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50"
                >
                  {sharing ? <Loader2 size={12} className="animate-spin" /> : <Share2 size={12} />}
                  Share map
                </button>
                <button onClick={onLogout} className="text-xs px-2 py-1 rounded bg-black/20 hover:bg-black/30">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={onOpenLogin} className="flex-1 text-xs px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20">Login</button>
              <button onClick={onOpenRegister} className="flex-1 text-xs px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20">Register</button>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-6">
          <div className="flex-1 bg-white/10 p-2 rounded-lg text-center">
            <span className="block text-2xl font-bold">{visitedCount}</span>
            <span className="text-xs uppercase tracking-wider opacity-80">Visited</span>
          </div>
          <div className="flex-1 bg-white/10 p-2 rounded-lg text-center">
            <span className="block text-2xl font-bold">{bucketCount}</span>
            <span className="text-xs uppercase tracking-wider opacity-80">Bucket</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-700">
        {tabButton(PlaceStatus.VISITED, 'Visited', <CheckCircle2 size={15} />)}
        {tabButton(PlaceStatus.BUCKET_LIST, 'Bucket', <MapPin size={15} />)}
        {tabButton('trips', 'Trips', <Route size={15} />)}
        {tabButton('community', 'Community', <Trophy size={15} />)}
      </div>

      {/* AI Action Area */}
      {activeTab === PlaceStatus.BUCKET_LIST && (
        <div className="p-4 border-b border-indigo-100 dark:border-slate-700 bg-indigo-50/30 dark:bg-slate-800/50">
          <button
            onClick={onGenerateRecommendations}
            disabled={isGenerating}
            className="w-full py-2 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 font-medium"
          >
            {isGenerating ? (
              <><Loader2 className="animate-spin h-4 w-4" /> Consulting AI Guide...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Suggest Destinations</>
            )}
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
            Based on your visited and bucket-list places, we'll find better matches.
          </p>
        </div>
      )}

      {/* Trips tab */}
      {activeTab === 'trips' && (
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50">
          <div className="flex gap-2">
            <input
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="Trip name (e.g., Himalayas 2026)"
              className="flex-1 min-w-0 text-sm px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-transparent text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              onClick={handleCreateTrip}
              className="text-xs px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 whitespace-nowrap"
            >
              Create from bucket
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">Creates a route through all your bucket-list pins.</p>
        </div>
      )}

      {/* List / panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {(activeTab === PlaceStatus.VISITED || activeTab === PlaceStatus.BUCKET_LIST) && (
          filteredPlaces.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No places in your {activeTab === PlaceStatus.VISITED ? 'visited' : 'bucket'} list yet.</p>
              <p className="text-sm mt-2">Click anywhere on the map to add one!</p>
            </div>
          ) : filteredPlaces.map((place, i) => placeCard(place, i))
        )}

        {activeTab === 'trips' && (
          trips.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Route className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No trips yet.</p>
              <p className="text-sm mt-2">Name one above and we'll route your bucket list.</p>
            </div>
          ) : (
            trips.map((trip, i) => (
              <motion.div
                key={trip.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                onClick={() => handleSelectTrip(trip)}
                className={`bg-white dark:bg-slate-800 border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md
                  ${selectedTripId === trip.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-700'}`}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">{trip.name}</h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id); }}
                    className="text-slate-300 hover:text-red-500 p-1"
                  >
                    <X size={15} />
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {trip.stops?.length ?? 0} stops · click to {selectedTripId === trip.id ? 'hide' : 'show'} route
                </p>
              </motion.div>
            ))
          )
        )}

        {activeTab === 'community' && (
          <>
            {profile && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Your badges</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.badges.length
                    ? profile.badges.map(b => (
                        <span key={b} className="text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-medium">{b}</span>
                      ))
                    : <p className="text-xs text-slate-400">Love, save or comment on places to earn badges!</p>}
                </div>
              </motion.div>
            )}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Most-loved destinations</h3>
              {!leaderboard ? (
                <Loader2 className="animate-spin h-4 w-4 text-slate-400" />
              ) : leaderboard.places.length === 0 ? (
                <p className="text-xs text-slate-400">No loves yet — be the first!</p>
              ) : (
                <ol className="space-y-1.5">
                  {leaderboard.places.map((entry, i) => (
                    <li key={entry.place_key} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                      <span className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-300 text-slate-700' : i === 2 ? 'bg-orange-300 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                        {i + 1}
                      </span>
                      <span className="capitalize truncate">{entry.place_key}</span>
                    </li>
                  ))}
                </ol>
              )}
              {leaderboard && leaderboard.top_travelers.length > 0 && (
                <>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 mt-4 mb-2">Top travelers</h3>
                  <ul className="space-y-1">
                    {leaderboard.top_travelers.map(t => (
                      <li key={t.username} className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                        <span>{t.username}</span><span className="text-slate-400">{t.places} pins</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </motion.div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-400 text-center">
        Powered by Flask Hybrid Recommender & Leaflet
      </div>
    </div>
  );
};

export default Sidebar;
