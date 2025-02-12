import { SCHEMA_USER_RETURN } from "../user/user.schema"

export const SCHEMA_ACTIVITY_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        user: SCHEMA_USER_RETURN,
        polyline: { type: 'string' },
        source: { type: 'string' },
        source_id: { type: 'string' },
        distance_in_meters: { type: 'number' },
        elapsed_time_in_seconds: { type: 'number' }
    }
}

export const SCHEMA_ACTIVITIES_RETURN = {
    type: 'array',
    properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        polyline: { type: 'string' },
        source: { type: 'string' },
        source_id: { type: 'string' },
        distance_in_meters: { type: 'number' },
        elapsed_time_in_seconds: { type: 'number' }
    }
}