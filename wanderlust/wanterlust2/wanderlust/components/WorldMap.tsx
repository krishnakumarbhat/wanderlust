import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Place, PlaceStatus, Coordinates } from '../types';

interface WorldMapProps {
  places: Place[];
  selectedPlaceId: string | null;
  onMapClick: (coords: Coordinates) => void;
  onPlaceSelect: (id: string) => void;
}

// Component to handle map events
const MapEvents: React.FC<{ onClick: (coords: Coordinates) => void }> = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

// Component to fly to selected place
const MapFlyTo: React.FC<{ coords: Coordinates | null }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 10, {
        duration: 1.5
      });
    }
  }, [coords, map]);
  return null;
};

const MapResizeFix: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    const updateSize = () => {
      map.invalidateSize();
    };

    const timeoutId = window.setTimeout(updateSize, 250);
    window.addEventListener('resize', updateSize);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('resize', updateSize);
    };
  }, [map]);

  return null;
};

const WorldMap: React.FC<WorldMapProps> = ({ places, selectedPlaceId, onMapClick, onPlaceSelect }) => {
  const selectedPlace = places.find(p => p.id === selectedPlaceId);
  const [isMapReady, setIsMapReady] = useState(false);

  const icons = useMemo(() => {
    const createIcon = (status: PlaceStatus, isSelected: boolean) => {
      const color = status === PlaceStatus.VISITED ? '#059669' : '#e11d48';
      const scale = isSelected ? 'scale(1.2)' : 'scale(1)';
      const shadow = isSelected ? '0 10px 20px rgba(15,23,42,0.25)' : '0 6px 12px rgba(15,23,42,0.2)';
      const glyph = status === PlaceStatus.VISITED ? '✓' : '📍';

      return L.divIcon({
        html: `<div style="width:40px;height:40px;border-radius:9999px;background:#fff;border:2px solid #fff;color:${color};display:flex;align-items:center;justify-content:center;font-size:20px;transform:${scale};box-shadow:${shadow};">${glyph}</div>`,
        className: 'bg-transparent',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });
    };

    return {
      visited: createIcon(PlaceStatus.VISITED, false),
      visitedSelected: createIcon(PlaceStatus.VISITED, true),
      bucket: createIcon(PlaceStatus.BUCKET_LIST, false),
      bucketSelected: createIcon(PlaceStatus.BUCKET_LIST, true),
    };
  }, []);

  const getMarkerIcon = (status: PlaceStatus, isSelected: boolean) => {
    if (status === PlaceStatus.VISITED) {
      return isSelected ? icons.visitedSelected : icons.visited;
    }
    return isSelected ? icons.bucketSelected : icons.bucket;
  };

  return (
    <div className="h-full w-full z-0 relative">
      {!isMapReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100 text-slate-500 text-sm">
          Loading map...
        </div>
      )}
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        preferCanvas={true}
        style={{ height: '100%', width: '100%' }}
        className="outline-none"
        whenReady={() => setIsMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEvents onClick={onMapClick} />
        <MapResizeFix />
        <MapFlyTo coords={selectedPlace ? { lat: selectedPlace.lat, lng: selectedPlace.lng } : null} />

        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={getMarkerIcon(place.status, place.id === selectedPlaceId)}
            eventHandlers={{
              click: () => onPlaceSelect(place.id),
            }}
          >
            <Popup className="font-sans">
              <div className="text-center">
                <h3 className="font-bold text-lg text-slate-800">{place.name}</h3>
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
                  {place.status === PlaceStatus.VISITED ? 'Visited' : 'Bucket List'}
                </p>
                {place.notes && <p className="text-sm text-slate-600 italic">"{place.notes}"</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default WorldMap;
