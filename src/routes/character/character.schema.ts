export const SCHEMA_CHARACTER_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        health: { type: 'number' }
    }
}

export const SCHEMA_CHARACTERS_RETURN = {
    type: 'array',
    properties: SCHEMA_CHARACTER_RETURN.properties
}