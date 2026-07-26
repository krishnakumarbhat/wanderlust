# Wanderlust 2 — AI Travel Recommendation Platform

## Overview

Wanderlust is a full-stack travel bucket-list and recommendation platform. It combines an interactive world map frontend with an AI-powered recommendation pipeline that uses geospatial filtering, user profiling, and semantic vector search.

## Execution Flow

```
00_main (backend/app.py)     → Flask API entry point, initializes DB + recommender
  ├── 01_db (backend/db.py)  → SQLite schema: users, interactions
  ├── 02_recommender         → LangGraph pipeline: geo → profile → AI rank
  │     (backend/recommender.py)
  └── 03_frontend            → React + TypeScript UI (root-level components)
        (App.tsx, components/, services/)
```

### Step-by-step

1. **`backend/app.py`** — Bootstraps Flask, calls `init_db()`, instantiates `TravelRecommender`.
2. **`backend/db.py`** — Creates SQLite tables (`users`, `interactions`) if not present.
3. **`backend/recommender.py`** — Loads `places.json`, builds ChromaDB vector index via LlamaIndex, compiles a LangGraph `StateGraph` with three nodes:
   - **geo_filter** — Haversine distance filter (biker: 1200 km, non-biker: 600 km).
   - **profile_filter** — Age range, biker-friendliness, difficulty constraints.
   - **rank_candidates** — Weighted scoring: 45% semantic + 30% tag match + 15% distance + 10% social.
4. **Frontend (`App.tsx`)** — React SPA with Leaflet world map, auth modal, sidebar, add-place modal. Calls backend API for recommendations.

## API Endpoints

| Method | Path                             | Auth | Description                         |
|--------|----------------------------------|------|-------------------------------------|
| GET    | `/api/health`                    | No   | Health check                        |
| POST   | `/api/auth/register`             | No   | Register new user                   |
| POST   | `/api/auth/login`                | No   | Login, returns JWT-like token       |
| POST   | `/api/interactions`              | Yes  | Record saved/loved interaction      |
| POST   | `/api/recommendations/cascade`   | Yes  | Personalized recommendations        |
| POST   | `/api/recommendations/demo`      | No   | Demo recommendations (no auth)      |

## Tech Stack

| Layer       | Technology                                     |
|-------------|------------------------------------------------|
| Frontend    | React 19, TypeScript, Vite, Leaflet            |
| Backend     | Flask 3.1, Flask-CORS                          |
| AI Pipeline | LangGraph, LlamaIndex, FastEmbed (bge-small)   |
| Vector DB   | ChromaDB (persistent)                          |
| Database    | SQLite                                         |
| Auth        | itsdangerous (URL-safe timed serializer)       |

## Directory Structure

```
wanderlust2/
├── docs/                  # All documentation lives here
│   ├── README.md          # This file
│   ├── HLD.drawio         # High-Level Design diagram
│   ├── LLD.drawio         # Low-Level Design diagram
│   ├── flow.drawio        # Execution flow diagram
│   └── UML.drawio         # UML class diagram
├── scripts/               # Build & run scripts
│   ├── build.sh           # Install all dependencies
│   ├── run_backend.sh     # Start Flask backend
│   └── run_frontend.sh    # Start Vite dev server
├── backend/
│   ├── app.py             # Flask entry (00_main)
│   ├── db.py              # Database layer (01_db)
│   ├── recommender.py     # AI pipeline (02_recommender)
│   ├── requirements.txt   # Python dependencies
│   └── data/places.json   # Destination dataset
├── App.tsx                # React root component
├── components/            # React UI components
├── services/              # API service layer
├── types.ts               # TypeScript type definitions
├── package.json           # Node dependencies
└── vite.config.ts         # Vite build config
```

## Quick Start

```bash
# From wanderlust2/
chmod +x scripts/*.sh
./scripts/build.sh          # Install Python + Node deps
./scripts/run_backend.sh    # Start backend on :5001
./scripts/run_frontend.sh   # Start frontend on :3000
```

## Scoring Formula

$$S = 0.45 \cdot S_{\text{semantic}} + 0.30 \cdot S_{\text{tag}} + 0.15 \cdot S_{\text{distance}} + 0.10 \cdot S_{\text{social}}$$

Where:
- $S_{\text{semantic}}$ — ChromaDB vector similarity (bge-small-en-v1.5)
- $S_{\text{tag}}$ — Jaccard-like overlap with loved/saved place tags
- $S_{\text{distance}}$ — Inverse normalized haversine distance (max 1500 km)
- $S_{\text{social}}$ — Co-loved frequency score (capped at 5)
