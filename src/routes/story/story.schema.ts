import { SCHEMA_CHAPTER_RETURN } from "../chapter/chapter.schema"

export const SCHEMA_STORY_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        cover_image_url: { type: 'string' },
        chapters: {
            type: 'array',
            items: SCHEMA_CHAPTER_RETURN
        },
        title: { type: 'string' },
        description: { type: 'string' },
        difficulty: { type: 'string' }
    }
}

export const SCHEMA_STORIES_RETURN = {
    type: 'array',
    properties: SCHEMA_STORY_RETURN.properties
}