export type PlaceStatus = 'visited' | 'wishlist' | 'recommended';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: PlaceStatus;
  notes: string;
  addedAt: number;
}
