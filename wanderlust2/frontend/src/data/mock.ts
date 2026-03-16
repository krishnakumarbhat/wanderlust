export interface Destination {
  id: string;
  name: string;
  lat: number;
  lng: number;
  image: string;
  tags: string[];
  reason: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  country: string;
  status: 'recommended' | 'bucket' | 'visited';
}

export interface SocialFeedItem {
  id: string;
  user: string;
  avatar: string;
  action: string;
  time: string;
}

export const MOCK_DESTINATIONS: Destination[] = [
  {
    id: 'kyoto',
    name: 'Kyoto, Japan',
    lat: 35.0116,
    lng: 135.7681,
    image: 'https://images.unsplash.com/photo-1730731859180-03edef32ab71?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwyfHxreW90byUyMGphcGFuJTIwc3RyZWV0JTIwbmlnaHR8ZW58MHx8fHwxNzczNTkyMzU4fDA&ixlib=rb-4.1.0&q=85',
    tags: ['culture', 'temples', 'zen', 'food'],
    reason: "Ancient temples meet modern minimalism. Kyoto's bamboo groves and hidden tea houses offer a soul-cleansing escape from the digital world.",
    difficulty: 'easy',
    country: 'Japan',
    status: 'recommended',
  },
  {
    id: 'banff',
    name: 'Banff National Park, Canada',
    lat: 51.4968,
    lng: -115.9281,
    image: 'https://images.unsplash.com/photo-1646726482391-74f245f1b51c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwzfHxiYW5mZiUyMG5hdGlvbmFsJTIwcGFyayUyMGxha2V8ZW58MHx8fHwxNzczNTkyMzU5fDA&ixlib=rb-4.1.0&q=85',
    tags: ['mountains', 'lakes', 'wildlife', 'hiking'],
    reason: "Turquoise lakes framed by jagged peaks. Banff is where you realize nature is the greatest artist — and you get front-row seats.",
    difficulty: 'moderate',
    country: 'Canada',
    status: 'recommended',
  },
  {
    id: 'santorini',
    name: 'Santorini, Greece',
    lat: 36.3932,
    lng: 25.4615,
    image: 'https://images.unsplash.com/photo-1656504862933-8d29a68a9492?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwxfHxzYW50b3JpbmklMjBncmVlY2UlMjBzdW5zZXR8ZW58MHx8fHwxNzczNTkyMzYwfDA&ixlib=rb-4.1.0&q=85',
    tags: ['island', 'sunset', 'romantic', 'coastal'],
    reason: "Whitewashed cliffs plunging into the Aegean. Every sunset here feels like a personal gift from the universe.",
    difficulty: 'easy',
    country: 'Greece',
    status: 'recommended',
  },
  {
    id: 'patagonia',
    name: 'Patagonia, Chile',
    lat: -50.9423,
    lng: -73.4068,
    image: 'https://images.unsplash.com/photo-1667759046521-85e3803601b7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHw0fHxwYXRhZ29uaWElMjBjaGlsZSUyMG1vdW50YWlucyUyMGhpa2luZ3xlbnwwfHx8fDE3NzM1OTIzNjB8MA&ixlib=rb-4.1.0&q=85',
    tags: ['adventure', 'trekking', 'glaciers', 'wilderness'],
    reason: "The edge of the world. Patagonia's raw wilderness and towering granite spires will rewrite your definition of 'epic'.",
    difficulty: 'hard',
    country: 'Chile',
    status: 'recommended',
  },
  {
    id: 'bali',
    name: 'Bali, Indonesia',
    lat: -8.3405,
    lng: 115.092,
    image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxiYWxpJTIwcmljZSUyMHRlcnJhY2V8ZW58MHx8fHwxNzczNTkyNDQ4fDA&ixlib=rb-4.1.0&q=85',
    tags: ['spiritual', 'tropical', 'surf', 'culture'],
    reason: "Rice terraces cascading like green staircases to heaven. Bali balances spiritual depth with barefoot beach vibes like nowhere else.",
    difficulty: 'easy',
    country: 'Indonesia',
    status: 'recommended',
  },
  {
    id: 'marrakech',
    name: 'Marrakech, Morocco',
    lat: 31.6295,
    lng: -7.9811,
    image: 'https://images.unsplash.com/photo-1772580310425-63f2290c2ba7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwyfHxtYXJyYWtlY2glMjBtb3JvY2NvJTIwc291a3xlbnwwfHx8fDE3NzM1OTI0NTN8MA&ixlib=rb-4.1.0&q=85',
    tags: ['souks', 'spices', 'architecture', 'vibrant'],
    reason: "A sensory overload in the best way. Marrakech's labyrinthine souks and hidden riads feel like stepping into a living storybook.",
    difficulty: 'easy',
    country: 'Morocco',
    status: 'recommended',
  },
  {
    id: 'iceland',
    name: 'Iceland',
    lat: 64.1466,
    lng: -21.9426,
    image: 'https://images.unsplash.com/photo-1671273257845-a6032cdbec6d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwxfHxpY2VsYW5kJTIwd2F0ZXJmYWxsJTIwbGFuZHNjYXBlfGVufDB8fHx8MTc3MzU5MjQ1N3ww&ixlib=rb-4.1.0&q=85',
    tags: ['waterfalls', 'glaciers', 'northern-lights', 'volcanic'],
    reason: "Where fire meets ice. Iceland's alien landscapes — from black sand beaches to erupting geysers — feel like exploring another planet.",
    difficulty: 'moderate',
    country: 'Iceland',
    status: 'recommended',
  },
  {
    id: 'machu-picchu',
    name: 'Machu Picchu, Peru',
    lat: -13.1631,
    lng: -72.545,
    image: 'https://images.unsplash.com/photo-1586367443347-239902c28684?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwyfHxtYWNodSUyMHBpY2NodSUyMHBlcnUlMjBydWluc3xlbnwwfHx8fDE3NzM1OTI0NjN8MA&ixlib=rb-4.1.0&q=85',
    tags: ['ruins', 'trek', 'history', 'mystical'],
    reason: "An Incan citadel perched above the clouds. The sunrise over these ancient stones is one of those moments that changes you forever.",
    difficulty: 'hard',
    country: 'Peru',
    status: 'recommended',
  },
];

