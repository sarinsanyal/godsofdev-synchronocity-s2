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
    // Fetch all events directly from the database without any filtering
    const { data: events, error } = await supabase
      .from('events')
      .select('*');

    if (error) throw error;

    // Return the pure data payload
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

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: You must be logged in to create an event' });
    }

    // UPDATED: Added summary, address, and tags
    const { title, description, summary, category, tags, lat, lng, address, contact_email, contact_phone } = req.body;
    const file = req.file;
    let imageUrl = null;

    // Safely parse tags from form-data string into an array
    let parsedTags = null;
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        // Fallback if sent as comma-separated string
        parsedTags = typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : [];
      }
    }

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
        summary,         // NEW
        category,
        tags: parsedTags,// NEW
        organizer_id: userId,
        contact_email,
        contact_phone,
        address,         // NEW
        image_url: imageUrl,
        latitude: lat,   
        longitude: lng   
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

    // UPDATED: Added summary, address, and tags
    const { title, description, summary, category, tags, lat, lng, address, contact_email, contact_phone } = req.body;
    const file = req.file;
    let imageUrl = event.image_url; 

    // Safely parse tags
    let parsedTags = null;
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : [];
      }
    }

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

    // Prepare update payload with new fields
    const updatePayload: any = {
      title, 
      description, 
      summary,           // NEW
      category, 
      tags: parsedTags,  // NEW
      contact_email, 
      contact_phone, 
      address,           // NEW
      image_url: imageUrl
    };
    
    // Pass directly to preserve exact numeric precision
    if (lat && lng) {
      updatePayload.latitude = lat;
      updatePayload.longitude = lng;
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