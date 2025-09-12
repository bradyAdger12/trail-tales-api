import { SCHEMA_ACTIVITY_RETURN } from "../activity/activity.schema"

export const SCHEMA_SURVIVAL_DAY_OPTION_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        description: { type: 'string' },
        difficulty: { type: 'string' },
        distance_in_kilometers: { type: 'number' },
        food_gain_percentage: { type: 'number' },
        water_gain_percentage: { type: 'number' },
        health_gain_percentage: { type: 'number' }
    }
}
export const SCHEMA_SURVIVAL_DAY_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        game_id: { type: 'string' },
        activity_id: { type: 'string' },
        completed_difficulty: { type: 'string' },
        activity: SCHEMA_ACTIVITY_RETURN,
        day: { type: 'number' },
        created_at: { type: 'string' },
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