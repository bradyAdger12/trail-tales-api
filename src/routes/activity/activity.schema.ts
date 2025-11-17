export const SCHEMA_ACTIVITY_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        distance_in_meters: { type: 'number' },
        elapsed_time_in_seconds: { type: 'number' },
        polyline: { type: 'string' },
        user_id: { type: 'string' },
        source: { type: 'string' },
        source_id: { type: 'string' },
        source_created_at: { type: 'string' },
        created_at: { type: 'string' }
    }
}

export const SCHEMA_ACTIVITY_RETURN_ARRAY = {
    type: 'array',
    items: SCHEMA_ACTIVITY_RETURN
}