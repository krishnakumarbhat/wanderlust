# AGENT INSTRUCTION: Unit tests for the recommendation pipeline (pytest).
import pytest

pytest.importorskip("chromadb")
pytest.importorskip("langgraph")

from pathlib import Path

from recommender import TravelRecommender


@pytest.fixture(scope="module")
def rec(tmp_path_factory):
    return TravelRecommender(
        data_path=Path(__file__).resolve().parent.parent / "backend" / "data" / "places.json",
        persist_path=tmp_path_factory.mktemp("chroma_test"),
    )


def base_state(rec, **overrides):
    """Build a RecommendationState with sensible defaults."""
    home = rec.places[0]
    state = {
        "user_profile": {
            "age": 30,
            "is_biker": False,
            "home_lat": home["lat"],
            "home_lng": home["lng"],
            "max_distance_km": None,
        },
        "all_places": rec.places,
        "interactions": [],
        "geo_candidates": [],
        "profile_candidates": [],
        "ranked_results": [],
    }
    state.update(overrides)
    return state


def test_haversine_known_distance(rec):
    # Bengaluru -> Chennai is roughly 290 km
    d = rec.haversine_km(12.9716, 77.5946, 13.0827, 80.2707)
    assert 250 < d < 340


def test_haversine_zero_and_symmetric(rec):
    assert rec.haversine_km(10.0, 20.0, 10.0, 20.0) == pytest.approx(0.0)
    assert rec.haversine_km(1.0, 2.0, 3.0, 4.0) == pytest.approx(rec.haversine_km(3.0, 4.0, 1.0, 2.0))


def test_geo_filter_excludes_visited(rec):
    visited = {"place_id": rec.places[0]["id"], "interaction_type": "loved"}
    out = rec._geo_filter_node(base_state(rec, interactions=[visited]))
    ids = {c["id"] for c in out["geo_candidates"]}
    assert rec.places[0]["id"] not in ids
    assert all("distance_km" in c for c in out["geo_candidates"])


def test_geo_filter_respects_max_distance(rec):
    out = rec._geo_filter_node(base_state(rec, user_profile={**base_state(rec)["user_profile"], "max_distance_km": 50}))
    assert all(c["distance_km"] <= 50 for c in out["geo_candidates"])


def test_profile_filter_rules(rec):
    candidates = [
        {"id": "a", "min_age": 18, "max_age": 40, "biker_friendly": True, "difficulty": "easy"},
        {"id": "b", "min_age": 30, "max_age": 50, "biker_friendly": False, "difficulty": "hard"},
        {"id": "c", "min_age": 0, "max_age": 99, "biker_friendly": True, "difficulty": "easy"},
    ]
    young_biker = base_state(rec, geo_candidates=candidates, user_profile={"age": 25, "is_biker": True})
    out = rec._profile_filter_node(young_biker)
    assert {p["id"] for p in out["profile_candidates"]} == {"a", "c"}

    older = base_state(rec, geo_candidates=candidates, user_profile={"age": 60, "is_biker": False})
    out = rec._profile_filter_node(older)
    # b is out of age range; hard difficulty is dropped for age >= 55
    assert [p["id"] for p in out["profile_candidates"]] == ["c"]

    mid_nonbiker = base_state(rec, geo_candidates=candidates, user_profile={"age": 35, "is_biker": False})
    out = rec._profile_filter_node(mid_nonbiker)
    assert {p["id"] for p in out["profile_candidates"]} == {"a", "b", "c"}


def test_rank_orders_desc_with_explanations(rec):
    candidates = [
        {"id": "near", "tags": ["beach"], "distance_km": 50},
        {"id": "far", "tags": ["mountain"], "distance_km": 1400},
    ]
    state = base_state(
        rec,
        profile_candidates=candidates,
        interactions=[{"place_id": "x", "interaction_type": "loved"}],
    )
    out = rec._rank_node(state)
    scores = [r["score"] for r in out["ranked_results"]]
    assert scores == sorted(scores, reverse=True)
    assert all(set(r["explain"]) == {"semantic", "tag_match", "distance", "social"} for r in out["ranked_results"])
