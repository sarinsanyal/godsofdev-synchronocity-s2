This document outlines the core API routes handled by the api.ts router. All routes defined here are mounted under the /api prefix in server.ts (e.g., /events becomes /api/events).1. Get Events (Map Feed)Fetches a list of events within a specific geographic radius using PostGIS.URL: /api/eventsMethod: GETAuth Required: NoQuery ParametersParameterTypeRequiredDescriptionlatFloatYesUser's current latitudelngFloatYesUser's current longituderadiusIntegerYesSearch radius in metersSuccess Response (200 OK)Returns an array of event objects matching the radius criteria.JSON[
  {
    "id": "uuid",
    "title": "Hackathon 2024",
    "lat": 22.5726,
    "lng": 88.3639,
    "...": "other event fields"
  }
]
2. Create Event (Admin)Creates a new event and uploads an associated banner image to Supabase Storage.URL: /api/eventsMethod: POSTAuth Required: Yes (Admin only)Content-Type: multipart/form-data (Important: Do not send as JSON)HeadersHeaderRequiredDescriptionx-mock-user-idYesThe creator's user IDx-mock-user-roleYesMust be set to adminForm Data Payloadtitle (Text)description (Text)category (Text)lat (Float)lng (Float)contact_email (Text)contact_phone (Text)image (File) - The image file to uploadSuccess Response (201 Created)JSON{
  "success": true,
  "event": {
    "id": "uuid",
    "title": "Hackathon 2024",
    "image_url": "https://<supabase-url>/storage/v1/object/public/event-images/...",
    "...": "other event fields"
  }
}
3. Post RSVPRegisters a user for an event and logs the interaction to feed the Machine Learning recommendation pipeline.URL: /api/rsvpMethod: POSTAuth Required: YesContent-Type: application/jsonHeadersHeaderRequiredDescriptionx-mock-user-idYesThe user's IDJSON BodyJSON{
  "eventId": "uuid-of-the-event"
}
Success Response (200 OK)JSON{
  "success": true,
  "message": "RSVP confirmed!"
}
4. Get ML RecommendationsProxies a request to the local Flask ML service to get personalized event recommendations, then hydrates those IDs with full database records from Supabase.URL: /api/recommendationsMethod: GETAuth Required: YesHeadersHeaderRequiredDescriptionx-mock-user-idYesThe user's IDQuery ParametersParameterTypeRequiredDescriptionlatFloatNoUsed by ML to rank by distancelngFloatNoUsed by ML to rank by distanceSuccess Response (200 OK)Returns an array of event objects, appended with the AI's reasoning.JSON[
  {
    "id": "uuid",
    "title": "AI Workshop",
    "...": "other event fields",
    "ml_reason": "Based on your high engagement with 'Technology' events."
  }
]