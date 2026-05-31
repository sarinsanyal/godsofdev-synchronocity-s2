"""
Campus Event Recommendation Engine
FastAPI service — runs on port 5000
Called by Express: GET /recommend?user_id=...&lat=...&lng=...
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from recommender import HybridRecommender
from db import fetch_events, fetch_user_interactions

app = FastAPI(title="Campus Event Recommender", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Singleton recommender — loaded once at startup
recommender = HybridRecommender()


@app.on_event("startup")
async def startup_event():
    """Pre-warm the model on startup."""
    print("✅ Recommendation engine ready.")


@app.get("/recommend")
async def recommend(
    user_id: str = Query(..., description="Clerk user ID"),
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    limit: int = Query(20, description="Max events to return"),
):
    """
    Returns a ranked list of events for the given user + location.
    Response shape: [{ event_id: str, reason: str }, ...]
    This matches what the Express /recommendations route expects.
    """
    try:
        # 1. Pull live data from Supabase
        events = await fetch_events(lat, lng, radius_meters=10_000)
        interactions = await fetch_user_interactions(user_id)

        if not events:
            return []

        # 2. Run hybrid scoring
        ranked = recommender.rank(
            user_id=user_id,
            user_lat=lat,
            user_lng=lng,
            events=events,
            interactions=interactions,
            limit=limit,
        )

        return ranked

    except Exception as e:
        print(f"Recommendation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)