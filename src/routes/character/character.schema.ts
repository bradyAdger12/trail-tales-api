export const SCHEMA_CHARACTER_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        hunger: { type: 'string' },
        food: { type: 'string' },
        thirst: { type: 'string' }
    }
}

export const SCHEMA_CHARACTERS_RETURN = {
    type: 'array',
    properties: SCHEMA_CHARACTER_RETURN.properties
}