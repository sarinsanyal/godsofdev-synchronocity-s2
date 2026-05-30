import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// ==========================================
// 1. GET EVENTS (Map Feed)
// ==========================================
router.get('/events', async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng || !radius) {
      return res.status(400).json({ error: 'Missing lat, lng, or radius parameters' });
    }

    // Calls the PostGIS function you created in the SQL editor
    const { data: events, error } = await supabase.rpc('get_events_within_radius', {
      user_lat: parseFloat(lat as string),
      user_lng: parseFloat(lng as string),
      search_radius_meters: parseInt(radius as string, 10)
    });

    if (error) throw error;

    res.status(200).json(events);
  } catch (error) {
    console.error('Fetch Events Error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// ==========================================
// 2. POST EVENT (Admin Creation)
// ==========================================
router.post('/events', async (req: Request, res: Response) => {
  try {
    // TODO: Replace with Clerk auth later
    const userId = req.headers['x-mock-user-id'] as string;
    const userRole = req.headers['x-mock-user-role'] as string; 

    if (!userId || userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { title, description, category, lat, lng, contact_email, contact_phone } = req.body;

    const { data: newEvent, error } = await supabase
      .from('events')
      .insert([{
        title,
        description,
        category,
        organizer_id: userId,
        contact_email,
        contact_phone,
        location: `POINT(${lng} ${lat})` 
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, event: newEvent });
  } catch (error) {
    console.error('Create Event Error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// ==========================================
// 3. POST RSVP
// ==========================================
router.post('/rsvp', async (req: Request, res: Response) => {
  try {
    // TODO: Replace with Clerk auth later
    const userId = req.headers['x-mock-user-id'] as string;
    const { eventId } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!eventId) return res.status(400).json({ error: 'Event ID required' });

    // 1. Insert RSVP
    const { error: rsvpError } = await supabase
      .from('rsvps')
      .insert([{ clerk_user_id: userId, event_id: eventId }]);

    if (rsvpError) throw rsvpError;

    // 2. Log Interaction for ML pipeline
    const { error: interactionError } = await supabase
      .from('user_interactions')
      .insert([{
        clerk_user_id: userId,
        event_id: eventId,
        interaction_type: 'RSVP',
        score: 3.0
      }]);

    if (interactionError) throw interactionError;

    res.status(200).json({ success: true, message: 'RSVP confirmed!' });
  } catch (error) {
    console.error('RSVP Error:', error);
    res.status(500).json({ error: 'Failed to process RSVP' });
  }
});

// ==========================================
// 4. GET RECOMMENDATIONS (ML Proxy)
// ==========================================
router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-mock-user-id'] as string;
    const { lat, lng } = req.query;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Proxy request to Flask ML service running locally
    const mlResponse = await fetch(`http://localhost:5000/recommend?user_id=${userId}&lat=${lat}&lng=${lng}`);
    const rankedEventIds = await mlResponse.json(); 

    if (!rankedEventIds || rankedEventIds.length === 0) {
        return res.status(200).json([]);
    }

    const ids = rankedEventIds.map((item: any) => item.event_id);

    // Fetch full event details from Supabase
    const { data: eventsData, error } = await supabase
      .from('events')
      .select('*')
      .in('id', ids);

    if (error) throw error;

    // Merge ML reasonings with database rows
    const hydratedFeed = rankedEventIds.map((mlItem: any) => {
      const eventDetails = eventsData.find((e: any) => e.id === mlItem.event_id);
      return { ...eventDetails, ml_reason: mlItem.reason };
    });

    res.status(200).json(hydratedFeed);
  } catch (error) {
    console.error('ML Proxy Error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

export default router;