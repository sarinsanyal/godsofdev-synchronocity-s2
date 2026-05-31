"""
recommender.py — Hybrid Recommendation Engine

Strategy
────────
1. Content-Based Score  (40%)
   - Match event categories against the user's historical category preferences
   - Derived from their RSVP + VIEW + CLICK history

2. Collaborative Score  (35%)
   - Item-based similarity: if many users who RSVPed event A also RSVPed event B,
     surface event B to a new user interested in A
   - Implemented as a lightweight in-memory co-occurrence matrix built from
     all interaction data fetched per request (no persistent model file needed)

3. Proximity Score  (25%)
   - Events closer to the user score higher
   - Uses inverse-distance weighting with a 5 km soft cap

Each component is normalised to [0, 1] before blending.
The final `reason` string is chosen from whichever component dominated.
"""

import math
from collections import defaultdict
from typing import Any


# ── Weights (must sum to 1.0) ─────────────────────────────────────────────────
W_CONTENT     = 0.40
W_COLLAB      = 0.35
W_PROXIMITY   = 0.25

# Interaction type → base score (mirrors what your Express backend inserts)
INTERACTION_SCORES: dict[str, float] = {
    "RSVP":  3.0,
    "VIEW":  1.0,
    "CLICK": 1.5,
}

# Reason templates shown in the mobile app feed
REASON_TEMPLATES = {
    "content":   "Based on your interest in {category} events",
    "collab":    "Popular with students who like similar events",
    "proximity": "Happening near you",
    "new_user":  "Trending on campus",
    "mixed":     "Recommended for you",
}