export const MOCK_SOCIAL_FEED: SocialFeedItem[] = [
  { id: '1', user: 'Alex Rivera', avatar: 'AR', action: 'added Kyoto to their bucket list', time: '2h ago' },
  { id: '2', user: 'Mia Chen', avatar: 'MC', action: 'just visited Santorini', time: '4h ago' },
  { id: '3', user: 'Omar Khalil', avatar: 'OK', action: 'explored Marrakech\'s souks', time: '6h ago' },
  { id: '4', user: 'Priya Sharma', avatar: 'PS', action: 'completed the Patagonia trek', time: '8h ago' },
  { id: '5', user: 'Liam O\'Brien', avatar: 'LO', action: 'discovered Banff\'s hidden trails', time: '12h ago' },
  { id: '6', user: 'Yuki Tanaka', avatar: 'YT', action: 'added Iceland to their bucket list', time: '1d ago' },
];

// --- Travel Posts for the Feed ---
export interface TripStop {
  city: string;
  country: string;
  days: number;
}

export interface PostComment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
}

export interface TravelPost {
  id: string;
  user: string;
  avatar: string;
  avatarColor: string;
  bio: string;
  isFollowing: boolean;
  tripTitle: string;
  tripSequence: TripStop[];
  coverImage: string;
  caption: string;
  routeLikes: number;
  isRouteLiked: boolean;
  comments: PostComment[];
  postedAt: string;
  totalDays: number;
}

