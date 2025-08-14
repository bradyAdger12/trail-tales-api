import { SCHEMA_ACTIVITY_RETURN } from "../activity/activity.schema"

export const SCHEMA_SURVIVAL_DAY_OPTION_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        description: { type: 'string' },
        difficulty: { type: 'string' },
        distance_in_kilometers: { type: 'number' },
        activity_id: { type: 'string' },
        activity: SCHEMA_ACTIVITY_RETURN,
        health_loss: { type: 'number' },
        chance_to_find_items: { type: 'number' },
    }
}
export const SCHEMA_SURVIVAL_DAY_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        game_id: { type: 'string' },
        description: { type: 'string' },
        day: { type: 'number' },
        options: {
            type: 'array',
            items: SCHEMA_SURVIVAL_DAY_OPTION_RETURN
        }
    }
}

export const SCHEMA_DAYS_RETURN = {
    type: 'array',
    items: SCHEMA_SURVIVAL_DAY_RETURN
}