export const SCHEMA_SURVIVAL_DAY_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        game_id: { type: 'string' },
        description: { type: 'string' },
        day: { type: 'number' }
    }
}

export const SCHEMA_DAYS_RETURN = {
    type: 'array',
    items: SCHEMA_SURVIVAL_DAY_RETURN
}