export const MOCK_TRAVEL_POSTS: TravelPost[] = [
  {
    id: 'post-1',
    user: 'Elena Rossi',
    avatar: 'ER',
    avatarColor: '#e8652b',
    bio: 'Italian foodie & architecture nerd',
    isFollowing: false,
    tripTitle: 'Italian Renaissance Trail',
    tripSequence: [
      { city: 'Rome', country: 'Italy', days: 4 },
      { city: 'Florence', country: 'Italy', days: 3 },
      { city: 'Cinque Terre', country: 'Italy', days: 2 },
      { city: 'Venice', country: 'Italy', days: 3 },
    ],
    coverImage: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&q=80',
    caption: 'Two weeks through Italy by train. Every city felt like a different era. Florence stole my heart, but Venice at dawn was pure magic.',
    routeLikes: 47,
    isRouteLiked: false,
    comments: [
      { id: 'c1', user: 'Marco B.', avatar: 'MB', text: 'Did you take the train between Florence and Venice? How long was the ride?', time: '3h ago' },
      { id: 'c2', user: 'Sakura T.', avatar: 'ST', text: 'What was the total cost for 2 weeks? Trying to budget my own trip!', time: '5h ago' },
      { id: 'c3', user: 'Dev Patel', avatar: 'DP', text: 'Cinque Terre is so underrated. Which village was your favorite?', time: '8h ago' },
    ],
    postedAt: '6h ago',
    totalDays: 12,
  },
  {
    id: 'post-2',
    user: 'Kenji Watanabe',
    avatar: 'KW',
    avatarColor: '#6b8c7b',
    bio: 'Photographer chasing golden hours',
    isFollowing: true,
    tripTitle: 'Southeast Asia Backpacking',
    tripSequence: [
      { city: 'Bangkok', country: 'Thailand', days: 3 },
      { city: 'Chiang Mai', country: 'Thailand', days: 4 },
      { city: 'Luang Prabang', country: 'Laos', days: 3 },
      { city: 'Hanoi', country: 'Vietnam', days: 3 },
      { city: 'Ha Long Bay', country: 'Vietnam', days: 2 },
    ],
    coverImage: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80',
    caption: 'Crossed 3 countries in 15 days. The night markets in Chiang Mai and the karst landscapes of Ha Long Bay were absolute highlights.',
    routeLikes: 83,
    isRouteLiked: false,
    comments: [
      { id: 'c4', user: 'Lisa M.', avatar: 'LM', text: 'How did you get from Chiang Mai to Luang Prabang? Slow boat?', time: '1h ago' },
      { id: 'c5', user: 'Raj K.', avatar: 'RK', text: 'Ha Long Bay is on my list! Did you do the overnight cruise?', time: '4h ago' },
    ],
    postedAt: '12h ago',
    totalDays: 15,
  },
  {
    id: 'post-3',
    user: 'Amara Okafor',
    avatar: 'AO',
    avatarColor: '#d4a373',
    bio: 'Solo adventurer & journal keeper',
    isFollowing: false,
    tripTitle: 'Andean Heights',
    tripSequence: [
      { city: 'Lima', country: 'Peru', days: 2 },
      { city: 'Cusco', country: 'Peru', days: 3 },
      { city: 'Machu Picchu', country: 'Peru', days: 2 },
      { city: 'La Paz', country: 'Bolivia', days: 3 },
    ],
    coverImage: 'https://images.unsplash.com/photo-1586367443347-239902c28684?w=800&q=80',
    caption: 'From the coast to 4,000m altitude in a week. The Inca Trail was grueling but watching sunrise over Machu Picchu made every blister worth it.',
    routeLikes: 126,
    isRouteLiked: false,
    comments: [
      { id: 'c6', user: 'Carlos R.', avatar: 'CR', text: 'How was the altitude sickness in Cusco? Any tips?', time: '2h ago' },
      { id: 'c7', user: 'Nina F.', avatar: 'NF', text: 'Did you book the Inca Trail permits in advance? I heard they sell out months ahead.', time: '6h ago' },
      { id: 'c8', user: 'Tom W.', avatar: 'TW', text: 'La Paz looks incredible. How safe did you feel as a solo traveler?', time: '10h ago' },
    ],
    postedAt: '1d ago',
    totalDays: 10,
  },
];

// --- User Trips for Profile Timeline ---
export interface UserTrip {
  id: string;
  tripTitle: string;
  date: string;
  stops: { city: string; country: string }[];
  highlight: string;
  daysTotal: number;
}

// --- Mock profiles for feed users (viewable when you tap on them) ---
export interface FeedUserProfile {
  userId: string;
  username: string;
  avatar: string;
  avatarColor: string;
  bio: string;
  followers: number;
  following: number;
  countries: number;
  trips: UserTrip[];
}

