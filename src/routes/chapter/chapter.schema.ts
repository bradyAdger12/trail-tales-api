import { SCHEMA_ACTIVITY_RETURN } from "../activity/activity.schema"

export const SCHEMA_ACTION_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        selected: { type: 'boolean' },
        description: { type: 'string' },
        difficulty: { type: 'string' },
        health: { type: 'number' },
        distance_in_meters: { type: 'number' }
    }
}
export const SCHEMA_CHAPTER_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        activity_id: { type: 'string' },
        activity: SCHEMA_ACTIVITY_RETURN,
        title: { type: 'string' },
        description: { type: 'string' },
        actions: { type: 'array', items: SCHEMA_ACTION_RETURN }
    }
}