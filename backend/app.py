from __future__ import annotations

import json
import os
import secrets
from pathlib import Path
from typing import Any

from flask import Flask, jsonify, request
from flask_cors import CORS
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from werkzeug.security import check_password_hash, generate_password_hash

from db import get_connection, init_db
from recommender import TravelRecommender


BASE_DIR = Path(__file__).resolve().parent
SECRET_KEY = os.environ.get("WANDERLUST_SECRET_KEY", "wanderlust-local-dev-secret")
TOKEN_SALT = "wanderlust-auth"
TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

serializer = URLSafeTimedSerializer(SECRET_KEY)

app = Flask(__name__)
CORS(app)

init_db()
recommender = TravelRecommender(
    data_path=BASE_DIR / "data" / "places.json",
    persist_path=BASE_DIR / "chroma_store",
)


def create_token(user_id: int) -> str:
    return serializer.dumps({"user_id": user_id}, salt=TOKEN_SALT)


def decode_token(token: str) -> int | None:
    try:
        payload = serializer.loads(token, salt=TOKEN_SALT, max_age=TOKEN_MAX_AGE_SECONDS)
        return int(payload["user_id"])
    except (BadSignature, SignatureExpired, KeyError, ValueError):
        return None


def get_current_user_id() -> int | None:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.replace("Bearer ", "", 1).strip()
    return decode_token(token)


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "wanderlust-backend"})


@app.post("/api/auth/register")
def register():
    body = request.get_json(force=True) or {}
    required_fields = [
        "username",
        "email",
        "password",
        "age",
        "is_biker",
        "home_lat",
        "home_lng",
    ]
    missing = [f for f in required_fields if f not in body]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO users (username, email, password_hash, age, is_biker, home_city, home_lat, home_lng)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                body["username"],
                body["email"],
                generate_password_hash(body["password"]),
                int(body["age"]),
                1 if body["is_biker"] else 0,
                body.get("home_city", ""),
                float(body["home_lat"]),
                float(body["home_lng"]),
            ),
        )
        conn.commit()
        user_id = cursor.lastrowid
    except Exception as ex:
        conn.close()
        return jsonify({"error": f"Could not register: {str(ex)}"}), 400

    conn.close()
    token = create_token(int(user_id))
    return jsonify({"token": token, "user_id": user_id})


@app.post("/api/auth/login")
def login():
    body = request.get_json(force=True) or {}
    email = body.get("email", "")
    password = body.get("password", "")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_token(int(user["id"]))
    return jsonify({"token": token, "user_id": user["id"]})


