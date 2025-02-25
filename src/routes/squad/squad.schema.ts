export const SCHEMA_SQUAD_RETURN = {
    type: 'object',
    properties: {
        _count: { properties: { members: { type: 'number' }} },
        id: { type: 'string' },
        name: { type: 'string' },
        members: { type: 'array' },
        level: { type: 'string' },
        wins: { type: 'number' },
        losses: { type: 'number' },
        xp: { type: 'number' },
        owner_id: { type: 'string' },
        description: { type: 'string' },
        created_at: { type: 'string' },
        updated_at: { type: 'string' },
    }
}

export const SCHEMA_SQUADS_REQUEST_RETURN = {
    type: 'array',
    properties: { 
        user_id: { type: 'string' },
        squad_id: { type: 'string' }, 
        created_at: { type: 'string' }
    }
}

export const SCHEMA_SQUADS_RETURN = {
    type: 'array',
    properties: {
        _count: { properties: { members: { type: 'number' }} },
        id: { type: 'string' },
        level: { type: 'string' },
        name: { type: 'string' },
        members: { type: 'array' },
        owner_id: { type: 'string' },
        description: { type: 'string' },
        created_at: { type: 'string' },
        updated_at: { type: 'string' },
    }
}