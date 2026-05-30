..................API.ts..............
Here is a breakdown of exactly what each of the four routes in that file is doing:

1. GET /events (The Map Populator)
What it does: This route powers the core campus map. The mobile app sends the user's current GPS coordinates (lat, lng) and a search radius.

The Magic: Instead of pulling down every event in the database, it uses supabase.rpc() to trigger the get_events_within_radius PostGIS spatial function we wrote in SQL. It returns only the events physically close to the user.

2. POST /events (The Organizer Hub)
What it does: This allows event organizers to publish new events to the platform.

The Security: Right now, it checks the x-mock-user-role header to ensure only "admins" can create events.

The Magic: It takes the form data (title, category, contact info) and inserts it into the events table. Crucially, it converts the raw latitude and longitude into a specialized POINT(lng lat) format that PostGIS requires for spatial indexing.

3. POST /rsvp (The Data Collector)
What it does: Handles the logic when a user clicks the "Going" button on an event.

The Magic: It does two distinct things in the database simultaneously:

It logs the actual RSVP into the rsvps table so the user's status is updated.

It writes a high-value score (3.0) into the user_interactions table. This is essential, as this table is the "fuel" that the collaborative filtering ML model uses to learn what users actually like.

4. GET /recommendations (The "Smart" Proxy)
What it does: This route powers the personalized "For You" feed in the mobile app.

The Magic: It acts as a middleman (proxy) to merge your two different tech stacks:

It first pings the Flask Python service (http://localhost:5000/recommend) and says, "Give me the top event IDs for this specific user."

The Python service returns a list of ranked IDs and the AI reasoning (e.g., "🔥 Popular with tech students"), but it doesn't have the event titles or images.

api.ts then takes those IDs, asks Supabase for the full event details, stitches the ML reasoning and the database details together, and sends the completed "hydrated" cards back to the mobile feed.