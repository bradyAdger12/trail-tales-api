export const SCHEMA_SQUAD_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        members: { type: 'array' },
        description: { type: 'string' },
        created_at: { type: 'string' },
        updated_at: { type: 'string' },
    }
}

export const SCHEMA_SQUADS_RETURN = {
    type: 'array',
    properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        members: { type: 'array' },
        description: { type: 'string' },
        created_at: { type: 'string' },
        updated_at: { type: 'string' },
    }
}