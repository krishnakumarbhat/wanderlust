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

export interface Comment {
  username: string;
  text: string;
  created_at: string;
}

export interface CommunityInfo {
  likes: number;
  liked_by_me: boolean;
  comments: Comment[];
}

export interface TripStop {
  name: string;
  lat: number;
  lng: number;
}

export interface Trip {
  id: number;
  name: string;
  created_at?: string;
  stops?: number;
}

export interface LeaderboardEntry {
  place_key: string;
  total?: number;
  username?: string;
  places?: number;
}

export interface ProfileMe {
  username: string;
  stats: { interactions: number; comments: number; likes_given: number; trips: number };
  badges: string[];
}
