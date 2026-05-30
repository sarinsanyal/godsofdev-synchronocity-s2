import { supabase } from '../config/supabase';

// ==========================================
// EVENT QUERIES
// ==========================================

/**
 * Fetches all events from the events table.
 */
export const getAllEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all events:', error.message);
    throw new Error(error.message);
  }
  return data;
};

/**
 * Fetches a single event by its UUID.
 */
export const getEventById = async (eventId: string) => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error) {
    console.error(`Error fetching event ${eventId}:`, error.message);
    throw new Error(error.message);
  }
  return data;
};

/**
 * Creates a new event.
 */
export const createEvent = async (eventData: any) => {
  const { data, error } = await supabase
    .from('events')
    .insert([eventData])
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error.message);
    throw new Error(error.message);
  }
  return data;
};

// ==========================================
// USER QUERIES
// ==========================================

/**
 * Fetches a user profile using their Clerk User ID.
 * (Crucial since you are using Clerk for auth!)
 */
export const getUserByClerkId = async (clerkUserId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore "Row not found" error
    console.error(`Error fetching user ${clerkUserId}:`, error.message);
    throw new Error(error.message);
  }
  return data;
};

/**
 * Creates or updates a user profile.
 */
export const upsertUser = async (userData: any) => {
  const { data, error } = await supabase
    .from('users')
    .upsert(userData, { onConflict: 'clerk_user_id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting user:', error.message);
    throw new Error(error.message);
  }
  return data;
};

// ==========================================
// RSVP QUERIES
// ==========================================

/**
 * Creates an RSVP for a user to an event.
 */
export const createRsvp = async (clerkUserId: string, eventId: string) => {
  const { data, error } = await supabase
    .from('rsvps')
    .insert([{ clerk_user_id: clerkUserId, event_id: eventId }])
    .select()
    .single();

  if (error) {
    console.error('Error creating RSVP:', error.message);
    throw new Error(error.message);
  }
  return data;
};

/**
 * Fetches all RSVPs for a specific event (useful for seeing who is attending).
 */
export const getEventRsvps = async (eventId: string) => {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .eq('event_id', eventId);

  if (error) {
    console.error(`Error fetching RSVPs for event ${eventId}:`, error.message);
    throw new Error(error.message);
  }
  return data;
};

// ==========================================
// INTERACTION QUERIES (ANALYTICS / RECOMMENDATIONS)
// ==========================================

/**
 * Logs a user interaction (like viewing, clicking, or saving an event).
 */
export const logUserInteraction = async (interactionData: {
  clerk_user_id: string;
  event_id: string;
  interaction_type: string;
  score?: number;
}) => {
  const { data, error } = await supabase
    .from('user_interactions')
    .insert([interactionData])
    .select()
    .single();

  if (error) {
    console.error('Error logging user interaction:', error.message);
    throw new Error(error.message);
  }
  return data;
};