@app.post("/api/interactions")
def add_interaction():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    body = request.get_json(force=True) or {}
    place_id = body.get("place_id")
    interaction_type = body.get("interaction_type")
    if not place_id or interaction_type not in {"saved", "loved"}:
        return jsonify({"error": "Invalid interaction payload"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO interactions (user_id, place_id, interaction_type) VALUES (?, ?, ?)",
        (user_id, place_id, interaction_type),
    )
    conn.commit()
    conn.close()

    return jsonify({"status": "ok"})


@app.post("/api/recommendations/cascade")
def cascade_recommendations():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    body = request.get_json(silent=True) or {}
    top_k = int(body.get("top_k", 5))
    max_distance_km = body.get("max_distance_km")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        return jsonify({"error": "User not found"}), 404

    cursor.execute(
        "SELECT place_id, interaction_type FROM interactions WHERE user_id = ? ORDER BY id DESC",
        (user_id,),
    )
    interactions = [dict(row) for row in cursor.fetchall()]
    conn.close()

    profile: dict[str, Any] = {
        "age": user["age"],
        "is_biker": bool(user["is_biker"]),
        "home_lat": user["home_lat"],
        "home_lng": user["home_lng"],
        "max_distance_km": max_distance_km,
    }
    results = recommender.recommend(profile, interactions, top_k=top_k)
    return jsonify({"results": results})


@app.post("/api/recommendations/demo")
def demo_recommendations():
    body = request.get_json(silent=True) or {}
    profile = body.get("profile", {})
    top_k = int(body.get("top_k", 3))
    visited_place_ids = body.get("visited_place_ids", [])
    visited_place_names = body.get("visited_place_names", [])
    bucket_place_names = body.get("bucket_place_names", [])

    name_to_id = {p["name"].lower(): p["id"] for p in recommender.places}
    for name in visited_place_names:
        if isinstance(name, str):
            mapped = name_to_id.get(name.strip().lower())
            if mapped:
                visited_place_ids.append(mapped)

    bucket_place_ids = []
    for name in bucket_place_names:
        if isinstance(name, str):
            mapped = name_to_id.get(name.strip().lower())
            if mapped:
                bucket_place_ids.append(mapped)

    interactions = [
        {"place_id": place_id, "interaction_type": "loved"}
        for place_id in visited_place_ids
        if isinstance(place_id, str)
    ]
    interactions.extend(
        [
            {"place_id": place_id, "interaction_type": "saved"}
            for place_id in bucket_place_ids
            if isinstance(place_id, str)
        ]
    )

    merged_profile: dict[str, Any] = {
        "age": int(profile.get("age", 26)),
        "is_biker": bool(profile.get("is_biker", True)),
        "home_lat": float(profile.get("home_lat", 12.9716)),
        "home_lng": float(profile.get("home_lng", 77.5946)),
        "max_distance_km": profile.get("max_distance_km"),
    }

    results = recommender.recommend(merged_profile, interactions, top_k=top_k)
    return jsonify({"results": results})


# ---------------------------------------------------------------------------
# Community features: sharing, likes, comments, trips, leaderboard, badges
# ---------------------------------------------------------------------------

def _username(user_id: int) -> str:
    conn = get_connection()
    row = conn.execute("SELECT username FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return row["username"] if row else "traveler"


def _like_count(conn, place_key: str) -> int:
    return conn.execute(
        "SELECT COUNT(*) AS c FROM place_likes WHERE place_key = ?", (place_key,)
    ).fetchone()["c"]


@app.post("/api/share")
def create_share():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    body = request.get_json(silent=True) or {}
    places = body.get("places", [])
    if not isinstance(places, list) or not places:
        return jsonify({"error": "places must be a non-empty list"}), 400

    token = secrets.token_urlsafe(8)
    conn = get_connection()
    conn.execute(
        "INSERT INTO shared_maps (token, owner_id, payload) VALUES (?, ?, ?)",
        (token, user_id, json.dumps(places)),
    )
    conn.commit()
    conn.close()
    return jsonify({"token": token})


@app.get("/api/share/<token>")
def get_share(token: str):
    conn = get_connection()
    row = conn.execute("SELECT * FROM shared_maps WHERE token = ?", (token,)).fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Share link not found"}), 404
    return jsonify({"owner": _username(row["owner_id"]), "places": json.loads(row["payload"])})


@app.get("/api/places/<place_key>/community")
def place_community(place_key: str):
    user_id = get_current_user_id()
    conn = get_connection()
    likes = _like_count(conn, place_key)
    liked_by_me = bool(
        user_id
        and conn.execute(
            "SELECT 1 FROM place_likes WHERE place_key = ? AND user_id = ?", (place_key, user_id)
        ).fetchone()
    )
    comments = [
        dict(r)
        for r in conn.execute(
            """
            SELECT c.text, c.created_at, u.username
            FROM comments c JOIN users u ON u.id = c.user_id
            WHERE c.place_key = ? ORDER BY c.id DESC LIMIT 50
            """,
            (place_key,),
        ).fetchall()
    ]
    conn.close()
    return jsonify({"likes": likes, "liked_by_me": liked_by_me, "comments": comments})


@app.post("/api/places/<place_key>/like")
def toggle_like(place_key: str):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    conn = get_connection()
    existing = conn.execute(
        "SELECT 1 FROM place_likes WHERE place_key = ? AND user_id = ?", (place_key, user_id)
    ).fetchone()
    if existing:
        conn.execute("DELETE FROM place_likes WHERE place_key = ? AND user_id = ?", (place_key, user_id))
        liked = False
    else:
        conn.execute("INSERT INTO place_likes (user_id, place_key) VALUES (?, ?)", (user_id, place_key))
        liked = True
    conn.commit()
    likes = _like_count(conn, place_key)
    conn.close()
    return jsonify({"liked": liked, "likes": likes})


@app.post("/api/places/<place_key>/comments")
def add_comment(place_key: str):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    body = request.get_json(silent=True) or {}
    text = (body.get("text") or "").strip()
    if not text or len(text) > 500:
        return jsonify({"error": "text must be 1-500 characters"}), 400
    conn = get_connection()
    conn.execute(
        "INSERT INTO comments (place_key, user_id, text) VALUES (?, ?, ?)",
        (place_key, user_id, text),
    )
    conn.commit()
    conn.close()
    return jsonify({"status": "ok", "username": _username(user_id)})


@app.get("/api/leaderboard")
def leaderboard():
    """Most-loved destinations across all users (interactions + likes)."""
    conn = get_connection()
    rows = conn.execute(
        """
        SELECT place_key, SUM(score) AS total FROM (
            SELECT place_id AS place_key, COUNT(*) * 2.0 AS score
            FROM interactions WHERE interaction_type IN ('loved', 'saved')
            GROUP BY place_id
            UNION ALL
            SELECT place_key, COUNT(*) * 1.0 AS score
            FROM place_likes GROUP BY place_key
        ) GROUP BY place_key ORDER BY total DESC LIMIT 10
        """
    ).fetchall()
    top_travelers = conn.execute(
        """
        SELECT u.username, COUNT(*) AS places
        FROM interactions i JOIN users u ON u.id = i.user_id
        GROUP BY i.user_id ORDER BY places DESC LIMIT 5
        """
    ).fetchall()
    conn.close()
    return jsonify(
        {
            "places": [dict(r) for r in rows],
            "top_travelers": [dict(r) for r in top_travelers],
        }
    )


@app.get("/api/profile/me")
def profile_me():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    conn = get_connection()
    interactions = conn.execute(
        "SELECT COUNT(*) AS c FROM interactions WHERE user_id = ?", (user_id,)
    ).fetchone()["c"]
    comments = conn.execute(
        "SELECT COUNT(*) AS c FROM comments WHERE user_id = ?", (user_id,)
    ).fetchone()["c"]
    likes_given = conn.execute(
        "SELECT COUNT(*) AS c FROM place_likes WHERE user_id = ?", (user_id,)
    ).fetchone()["c"]
    trips = conn.execute(
        "SELECT COUNT(*) AS c FROM trips WHERE user_id = ?", (user_id,)
    ).fetchone()["c"]
    conn.close()

    badges = []
    if interactions >= 1:
        badges.append("First Steps 🌱")
    if interactions >= 5:
        badges.append("Explorer 🧭")
    if interactions >= 15:
        badges.append("Globetrotter 🌍")
    if comments >= 1:
        badges.append("Storyteller 💬")
    if likes_given >= 3:
        badges.append("Cheerleader ❤️")
    if trips >= 1:
        badges.append("Trip Planner 🗺️")

    return jsonify(
        {
            "username": _username(user_id),
            "stats": {
                "interactions": interactions,
                "comments": comments,
                "likes_given": likes_given,
                "trips": trips,
            },
            "badges": badges,
        }
    )


@app.post("/api/trips")
def create_trip():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    body = request.get_json(silent=True) or {}
    name = (body.get("name") or "").strip()
    stops = body.get("stops", [])
    if not name:
        return jsonify({"error": "name is required"}), 400
    if not isinstance(stops, list) or len(stops) < 2:
        return jsonify({"error": "a trip needs at least 2 stops"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO trips (user_id, name) VALUES (?, ?)", (user_id, name))
    trip_id = cursor.lastrowid
    for pos, stop in enumerate(stops):
        try:
            cursor.execute(
                "INSERT INTO trip_stops (trip_id, name, lat, lng, position) VALUES (?, ?, ?, ?, ?)",
                (trip_id, str(stop["name"]), float(stop["lat"]), float(stop["lng"]), pos),
            )
        except (KeyError, TypeError, ValueError):
            conn.close()
            return jsonify({"error": f"invalid stop at index {pos}"}), 400
    conn.commit()
    conn.close()
    return jsonify({"trip_id": trip_id})


@app.get("/api/trips")
def list_trips():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    conn = get_connection()
    rows = conn.execute(
        """
        SELECT t.id, t.name, t.created_at,
               json_group_array(json_object('name', s.name, 'lat', s.lat, 'lng', s.lng)) AS stops_json
        FROM trips t LEFT JOIN trip_stops s ON s.trip_id = t.id
        WHERE t.user_id = ? GROUP BY t.id ORDER BY t.id DESC
        """,
        (user_id,),
    ).fetchall()
    conn.close()
    trips = []
    for r in rows:
        d = dict(r)
        d["stops"] = json.loads(d.pop("stops_json"))
        # LEFT JOIN yields one null row for trips without stops
        if len(d["stops"]) == 1 and d["stops"][0]["name"] is None:
            d["stops"] = []
        trips.append(d)
    return jsonify({"trips": trips})


@app.delete("/api/trips/<int:trip_id>")
def delete_trip(trip_id: int):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    conn = get_connection()
    owner = conn.execute("SELECT user_id FROM trips WHERE id = ?", (trip_id,)).fetchone()
    if not owner or owner["user_id"] != user_id:
        conn.close()
        return jsonify({"error": "Not found"}), 404
    conn.execute("DELETE FROM trip_stops WHERE trip_id = ?", (trip_id,))
    conn.execute("DELETE FROM trips WHERE id = ?", (trip_id,))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
