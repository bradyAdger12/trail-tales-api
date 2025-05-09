export const SCHEMA_GAME_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        days: { type: 'number' },
        difficulty: { type: 'string' },
        health: { type: 'number' },
        thirst: { type: 'number' },
        hunger: { type: 'number' }
    }
}

