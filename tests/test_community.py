# AGENT INSTRUCTION: Integration tests for community endpoints via Flask test client.
import pytest

pytest.importorskip("chromadb")
pytest.importorskip("langgraph")

from app import app as flask_app, get_connection, init_db


@pytest.fixture(scope="module")
def client():
    init_db()
    with flask_app.test_client() as c:
        yield c


@pytest.fixture(scope="module")
def auth(client):
    """Register a user, return auth headers."""
    resp = client.post(
        "/api/auth/register",
        json={
            "username": "tester_comm",
            "email": "comm@test.dev",
            "password": "secret123",
            "age": 30,
            "is_biker": False,
            "home_lat": 12.97,
            "home_lng": 77.59,
        },
    )
    assert resp.status_code == 200, resp.get_json()
    token = resp.get_json()["token"]
    return {"Authorization": f"Bearer {token}"}


def test_share_roundtrip(client, auth):
    places = [{"id": "1", "name": "Ooty", "lat": 11.4, "lng": 76.6, "status": "BUCKET_LIST"}]
    resp = client.post("/api/share", json={"places": places}, headers=auth)
    assert resp.status_code == 200
    token = resp.get_json()["token"]

    fetched = client.get(f"/api/share/{token}")
    assert fetched.status_code == 200
    body = fetched.get_json()
    assert body["owner"] == "tester_comm"
    assert body["places"][0]["name"] == "Ooty"


def test_share_requires_auth_and_payload(client):
    assert client.post("/api/share", json={"places": []}).status_code == 401
    assert client.post("/api/share", json={"places": []}, headers={"Authorization": "Bearer bad"}).status_code == 401


def test_like_toggle_and_count(client, auth):
    key = "like-test-place"
    r1 = client.post(f"/api/places/{key}/like", headers=auth).get_json()
    assert r1 == {"liked": True, "likes": 1}
    r2 = client.post(f"/api/places/{key}/like", headers=auth).get_json()
    assert r2 == {"liked": False, "likes": 0}

    info = client.get(f"/api/places/{key}/community").get_json()
    assert info["likes"] == 0 and info["comments"] == []


def test_comment_flow_and_validation(client, auth):
    key = "comment-test-place"
    assert client.post(f"/api/places/{key}/comments", json={"text": ""}, headers=auth).status_code == 400
    assert client.post(f"/api/places/{key}/comments", json={"text": "x" * 501}, headers=auth).status_code == 400
    assert client.post(f"/api/places/{key}/comments", json={"text": "nice!"}).status_code == 401

    ok = client.post(f"/api/places/{key}/comments", json={"text": "nice!"}, headers=auth)
    assert ok.status_code == 200

    info = client.get(f"/api/places/{key}/community").get_json()
    assert info["comments"][0]["text"] == "nice!"
    assert info["comments"][0]["username"] == "tester_comm"


def test_trip_crud_and_route_order(client, auth):
    stops = [
        {"name": "A", "lat": 10.0, "lng": 75.0},
        {"name": "B", "lat": 11.0, "lng": 76.0},
        {"name": "C", "lat": 12.0, "lng": 77.0},
    ]
    created = client.post("/api/trips", json={"name": "Test Trip", "stops": stops}, headers=auth)
    assert created.status_code == 200
    trip_id = created.get_json()["trip_id"]

    listing = client.get("/api/trips", headers=auth).get_json()["trips"]
    trip = next(t for t in listing if t["id"] == trip_id)
    assert [s["name"] for s in trip["stops"]] == ["A", "B", "C"]

    # validation: needs >= 2 stops
    assert client.post("/api/trips", json={"name": "X", "stops": stops[:1]}, headers=auth).status_code == 400

    assert client.delete(f"/api/trips/{trip_id}", headers=auth).status_code == 200
    assert all(t["id"] != trip_id for t in client.get("/api/trips", headers=auth).get_json()["trips"])


def test_leaderboard_ranks_loved_places(client, auth):
    conn = get_connection()
    conn.execute("DELETE FROM interactions WHERE place_id IN ('lb-a', 'lb-b')")
    conn.execute("INSERT INTO interactions (user_id, place_id, interaction_type) VALUES (1, 'lb-a', 'loved')")
    conn.execute("INSERT INTO interactions (user_id, place_id, interaction_type) VALUES (2, 'lb-a', 'loved')")
    conn.execute("INSERT INTO interactions (user_id, place_id, interaction_type) VALUES (1, 'lb-b', 'saved')")
    conn.commit()
    conn.close()

    board = client.get("/api/leaderboard").get_json()
    keys = [p["place_key"] for p in board["places"]]
    assert keys.index("lb-a") < keys.index("lb-b")


def test_profile_me_badges(client, auth):
    profile = client.get("/api/profile/me", headers=auth).get_json()
    assert profile["username"] == "tester_comm"
    assert isinstance(profile["badges"], list)
    assert client.get("/api/profile/me").status_code == 401
