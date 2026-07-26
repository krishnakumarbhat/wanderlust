import { MapPin, CheckCircle, Trash2, ChevronRight } from 'lucide-react';
import { useTravelStore } from '../store/useTravelStore';
import { haversineKm, formatDistance } from '../utils/haversine';

export function BucketListScreen() {
  const bucketList = useTravelStore((s) => s.bucketList);
  const removeFromBucketList = useTravelStore((s) => s.removeFromBucketList);
  const toggleVisited = useTravelStore((s) => s.toggleVisited);
  const setActiveTab = useTravelStore((s) => s.setActiveTab);
  const userLat = useTravelStore((s) => s.userLat);
  const userLng = useTravelStore((s) => s.userLng);
  const setSelectedMarker = useTravelStore((s) => s.setSelectedMarker);

  const bucketPlaces = bucketList.filter((d) => d.status === 'bucket');
  const visitedPlaces = bucketList.filter((d) => d.status === 'visited');

  return (
    <div className="w-full h-full flex flex-col bg-earth-bg" data-testid="bucketlist-screen">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-5 pb-3">
        <h1 className="font-heading font-extrabold text-2xl text-txt-primary tracking-tight">
          Bucket List
        </h1>
        <p className="text-xs text-txt-muted font-body mt-0.5">
          {bucketList.length === 0
            ? 'Start swiping to add destinations'
            : `${bucketPlaces.length} planned, ${visitedPlaces.length} visited`}
        </p>
      </div>

      {/* Stats Bar */}
      {bucketList.length > 0 && (
        <div className="flex-shrink-0 mx-5 mb-3 grid grid-cols-2 gap-3">
          <div className="bg-earth-card rounded-xl p-3 border border-earth-card">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} className="text-brand-orange" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-txt-muted">To Visit</span>
            </div>
            <span className="text-2xl font-heading font-extrabold text-txt-primary">{bucketPlaces.length}</span>
          </div>
          <div className="bg-earth-card rounded-xl p-3 border border-earth-card">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={14} className="text-green-400" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-txt-muted">Visited</span>
            </div>
            <span className="text-2xl font-heading font-extrabold text-txt-primary">{visitedPlaces.length}</span>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3">
        {bucketList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-16 h-16 rounded-full bg-earth-card flex items-center justify-center">
              <MapPin size={28} className="text-txt-muted" />
            </div>
            <div className="text-center">
              <p className="text-txt-primary font-heading font-bold text-base">Your list is empty</p>
              <p className="text-txt-muted text-sm mt-1 font-body">
                Head to Discover and swipe right on places you love.
              </p>
            </div>
            <button
              data-testid="go-to-discover"
              onClick={() => setActiveTab('discover')}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-orange text-white font-semibold rounded-full text-sm hover:bg-brand-orange-hover transition-colors"
            >
              Start Exploring
              <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          <>
            {/* Bucket List Items */}
            {bucketPlaces.length > 0 && (
              <div>
                <h3 className="text-[11px] uppercase tracking-wider font-bold text-txt-muted mb-2">Planned</h3>
                <div className="space-y-2">
                  {bucketPlaces.map((dest) => (
                    <BucketItem
                      key={dest.id}
                      dest={dest}
                      userLat={userLat}
                      userLng={userLng}
                      onToggleVisited={toggleVisited}
                      onRemove={removeFromBucketList}
                      onViewOnMap={(id) => {
                        setSelectedMarker(id);
                        setActiveTab('map');
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Visited Items */}
            {visitedPlaces.length > 0 && (
              <div>
                <h3 className="text-[11px] uppercase tracking-wider font-bold text-txt-muted mb-2 mt-4">Visited</h3>
                <div className="space-y-2">
                  {visitedPlaces.map((dest) => (
                    <BucketItem
                      key={dest.id}
                      dest={dest}
                      userLat={userLat}
                      userLng={userLng}
                      onToggleVisited={toggleVisited}
                      onRemove={removeFromBucketList}
                      onViewOnMap={(id) => {
                        setSelectedMarker(id);
                        setActiveTab('map');
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface BucketItemProps {
  dest: {
    id: string;
    name: string;
    image: string;
    lat: number;
    lng: number;
    tags: string[];
    difficulty: string;
    status: string;
  };
  userLat: number;
  userLng: number;
  onToggleVisited: (id: string) => void;
  onRemove: (id: string) => void;
  onViewOnMap: (id: string) => void;
}

function BucketItem({ dest, userLat, userLng, onToggleVisited, onRemove, onViewOnMap }: BucketItemProps) {
  const distance = haversineKm(userLat, userLng, dest.lat, dest.lng);
  const isVisited = dest.status === 'visited';

  return (
    <div
      data-testid={`bucket-item-${dest.id}`}
      className={`bg-earth-card rounded-xl border border-earth-card overflow-hidden ${
        isVisited ? 'opacity-70' : ''
      }`}
    >
      <div className="flex gap-3 p-3">
        <button
          data-testid={`view-on-map-${dest.id}`}
          onClick={() => onViewOnMap(dest.id)}
          className="flex-shrink-0"
        >
          <img
            src={dest.image}
            alt={dest.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-heading font-bold text-sm truncate ${isVisited ? 'line-through text-txt-muted' : 'text-txt-primary'}`}>
              {dest.name}
            </h4>
            <button
              data-testid={`remove-bucket-${dest.id}`}
              onClick={() => onRemove(dest.id)}
              className="text-txt-muted hover:text-red-400 transition-colors flex-shrink-0 p-0.5"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-txt-muted">{formatDistance(distance)}</span>
            <span className="text-txt-muted">·</span>
            <span className="text-[10px] text-txt-muted capitalize">{dest.difficulty}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              data-testid={`toggle-visited-${dest.id}`}
              onClick={() => onToggleVisited(dest.id)}
              className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
                isVisited
                  ? 'bg-green-500/15 text-green-400'
                  : 'bg-earth-surface text-txt-secondary hover:text-green-400'
              }`}
            >
              <CheckCircle size={12} />
              {isVisited ? 'Visited' : 'Mark Visited'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
