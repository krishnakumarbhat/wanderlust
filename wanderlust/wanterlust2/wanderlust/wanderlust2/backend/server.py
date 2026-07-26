from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import math

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


MOCK_DESTINATIONS = [
    {
        "id": "kyoto",
        "name": "Kyoto, Japan",
        "lat": 35.0116,
        "lng": 135.7681,
        "image": "https://images.unsplash.com/photo-1730731859180-03edef32ab71?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwyfHxreW90byUyMGphcGFuJTIwc3RyZWV0JTIwbmlnaHR8ZW58MHx8fHwxNzczNTkyMzU4fDA&ixlib=rb-4.1.0&q=85",
        "tags": ["culture", "temples", "zen", "food"],
        "reason": "Ancient temples meet modern minimalism. Kyoto's bamboo groves and hidden tea houses offer a soul-cleansing escape from the digital world.",
        "difficulty": "easy",
        "country": "Japan",
        "status": "recommended",
    },
    {
        "id": "banff",
        "name": "Banff National Park, Canada",
        "lat": 51.4968,
        "lng": -115.9281,
        "image": "https://images.unsplash.com/photo-1646726482391-74f245f1b51c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwzfHxiYW5mZiUyMG5hdGlvbmFsJTIwcGFyayUyMGxha2V8ZW58MHx8fHwxNzczNTkyMzU5fDA&ixlib=rb-4.1.0&q=85",
        "tags": ["mountains", "lakes", "wildlife", "hiking"],
        "reason": "Turquoise lakes framed by jagged peaks. Banff is where you realize nature is the greatest artist — and you get front-row seats.",
        "difficulty": "moderate",
        "country": "Canada",
        "status": "recommended",
    },
    {
        "id": "santorini",
        "name": "Santorini, Greece",
        "lat": 36.3932,
        "lng": 25.4615,
        "image": "https://images.unsplash.com/photo-1656504862933-8d29a68a9492?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwxfHxzYW50b3JpbmklMjBncmVlY2UlMjBzdW5zZXR8ZW58MHx8fHwxNzczNTkyMzYwfDA&ixlib=rb-4.1.0&q=85",
        "tags": ["island", "sunset", "romantic", "coastal"],
        "reason": "Whitewashed cliffs plunging into the Aegean. Every sunset here feels like a personal gift from the universe.",
        "difficulty": "easy",
        "country": "Greece",
        "status": "recommended",
    },
    {
        "id": "patagonia",
        "name": "Patagonia, Chile",
        "lat": -50.9423,
        "lng": -73.4068,
        "image": "https://images.unsplash.com/photo-1667759046521-85e3803601b7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHw0fHxwYXRhZ29uaWElMjBjaGlsZSUyMG1vdW50YWlucyUyMGhpa2luZ3xlbnwwfHx8fDE3NzM1OTIzNjB8MA&ixlib=rb-4.1.0&q=85",
        "tags": ["adventure", "trekking", "glaciers", "wilderness"],
        "reason": "The edge of the world. Patagonia's raw wilderness and towering granite spires will rewrite your definition of 'epic'.",
        "difficulty": "hard",
        "country": "Chile",
        "status": "recommended",
    },
    {
        "id": "bali",
        "name": "Bali, Indonesia",
        "lat": -8.3405,
        "lng": 115.092,
        "image": "https://images.unsplash.com/photo-1555400038-63f5ba517a47?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxiYWxpJTIwcmljZSUyMHRlcnJhY2V8ZW58MHx8fHwxNzczNTkyNDQ4fDA&ixlib=rb-4.1.0&q=85",
        "tags": ["spiritual", "tropical", "surf", "culture"],
        "reason": "Rice terraces that cascade like green staircases to heaven. Bali balances spiritual depth with barefoot beach vibes like nowhere else.",
        "difficulty": "easy",
        "country": "Indonesia",
        "status": "recommended",
    },
    {
        "id": "marrakech",
        "name": "Marrakech, Morocco",
        "lat": 31.6295,
        "lng": -7.9811,
        "image": "https://images.unsplash.com/photo-1772580310425-63f2290c2ba7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwyfHxtYXJyYWtlY2glMjBtb3JvY2NvJTIwc291a3xlbnwwfHx8fDE3NzM1OTI0NTN8MA&ixlib=rb-4.1.0&q=85",
        "tags": ["souks", "spices", "architecture", "vibrant"],
        "reason": "A sensory overload in the best way. Marrakech's labyrinthine souks and hidden riads feel like stepping into a living storybook.",
        "difficulty": "easy",
        "country": "Morocco",
        "status": "recommended",
    },
    {
        "id": "iceland",
        "name": "Iceland",
        "lat": 64.1466,
        "lng": -21.9426,
        "image": "https://images.unsplash.com/photo-1671273257845-a6032cdbec6d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwxfHxpY2VsYW5kJTIwd2F0ZXJmYWxsJTIwbGFuZHNjYXBlfGVufDB8fHx8MTc3MzU5MjQ1N3ww&ixlib=rb-4.1.0&q=85",
        "tags": ["waterfalls", "glaciers", "northern-lights", "volcanic"],
        "reason": "Where fire meets ice. Iceland's alien landscapes — from black sand beaches to erupting geysers — feel like exploring another planet.",
        "difficulty": "moderate",
        "country": "Iceland",
        "status": "recommended",
    },
    {
        "id": "machu-picchu",
        "name": "Machu Picchu, Peru",
        "lat": -13.1631,
        "lng": -72.545,
        "image": "https://images.unsplash.com/photo-1586367443347-239902c28684?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwyfHxtYWNodSUyMHBpY2NodSUyMHBlcnUlMjBydWluc3xlbnwwfHx8fDE3NzM1OTI0NjN8MA&ixlib=rb-4.1.0&q=85",
        "tags": ["ruins", "trek", "history", "mystical"],
        "reason": "An Incan citadel perched above the clouds. The sunrise over these ancient stones is one of those moments that changes you forever.",
        "difficulty": "hard",
        "country": "Peru",
        "status": "recommended",
    },
]

