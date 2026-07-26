import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Place, Coordinates } from '../types';

const statusColors: Record<string, string> = {
  visited: '#22c55e',
  wishlist: '#38bdf8',
  recommended: '#a78bfa',
};

function createIcon(status: string, isSelected: boolean) {
  const color = statusColors[status] || '#94a3b8';
  const size = isSelected ? 16 : 10;
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 0 6px ${color};"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

interface MapClickHandlerProps {
  onClick: (coords: Coordinates) => void;
}

function MapClickHandler({ onClick }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

interface WorldMapProps {
  places: Place[];
  selectedPlaceId: string | null;
  onSelectPlace: (id: string) => void;
  onMapClick: (coords: Coordinates) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ places, selectedPlaceId, onSelectPlace, onMapClick }) => {
  return (
    <MapContainer
      center={[20, 78]}
      zoom={4}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <MapClickHandler onClick={onMapClick} />
      {places.map(place => (
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
          icon={createIcon(place.status, place.id === selectedPlaceId)}
          eventHandlers={{ click: () => onSelectPlace(place.id) }}
        >
          <Popup>
            <strong>{place.name}</strong>
            <br />
            <em>{place.status}</em>
            {place.notes && <><br /><span>{place.notes.slice(0, 120)}</span></>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default WorldMap;
