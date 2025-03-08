export const SCHEMA_STORY_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        difficulty: { type: 'string' }
    }
}

export const SCHEMA_STORIES_RETURN = {
    type: 'array',
    properties: SCHEMA_STORY_RETURN
}