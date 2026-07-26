import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Search, Navigation, X } from 'lucide-react';
import { useTravelStore } from '../store/useTravelStore';
import { MOCK_DESTINATIONS, Destination } from '../data/mock';

function MapController() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200);
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);
  return null;
}

function FlyToMarker({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 6, { duration: 1.2 });
  }, [lat, lng, map]);
  return null;
}

function createMarkerIcon(color: string, isSelected: boolean) {
  const size = isSelected ? 18 : 14;
  const outerSize = size + 8;
  return L.divIcon({
    html: `<div style="width:${outerSize}px;height:${outerSize}px;border-radius:50%;background:${color}33;display:flex;align-items:center;justify-content:center;">
      <div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #f0f4f3;box-shadow:0 2px 8px ${color}88;"></div>
    </div>`,
    className: '',
    iconSize: [outerSize, outerSize],
    iconAnchor: [outerSize / 2, outerSize / 2],
    popupAnchor: [0, -(outerSize / 2)],
  });
}

export function MapScreen() {
  const bucketList = useTravelStore((s) => s.bucketList);
  const selectedMarkerId = useTravelStore((s) => s.selectedMarkerId);
  const setSelectedMarker = useTravelStore((s) => s.setSelectedMarker);
  const addToBucketList = useTravelStore((s) => s.addToBucketList);
  const setActiveTab = useTravelStore((s) => s.setActiveTab);
  const userLat = useTravelStore((s) => s.userLat);
  const userLng = useTravelStore((s) => s.userLng);
  const setUserLocation = useTravelStore((s) => s.setUserLocation);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);

  // Combine all pins: recommended + bucket + visited
  const allPins = useMemo(() => {
    const bucketIds = new Set(bucketList.map((d) => d.id));
    const recommended = MOCK_DESTINATIONS.filter((d) => !bucketIds.has(d.id)).map((d) => ({
      ...d,
      pinStatus: 'recommended' as const,
    }));
    const bucket = bucketList.map((d) => ({
      ...d,
      pinStatus: d.status === 'visited' ? ('visited' as const) : ('bucket' as const),
    }));
    return [...recommended, ...bucket];
  }, [bucketList]);

  const filteredPins = useMemo(() => {
    if (!searchQuery.trim()) return allPins;
    const q = searchQuery.toLowerCase();
    return allPins.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
    );
  }, [allPins, searchQuery]);

  const selectedPin = allPins.find((p) => p.id === selectedMarkerId);

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation(pos.coords.latitude, pos.coords.longitude);
          setFlyTarget({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Fallback to default
          setFlyTarget({ lat: userLat, lng: userLng });
        }
      );
    }
  };

  const getColor = (status: string) => {
    switch (status) {
      case 'visited': return '#4ade80';
      case 'bucket': return '#e8652b';
      default: return '#6b8c7b';
    }
  };

  return (
    <div className="w-full h-full relative" data-testid="map-screen">
      {/* Map */}
      <MapContainer
        center={[30, 10]}
        zoom={2}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController />
        {flyTarget && <FlyToMarker lat={flyTarget.lat} lng={flyTarget.lng} />}

        {/* User location marker */}
        <Marker
          position={[userLat, userLng]}
          icon={L.divIcon({
            html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 12px #3b82f688;"></div>`,
            className: '',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          })}
        />

        {filteredPins.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            icon={createMarkerIcon(getColor(pin.pinStatus), pin.id === selectedMarkerId)}
            eventHandlers={{
              click: () => setSelectedMarker(pin.id),
            }}
          >
            <Popup>
              <div className="text-center min-w-[140px]">
                <p className="font-bold text-sm text-slate-800">{pin.name}</p>
                <span
                  className="inline-block mt-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: getColor(pin.pinStatus) + '22',
                    color: getColor(pin.pinStatus),
                  }}
                >
                  {pin.pinStatus}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Search Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20" data-testid="map-search-overlay">
        {searchOpen ? (
          <div className="bg-earth-card/95 backdrop-blur-xl rounded-2xl border border-earth-card shadow-xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <Search size={18} className="text-txt-muted flex-shrink-0" />
              <input
                data-testid="map-search-input"
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent text-txt-primary placeholder:text-txt-muted text-sm outline-none font-body"
              />
              <button
                data-testid="map-search-close"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
                className="text-txt-muted hover:text-txt-primary"
              >
                <X size={18} />
              </button>
            </div>
            {searchQuery && filteredPins.length > 0 && (
              <div className="border-t border-earth-surface max-h-48 overflow-y-auto">
                {filteredPins.slice(0, 5).map((pin) => (
                  <button
                    key={pin.id}
                    data-testid={`search-result-${pin.id}`}
                    onClick={() => {
                      setSelectedMarker(pin.id);
                      setFlyTarget({ lat: pin.lat, lng: pin.lng });
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-earth-surface/60 flex items-center gap-3 transition-colors"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: getColor(pin.pinStatus) }}
                    />
                    <div>
                      <p className="text-sm text-txt-primary font-medium">{pin.name}</p>
                      <p className="text-[11px] text-txt-muted">{pin.tags.slice(0, 3).join(' / ')}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            data-testid="map-search-button"
            onClick={() => setSearchOpen(true)}
            className="bg-earth-card/90 backdrop-blur-xl rounded-2xl border border-earth-card shadow-lg px-4 py-3 flex items-center gap-3 w-full hover:bg-earth-surface/90 transition-colors"
          >
            <Search size={18} className="text-txt-muted" />
            <span className="text-sm text-txt-muted font-body">Search destinations...</span>
          </button>
        )}
      </div>

      {/* Locate Me FAB */}
      <button
        data-testid="locate-me-button"
        onClick={handleLocateMe}
        className="absolute bottom-6 right-4 z-20 w-12 h-12 bg-earth-card/90 backdrop-blur-xl rounded-full border border-earth-card shadow-lg flex items-center justify-center text-brand-orange hover:bg-earth-surface transition-colors"
      >
        <Navigation size={20} />
      </button>

      {/* Selected Pin Details */}
      {selectedPin && (
        <div
          data-testid="map-pin-details"
          className="absolute bottom-20 left-4 right-4 z-20 bg-earth-card/95 backdrop-blur-xl rounded-2xl border border-earth-card shadow-xl overflow-hidden"
        >
          <div className="flex gap-3 p-3">
            <img
              src={selectedPin.image}
              alt={selectedPin.name}
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading font-bold text-txt-primary text-base truncate">{selectedPin.name}</h3>
                <button
                  data-testid="pin-detail-close"
                  onClick={() => setSelectedMarker(null)}
                  className="text-txt-muted hover:text-txt-primary flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {selectedPin.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-earth-surface text-txt-secondary font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {!bucketList.some((d) => d.id === selectedPin.id) ? (
                <button
                  data-testid="add-to-bucket-from-map"
                  onClick={() => addToBucketList(selectedPin)}
                  className="mt-2 text-xs font-semibold text-brand-orange hover:text-brand-orange-hover transition-colors"
                >
                  + Add to Bucket List
                </button>
              ) : (
                <button
                  data-testid="view-bucket-list-from-map"
                  onClick={() => setActiveTab('bucketlist')}
                  className="mt-2 text-xs font-semibold text-brand-sage"
                >
                  In your Bucket List
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-20 right-4 z-20 bg-earth-card/85 backdrop-blur-xl rounded-xl border border-earth-card px-3 py-2 space-y-1.5">
        {[
          { label: 'Recommended', color: '#6b8c7b' },
          { label: 'Bucket List', color: '#e8652b' },
          { label: 'Visited', color: '#4ade80' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span className="text-[10px] text-txt-secondary font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