MOCK_SOCIAL_FEED = [
    {"id": "1", "user": "Alex Rivera", "avatar": "AR", "action": "added Kyoto to their bucket list", "time": "2h ago"},
    {"id": "2", "user": "Mia Chen", "avatar": "MC", "action": "just visited Santorini", "time": "4h ago"},
    {"id": "3", "user": "Omar Khalil", "avatar": "OK", "action": "explored Marrakech's souks", "time": "6h ago"},
    {"id": "4", "user": "Priya Sharma", "avatar": "PS", "action": "completed the Patagonia trek", "time": "8h ago"},
    {"id": "5", "user": "Liam O'Brien", "avatar": "LO", "action": "discovered Banff's hidden trails", "time": "12h ago"},
    {"id": "6", "user": "Yuki Tanaka", "avatar": "YT", "action": "added Iceland to their bucket list", "time": "1d ago"},
]


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "wanderlust-backend"}


@app.get("/api/destinations")
def get_destinations():
    return {"destinations": MOCK_DESTINATIONS}


@app.get("/api/recommendations")
def get_recommendations():
    return {"recommendations": MOCK_DESTINATIONS}


@app.post("/api/auth/login")
def login(req: LoginRequest):
    return {
        "token": "mock-jwt-token-wanderlust-2024",
        "user": {
            "id": "user_1",
            "username": "wanderer",
            "email": req.email,
            "avatar": None,
            "places_visited": 12,
            "countries": 7,
        },
    }


@app.post("/api/auth/register")
def register(req: RegisterRequest):
    return {
        "token": "mock-jwt-token-wanderlust-2024",
        "user": {
            "id": "user_1",
            "username": req.username,
            "email": req.email,
            "avatar": None,
            "places_visited": 0,
            "countries": 0,
        },
    }


@app.get("/api/social/feed")
def social_feed():
    return {"feed": MOCK_SOCIAL_FEED}
