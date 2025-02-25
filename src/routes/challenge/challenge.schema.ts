export const SCHEMA_CHALLENGE_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        label: { type: 'string' },
        type: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
    }
}

export const SCHEMA_CHALLENGES_RETURN = {
    type: 'array',
    properties: SCHEMA_CHALLENGE_RETURN.properties
}