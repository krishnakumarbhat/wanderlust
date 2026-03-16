from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any, TypedDict

import chromadb
from langgraph.graph import END, StateGraph
from llama_index.core import Document, StorageContext, VectorStoreIndex
from llama_index.embeddings.fastembed import FastEmbedEmbedding
from llama_index.vector_stores.chroma import ChromaVectorStore


class RecommendationState(TypedDict):
    user_profile: dict[str, Any]
    all_places: list[dict[str, Any]]
    interactions: list[dict[str, Any]]
    geo_candidates: list[dict[str, Any]]
    profile_candidates: list[dict[str, Any]]
    ranked_results: list[dict[str, Any]]


class TravelRecommender:
    def __init__(self, data_path: Path, persist_path: Path):
        with open(data_path, "r", encoding="utf-8") as f:
            self.places: list[dict[str, Any]] = json.load(f)

        self.place_map = {p["id"]: p for p in self.places}

        self.embedding_model = FastEmbedEmbedding(model_name="BAAI/bge-small-en-v1.5")
        client = chromadb.PersistentClient(path=str(persist_path))
        collection = client.get_or_create_collection("wanderlust_places")
        vector_store = ChromaVectorStore(chroma_collection=collection)
        storage_context = StorageContext.from_defaults(vector_store=vector_store)

        docs = [
            Document(
                text=(
                    f"{p['name']} tags: {', '.join(p['tags'])}; "
                    f"difficulty: {p['difficulty']}; biker_friendly: {p['biker_friendly']}"
                ),
                doc_id=p["id"],
                metadata={"place_id": p["id"]},
            )
            for p in self.places
        ]

        self.index = VectorStoreIndex.from_documents(
            docs,
            storage_context=storage_context,
            embed_model=self.embedding_model,
            show_progress=False,
        )

        self.graph = self._build_graph()

    @staticmethod
    def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        radius = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(math.radians(lat1))
            * math.cos(math.radians(lat2))
            * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return radius * c

    def _build_graph(self):
        workflow = StateGraph(RecommendationState)
        workflow.add_node("geo_filter", self._geo_filter_node)
        workflow.add_node("profile_filter", self._profile_filter_node)
        workflow.add_node("rank_candidates", self._rank_node)

        workflow.set_entry_point("geo_filter")
        workflow.add_edge("geo_filter", "profile_filter")
        workflow.add_edge("profile_filter", "rank_candidates")
        workflow.add_edge("rank_candidates", END)
        return workflow.compile()

    def _geo_filter_node(self, state: RecommendationState) -> RecommendationState:
        profile = state["user_profile"]
        home_lat = profile["home_lat"]
        home_lng = profile["home_lng"]
        is_biker = bool(profile["is_biker"])
        max_distance = profile.get("max_distance_km") or (1200 if is_biker else 600)

        visited = {x["place_id"] for x in state["interactions"]}
        candidates: list[dict[str, Any]] = []

        for place in state["all_places"]:
            if place["id"] in visited:
                continue
            distance = self.haversine_km(home_lat, home_lng, place["lat"], place["lng"])
            if distance <= max_distance:
                place_copy = dict(place)
                place_copy["distance_km"] = round(distance, 2)
                candidates.append(place_copy)

        state["geo_candidates"] = candidates
        return state

    def _profile_filter_node(self, state: RecommendationState) -> RecommendationState:
        profile = state["user_profile"]
        age = int(profile["age"])
        is_biker = bool(profile["is_biker"])

        filtered: list[dict[str, Any]] = []
        for place in state["geo_candidates"]:
            if age < place["min_age"] or age > place["max_age"]:
                continue
            if is_biker and not place["biker_friendly"]:
                continue
            if age >= 55 and place["difficulty"] == "hard":
                continue
            filtered.append(place)

        state["profile_candidates"] = filtered
        return state

    def _rank_node(self, state: RecommendationState) -> RecommendationState:
        candidates = state["profile_candidates"]
        if not candidates:
            state["ranked_results"] = []
            return state

        loved_ids = [
            i["place_id"]
            for i in state["interactions"]
            if i["interaction_type"] == "loved" and i["place_id"] in self.place_map
        ]
        saved_ids = [
            i["place_id"]
            for i in state["interactions"]
            if i["interaction_type"] == "saved" and i["place_id"] in self.place_map
        ]
        loved_tags = set()
        saved_tags = set()
        for place_id in loved_ids:
            loved_tags.update(self.place_map[place_id]["tags"])
        for place_id in saved_ids:
            saved_tags.update(self.place_map[place_id]["tags"])
        preference_tags = loved_tags.union(saved_tags)

        profile = state["user_profile"]
        query = (
            f"User likes {', '.join(sorted(preference_tags)) if preference_tags else 'mixed experiences'}. "
            f"Age {profile['age']}, biker {bool(profile['is_biker'])}. "
            "Recommend destinations matching these preferences."
        )

        retriever = self.index.as_retriever(similarity_top_k=15)
        retrieved_nodes = retriever.retrieve(query)
        semantic_scores = {
            node.metadata.get("place_id"): max(0.0, 1.0 - float(node.score or 0.0))
            for node in retrieved_nodes
            if node.metadata.get("place_id")
        }

        co_loved_counts: dict[str, int] = {}
        for item in state["interactions"]:
            if item["interaction_type"] == "loved":
                co_loved_counts[item["place_id"]] = co_loved_counts.get(item["place_id"], 0) + 1

        ranked = []
        for place in candidates:
            tags = set(place["tags"])
            loved_overlap = len(tags.intersection(loved_tags))
            saved_overlap = len(tags.intersection(saved_tags))
            tag_score = (loved_overlap + 0.5 * saved_overlap) / max(1, len(tags))
            distance_score = max(0.0, 1 - (place["distance_km"] / 1500))
            semantic_score = semantic_scores.get(place["id"], 0.0)
            social_score = min(1.0, co_loved_counts.get(place["id"], 0) / 5)
            final_score = (
                0.45 * semantic_score
                + 0.30 * tag_score
                + 0.15 * distance_score
                + 0.10 * social_score
            )

            ranked.append(
                {
                    **place,
                    "score": round(final_score, 4),
                    "explain": {
                        "semantic": round(semantic_score, 4),
                        "tag_match": round(tag_score, 4),
                        "distance": round(distance_score, 4),
                        "social": round(social_score, 4),
                    },
                }
            )

        ranked.sort(key=lambda x: x["score"], reverse=True)
        state["ranked_results"] = ranked
        return state

    def recommend(
        self,
        user_profile: dict[str, Any],
        interactions: list[dict[str, Any]],
        top_k: int = 5,
    ) -> list[dict[str, Any]]:
        initial_state: RecommendationState = {
            "user_profile": user_profile,
            "all_places": self.places,
            "interactions": interactions,
            "geo_candidates": [],
            "profile_candidates": [],
            "ranked_results": [],
        }
        result = self.graph.invoke(initial_state)
        return result["ranked_results"][:top_k]
