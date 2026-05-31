"""
db.py — Supabase data access for the ML service.
Reads events + user_interactions directly via the Supabase REST API
using the supabase-py client.
"""

import os
from typing import Any
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]  # use service role — ML service is server-side

_client: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


async def fetch_events(lat: float, lng: float, radius_meters: int = 10_000) -> list[dict]:
    """
    Fetch events within radius using the same PostGIS RPC your Express
    backend uses, so results are spatially consistent.
    Returns a flat list of event dicts, each with:
      id, title, category, location (lat/lng parsed), created_at
    """
    response = _client.rpc(
        "get_events_within_radius",
        {
            "user_lat": lat,
            "user_lng": lng,
            "search_radius_meters": radius_meters,
        },
    ).execute()

    events = response.data or []

    # Parse PostGIS POINT -> { lat, lng } so the recommender can use it
    parsed = []
    for e in events:
        parsed.append({
            "id": e["id"],
            "title": e.get("title", ""),
            "category": (e.get("category") or "other").lower().strip(),
            "lat": e.get("lat") or _extract_lat(e.get("location", "")),
            "lng": e.get("lng") or _extract_lng(e.get("location", "")),
            "created_at": e.get("created_at", ""),
            "organizer_id": e.get("organizer_id", ""),
        })
    return parsed


async def fetch_user_interactions(user_id: str) -> list[dict]:
    """
    Fetch all interaction records for a user.
    Each record: { event_id, interaction_type, score, created_at }
    interaction_type values: 'RSVP', 'VIEW', 'CLICK', etc.
    """
    response = (
        _client.table("user_interactions")
        .select("event_id, interaction_type, score, created_at")
        .eq("clerk_user_id", user_id)
        .order("created_at", desc=True)
        .limit(500)  # cap for performance
        .execute()
    )
    return response.data or []


async def fetch_event_categories(event_ids: list[str]) -> dict[str, str]:
    """
    Batch-fetch category for a list of event IDs.
    Returns { event_id: category }
    """
    if not event_ids:
        return {}
    response = (
        _client.table("events")
        .select("id, category")
        .in_("id", event_ids)
        .execute()
    )
    return {row["id"]: (row.get("category") or "other").lower() for row in (response.data or [])}


# ── Helpers ──────────────────────────────────────────────────────────────────

def _extract_lat(point_str: str) -> float:
    """Parse lat from PostGIS 'POINT(lng lat)' string."""
    try:
        coords = point_str.replace("POINT(", "").replace(")", "").split()
        return float(coords[1])
    except Exception:
        return 0.0


def _extract_lng(point_str: str) -> float:
    """Parse lng from PostGIS 'POINT(lng lat)' string."""
    try:
        coords = point_str.replace("POINT(", "").replace(")", "").split()
        return float(coords[0])
    except Exception:
        return 0.0