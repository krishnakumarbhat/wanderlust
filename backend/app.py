from __future__ import annotations

from pathlib import Path
from typing import Any

from flask import Flask, jsonify, request
from flask_cors import CORS
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from werkzeug.security import check_password_hash, generate_password_hash

from db import get_connection, init_db
from recommender import TravelRecommender


BASE_DIR = Path(__file__).resolve().parent
SECRET_KEY = "wanderlust-local-dev-secret"
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


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
