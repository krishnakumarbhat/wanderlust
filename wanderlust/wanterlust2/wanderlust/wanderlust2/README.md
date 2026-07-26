# wanderlust 🌍✈️

[![CI](https://github.com/krishnakumarbhat/wanderlust/actions/workflows/ci.yml/badge.svg)](https://github.com/krishnakumarbhat/wanderlust/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0+-green.svg)](https://flask.palletsprojects.com/)

A **travel bucket-list and recommendation** platform — discover destinations, share experiences, and get AI-powered travel recommendations. Features an interactive world map, geospatial filtering, and personalized suggestions.

## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph Frontend["React + TypeScript Frontend"]
        MAP[Interactive World Map]
        SEARCH[Search & Filters]
        PROFILE[User Profile]
        CARDS[Destination Cards]
    end

    subgraph Backend["Flask API Backend"]
        AUTH_API[Auth Endpoints\nRegister / Login]
        REC_API[Recommendation API]
        INT_API[Interaction Tracker]
    end

    subgraph Pipeline["AI Recommendation Pipeline"]
        GEO[Step 1: Geospatial Filter\nHaversine Distance]
        PROF[Step 2: Profile Constraints\nAge / Biker Suitability]
        AI_RANK[Step 3: AI Ranking\nLlamaIndex + ChromaDB]
        GRAPH[LangGraph Orchestration]
    end

    subgraph Data["Data Layer"]
        DB[(SQLite)]
        CHROMA[(ChromaDB\nVector Store)]
    end

    Frontend -->|API| Backend
    REC_API --> Pipeline
    GEO --> PROF --> AI_RANK
    AI_RANK --> CHROMA
    GRAPH --> AI_RANK
    AUTH_API --> DB
    INT_API --> DB
```

## 🔄 Recommendation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as Flask API
    participant GEO as Geospatial Filter
    participant PROF as Profile Filter
    participant AI as AI Ranker
    participant VEC as ChromaDB

    U->>F: Set preferences & location
    F->>API: POST /api/recommendations/cascade
    API->>GEO: Filter by Haversine distance
    GEO->>PROF: Apply age/biker constraints
    PROF->>AI: Score remaining destinations
    AI->>VEC: Semantic search for context
    VEC-->>AI: Relevant travel data
    AI-->>API: Ranked recommendations
    API-->>F: Top destinations
    F-->>U: Display on interactive map
```

## 🚀 Features

- **Interactive World Map** — Explore destinations visually
- **AI Recommendations** — Personalized suggestions using LangGraph + LlamaIndex + ChromaDB
- **Geospatial Filtering** — Distance-based filtering with Haversine formula
- **Profile Matching** — Age and activity suitability constraints
- **Social Features** — See what other travelers explored
- **Auth System** — JWT-based authentication

## 🛠️ Tech Stack

| Layer       | Technology                                |
| ----------- | ----------------------------------------- |
| Frontend    | React, TypeScript, Vite, Gemini AI Studio |
| Backend     | Flask, Python 3.10+                       |
| AI Pipeline | LangGraph, LlamaIndex, ChromaDB           |
| Auth        | SQLite + JWT                              |
| Geospatial  | Haversine distance calculation            |

## 📦 Setup

### Frontend

```bash
npm install
# Set GEMINI_API_KEY in .env.local
npm run dev
```

### Backend

```bash
pip install -r backend/requirements.txt
python backend/app.py
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001`

### Key API Endpoints

| Method | Endpoint                       | Description                    |
| ------ | ------------------------------ | ------------------------------ |
| GET    | `/api/health`                  | Health check                   |
| POST   | `/api/auth/register`           | Register user                  |
| POST   | `/api/auth/login`              | Login                          |
| POST   | `/api/recommendations/cascade` | AI recommendations (auth)      |
| POST   | `/api/recommendations/demo`    | Demo recommendations (no auth) |
| POST   | `/api/interactions`            | Log user interaction (auth)    |

## 📁 Project Structure

```
wanderlust/
├── App.tsx                # React root component
├── components/            # React UI components
├── services/              # API service layer
├── types.ts               # TypeScript types
├── index.html
├── vite.config.ts
├── backend/
│   ├── app.py             # Flask server
│   ├── requirements.txt
│   └── ...
├── .github/workflows/     # CI/CD pipeline
├── .gitignore
└── README.md
```

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request
