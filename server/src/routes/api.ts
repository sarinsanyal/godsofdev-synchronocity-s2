import { Router, Request, Response } from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase';

const router = Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// ==========================================
// 1. GET EVENTS (Map Feed)
// ==========================================
router.get('/events', async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng || !radius) {
      return res.status(400).json({ error: 'Missing lat, lng, or radius parameters' });
    }

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
// 2. POST EVENT (Any User Creation)
// ==========================================
router.post('/events', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-mock-user-id'] as string;

    // CHANGED: Any logged-in user can now create an event
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: You must be logged in to create an event' });
    }

    const { title, description, category, lat, lng, contact_email, contact_phone } = req.body;
    const file = req.file;
    let imageUrl = null;

    if (file) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
      const fileName = `events/${uniqueSuffix}-${cleanFileName}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('event-images')
        .upload(fileName, file.buffer, { contentType: file.mimetype });

      if (storageError) throw new Error(`Storage upload failed: ${storageError.message}`);

      const { data: publicUrlData } = supabase.storage
        .from('event-images')
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    const { data: newEvent, error } = await supabase
      .from('events')
      .insert([{
        title,
        description,
        category,
        organizer_id: userId,
        contact_email,
        contact_phone,
        image_url: imageUrl,
        location: `POINT(${lng} ${lat})` 
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, event: newEvent });
  } catch (error: any) {
    console.error('Create Event Error:', error);
    res.status(500).json({ error: error.message || 'Failed to create event' });
  }
});

// ==========================================
// 3. PUT EVENT (Update with Ownership Check)
// ==========================================
router.put('/events/:eventId', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-mock-user-id'] as string;
    const { eventId } = req.params;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // 1. Fetch event to verify ownership
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('organizer_id, image_url')
      .eq('id', eventId)
      .single();

    if (fetchError || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // 2. Ownership Check
    if (event.organizer_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You can only edit your own events' });
    }

    const { title, description, category, lat, lng, contact_email, contact_phone } = req.body;
    const file = req.file;
    let imageUrl = event.image_url; // Default to existing image

    // 3. Process new image if uploaded
    if (file) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
      const fileName = `events/${uniqueSuffix}-${cleanFileName}`;

      const { error: storageError } = await supabase.storage
        .from('event-images')
        .upload(fileName, file.buffer, { contentType: file.mimetype });

      if (storageError) throw new Error(`Storage upload failed: ${storageError.message}`);

      const { data: publicUrlData } = supabase.storage
        .from('event-images')
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    // Prepare update payload. Only update location if lat/lng are provided
    const updatePayload: any = {
      title, description, category, contact_email, contact_phone, image_url: imageUrl
    };
    if (lat && lng) {
      updatePayload.location = `POINT(${lng} ${lat})`;
    }

    // 4. Update the database
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update(updatePayload)
      .eq('id', eventId)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({ success: true, event: updatedEvent });
  } catch (error: any) {
    console.error('Update Event Error:', error);
    res.status(500).json({ error: error.message || 'Failed to update event' });
  }
});

// ==========================================
// 4. POST RSVP
// ==========================================
router.post('/rsvp', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-mock-user-id'] as string;
    const { eventId } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!eventId) return res.status(400).json({ error: 'Event ID required' });

    const { error: rsvpError } = await supabase
      .from('rsvps')
      .insert([{ clerk_user_id: userId, event_id: eventId }]);

    if (rsvpError) throw rsvpError;

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
// 5. GET RECOMMENDATIONS (ML Proxy)
// ==========================================
router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-mock-user-id'] as string;
    const { lat, lng } = req.query;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const mlResponse = await fetch(`http://localhost:5000/recommend?user_id=${userId}&lat=${lat}&lng=${lng}`);
    const rankedEventIds = await mlResponse.json(); 

    if (!rankedEventIds || rankedEventIds.length === 0) {
        return res.status(200).json([]);
    }

    const ids = rankedEventIds.map((item: any) => item.event_id);

    const { data: eventsData, error } = await supabase
      .from('events')
      .select('*')
      .in('id', ids);

    if (error) throw error;

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