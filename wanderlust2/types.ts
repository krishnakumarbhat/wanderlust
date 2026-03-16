export enum PlaceStatus {
  VISITED = 'VISITED',
  BUCKET_LIST = 'BUCKET_LIST',
}

export interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: PlaceStatus;
  notes?: string;
  addedAt: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface AIRecommendation {
  name: string;
  description: string;
  lat: number;
  lng: number;
}
