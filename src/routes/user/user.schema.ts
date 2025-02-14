import { SCHEMA_MATCHUP_ENTRIES_RETURN } from "../matchup/matchup.schema";

export const SCHEMA_USER_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        display_name: { type: 'string' },
        avatar_file_key: { type: 'string' },
        created_at: { type: 'string' },
        matchup_entries: SCHEMA_MATCHUP_ENTRIES_RETURN,
        updated_at: { type: 'string' },
        strava_access_token: { type: 'string' },
        strava_refresh_token: { type: 'string' }
    }
}