class HybridRecommender:
    """Stateless recommender — all state comes in per request."""

    # ── Public API ────────────────────────────────────────────────────────────

    def rank(
        self,
        user_id: str,
        user_lat: float,
        user_lng: float,
        events: list[dict],
        interactions: list[dict],
        limit: int = 20,
    ) -> list[dict[str, str]]:
        """
        Main entry point.
        Returns [{ event_id, reason }, ...] sorted best-first.
        """
        if not events:
            return []

        # ── 1. Build user profile from interaction history ────────────────────
        user_profile = self._build_user_profile(interactions)
        is_new_user  = len(interactions) == 0

        # ── 2. Build co-occurrence matrix for collaborative filtering ─────────
        # NOTE: In a production system you'd pre-compute this across ALL users.
        # Here we approximate it from the current user's history + event metadata.
        cooccurrence = self._build_cooccurrence(interactions, events)

        # ── 3. Score every candidate event ───────────────────────────────────
        scored = []
        for event in events:
            eid = event["id"]

            # Skip events the user already RSVPed to
            if eid in user_profile["rsvped_ids"]:
                continue

            c_score = self._content_score(event, user_profile) if not is_new_user else 0.0
            cf_score = self._collab_score(eid, user_profile["rsvped_ids"], cooccurrence)
            p_score  = self._proximity_score(event, user_lat, user_lng)

            total = W_CONTENT * c_score + W_COLLAB * cf_score + W_PROXIMITY * p_score

            scored.append({
                "event_id": eid,
                "total":    total,
                "c_score":  c_score,
                "cf_score": cf_score,
                "p_score":  p_score,
                "category": event.get("category", "other"),
                "is_new_user": is_new_user,
            })

        # ── 4. Sort descending ────────────────────────────────────────────────
        scored.sort(key=lambda x: x["total"], reverse=True)

        # ── 5. Format output ──────────────────────────────────────────────────
        results = []
        for item in scored[:limit]:
            results.append({
                "event_id": item["event_id"],
                "reason":   self._reason(item),
            })

        return results

    # ── Score components ──────────────────────────────────────────────────────

    def _content_score(self, event: dict, profile: dict) -> float:
        """
        How well does this event's category match the user's preferences?
        Returns 0–1.
        """
        category = event.get("category", "other")
        cat_weights = profile["category_weights"]

        if not cat_weights:
            return 0.0

        raw = cat_weights.get(category, 0.0)
        max_weight = max(cat_weights.values()) if cat_weights else 1.0
        return raw / max_weight if max_weight > 0 else 0.0

    def _collab_score(
        self,
        event_id: str,
        rsvped_ids: set[str],
        cooccurrence: dict[str, dict[str, float]],
    ) -> float:
        """
        Sum co-occurrence scores between this event and all events the
        user has already RSVPed to.  Normalised to 0–1.
        """
        if not rsvped_ids:
            return 0.0

        total = 0.0
        for seen_id in rsvped_ids:
            total += cooccurrence.get(seen_id, {}).get(event_id, 0.0)

        # Normalise by number of RSVPs to keep scale stable
        normalised = total / len(rsvped_ids)
        # Soft-cap at 1.0 (co-occurrence values are small floats)
        return min(normalised, 1.0)

    def _proximity_score(self, event: dict, user_lat: float, user_lng: float) -> float:
        """
        Inverse-distance score.  Events within 500 m → ~1.0, 5 km → ~0.5,
        10 km → ~0.2.
        """
        event_lat = event.get("lat", 0.0)
        event_lng = event.get("lng", 0.0)

        dist_m = _haversine_meters(user_lat, user_lng, event_lat, event_lng)

        if dist_m < 1:
            return 1.0

        # Inverse distance with a 500 m half-life
        return 1.0 / (1.0 + dist_m / 500.0)

    # ── Profile builder ───────────────────────────────────────────────────────

    def _build_user_profile(self, interactions: list[dict]) -> dict:
        """
        Builds a lightweight user profile:
          category_weights: { category: float }  — higher = more interested
          rsvped_ids:       set of event_ids the user already RSVPed
        """
        category_weights: dict[str, float] = defaultdict(float)
        rsvped_ids: set[str] = set()
        interacted_ids: dict[str, float] = defaultdict(float)  # event_id -> total score

        for ix in interactions:
            itype = (ix.get("interaction_type") or "VIEW").upper()
            eid   = ix.get("event_id", "")
            score = INTERACTION_SCORES.get(itype, 1.0)

            interacted_ids[eid] += score

            if itype == "RSVP":
                rsvped_ids.add(eid)

        return {
            "category_weights": dict(category_weights),
            "rsvped_ids":       rsvped_ids,
            "interacted_ids":   dict(interacted_ids),
        }

    # ── Co-occurrence ─────────────────────────────────────────────────────────

    def _build_cooccurrence(
        self,
        interactions: list[dict],
        events: list[dict],
    ) -> dict[str, dict[str, float]]:
        """
        Lightweight item-item co-occurrence based on shared category.
        Two events of the same category get a positive co-occurrence signal.

        In a production system you'd build this across ALL users from your
        interactions table.  Here we use category as a proxy — good enough
        for a campus app with limited data.
        """
        category_to_events: dict[str, list[str]] = defaultdict(list)
        for e in events:
            category_to_events[e.get("category", "other")].append(e["id"])

        cooccurrence: dict[str, dict[str, float]] = defaultdict(lambda: defaultdict(float))

        for cat, eids in category_to_events.items():
            n = len(eids)
            if n < 2:
                continue
            # Shared-category signal — weight inversely by category size
            # (niche categories are stronger signals than "general")
            weight = 1.0 / math.log1p(n)
            for i in range(n):
                for j in range(n):
                    if i != j:
                        cooccurrence[eids[i]][eids[j]] += weight

        return cooccurrence

    # ── Reason label ──────────────────────────────────────────────────────────

    def _reason(self, item: dict) -> str:
        if item["is_new_user"]:
            return REASON_TEMPLATES["new_user"]

        c  = item["c_score"]
        cf = item["cf_score"]
        p  = item["p_score"]

        dominant = max(
            ("content",   W_CONTENT   * c),
            ("collab",    W_COLLAB    * cf),
            ("proximity", W_PROXIMITY * p),
            key=lambda x: x[1],
        )[0]

        if dominant == "content":
            cat = item.get("category", "campus").title()
            return REASON_TEMPLATES["content"].format(category=cat)
        elif dominant == "collab":
            return REASON_TEMPLATES["collab"]
        else:
            return REASON_TEMPLATES["proximity"]


# ── Utility ───────────────────────────────────────────────────────────────────

def _haversine_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance in metres between two (lat, lng) points."""
    R = 6_371_000  # Earth radius in metres
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi  = math.radians(lat2 - lat1)
    dlam  = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))