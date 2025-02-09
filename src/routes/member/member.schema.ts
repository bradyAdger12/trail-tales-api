export const SCHEMA_MEMBER_RETURN = {
    type: 'object',
    properties: {
        _count: { properties: { members: { type: 'number' }} },
        id: { type: 'string' },
        name: { type: 'string' },
        members: { type: 'array' },
        owner_id: { type: 'string' },
        description: { type: 'string' },
        created_at: { type: 'string' },
        updated_at: { type: 'string' },
    }
}