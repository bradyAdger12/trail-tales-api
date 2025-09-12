export const SCHEMA_USER_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        display_name: { type: 'string' },
        timezone: { type: 'string' },
        unit: { type: 'string' },
        avatar_file_key: { type: 'string' },
        created_at: { type: 'string' },
        updated_at: { type: 'string' },
        strava_access_token: { type: 'string' },
        strava_refresh_token: { type: 'string' }
    }
}