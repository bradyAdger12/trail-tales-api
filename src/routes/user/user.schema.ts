export const SCHEMA_USER_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        display_name: { type: 'string' },
        health: { type: 'number' },
        hunger: { type: 'number' },
        thirst: { type: 'number' },
        avatar_file_key: { type: 'string' },
        threshold_pace_seconds: { type: 'number' },
        weekly_distance_in_kilometers: { type: 'number' },
        created_at: { type: 'string' },
        updated_at: { type: 'string' },
        strava_access_token: { type: 'string' },
        strava_refresh_token: { type: 'string' }
    }
}