export const MOCK_FEED_USER_PROFILES: Record<string, FeedUserProfile> = {
  'post-1': {
    userId: 'elena-rossi',
    username: 'Elena Rossi',
    avatar: 'ER',
    avatarColor: '#e8652b',
    bio: 'Italian foodie & architecture nerd',
    followers: 1243,
    following: 389,
    countries: 14,
    trips: [
      {
        id: 'er-trip-1',
        tripTitle: 'Italian Renaissance Trail',
        date: 'Nov 2025',
        stops: [
          { city: 'Rome', country: 'Italy' },
          { city: 'Florence', country: 'Italy' },
          { city: 'Cinque Terre', country: 'Italy' },
          { city: 'Venice', country: 'Italy' },
        ],
        highlight: 'Sunset from Ponte Vecchio',
        daysTotal: 12,
      },
      {
        id: 'er-trip-2',
        tripTitle: 'Amalfi Coast Drive',
        date: 'Aug 2025',
        stops: [
          { city: 'Naples', country: 'Italy' },
          { city: 'Positano', country: 'Italy' },
          { city: 'Ravello', country: 'Italy' },
        ],
        highlight: 'Limoncello tasting in Ravello',
        daysTotal: 6,
      },
    ],
  },
  'post-2': {
    userId: 'kenji-watanabe',
    username: 'Kenji Watanabe',
    avatar: 'KW',
    avatarColor: '#6b8c7b',
    bio: 'Photographer chasing golden hours',
    followers: 3891,
    following: 201,
    countries: 22,
    trips: [
      {
        id: 'kw-trip-1',
        tripTitle: 'Southeast Asia Backpacking',
        date: 'Dec 2025',
        stops: [
          { city: 'Bangkok', country: 'Thailand' },
          { city: 'Chiang Mai', country: 'Thailand' },
          { city: 'Luang Prabang', country: 'Laos' },
          { city: 'Hanoi', country: 'Vietnam' },
          { city: 'Ha Long Bay', country: 'Vietnam' },
        ],
        highlight: 'Sunrise on a junk boat in Ha Long Bay',
        daysTotal: 15,
      },
      {
        id: 'kw-trip-2',
        tripTitle: 'Hokkaido Winter Tour',
        date: 'Feb 2025',
        stops: [
          { city: 'Sapporo', country: 'Japan' },
          { city: 'Otaru', country: 'Japan' },
          { city: 'Furano', country: 'Japan' },
        ],
        highlight: 'Powder snow at Furano',
        daysTotal: 7,
      },
    ],
  },
  'post-3': {
    userId: 'amara-okafor',
    username: 'Amara Okafor',
    avatar: 'AO',
    avatarColor: '#d4a373',
    bio: 'Solo adventurer & journal keeper',
    followers: 892,
    following: 167,
    countries: 11,
    trips: [
      {
        id: 'ao-trip-1',
        tripTitle: 'Andean Heights',
        date: 'Oct 2025',
        stops: [
          { city: 'Lima', country: 'Peru' },
          { city: 'Cusco', country: 'Peru' },
          { city: 'Machu Picchu', country: 'Peru' },
          { city: 'La Paz', country: 'Bolivia' },
        ],
        highlight: 'Sunrise over Machu Picchu',
        daysTotal: 10,
      },
      {
        id: 'ao-trip-2',
        tripTitle: 'East Africa Safari',
        date: 'Jun 2025',
        stops: [
          { city: 'Nairobi', country: 'Kenya' },
          { city: 'Masai Mara', country: 'Kenya' },
          { city: 'Serengeti', country: 'Tanzania' },
        ],
        highlight: 'Wildebeest migration at dawn',
        daysTotal: 9,
      },
    ],
  },
};

export const MOCK_USER_TRIPS: UserTrip[] = [
  {
    id: 'trip-1',
    tripTitle: 'Japan Golden Route',
    date: 'Oct 2025',
    stops: [
      { city: 'Tokyo', country: 'Japan' },
      { city: 'Hakone', country: 'Japan' },
      { city: 'Kyoto', country: 'Japan' },
      { city: 'Osaka', country: 'Japan' },
    ],
    highlight: 'Bamboo grove at sunrise',
    daysTotal: 14,
  },
  {
    id: 'trip-2',
    tripTitle: 'Greek Island Hopping',
    date: 'Jul 2025',
    stops: [
      { city: 'Athens', country: 'Greece' },
      { city: 'Mykonos', country: 'Greece' },
      { city: 'Santorini', country: 'Greece' },
    ],
    highlight: 'Sunset at Oia caldera',
    daysTotal: 10,
  },
  {
    id: 'trip-3',
    tripTitle: 'Nordic Adventure',
    date: 'Mar 2025',
    stops: [
      { city: 'Reykjavik', country: 'Iceland' },
      { city: 'Vik', country: 'Iceland' },
      { city: 'Akureyri', country: 'Iceland' },
    ],
    highlight: 'Northern Lights over black sand beach',
    daysTotal: 8,
  },
  {
    id: 'trip-4',
    tripTitle: 'Morocco Express',
    date: 'Jan 2025',
    stops: [
      { city: 'Marrakech', country: 'Morocco' },
      { city: 'Sahara Desert', country: 'Morocco' },
      { city: 'Fes', country: 'Morocco' },
    ],
    highlight: 'Sleeping under the stars in the Sahara',
    daysTotal: 7,
  },
];

export const MOCK_USER = {
  id: 'user_1',
  username: 'wanderer',
  email: 'demo@wanderlust.app',
  places_visited: 12,
  countries: 7,
  followers: 284,
  following: 143,
};
