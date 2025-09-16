import { SCHEMA_DAYS_RETURN } from "../survival_day/survival_day.schema"

export const SCHEMA_CHARACTER_TEMPLATE = {
    type: 'object',
    properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        health: { type: 'number' },
        food: { type: 'number' },
        weekly_distance_in_kilometers: { type: 'number' },
        threshold_pace_in_seconds: { type: 'number' },
        water: { type: 'number' }
    }
}

export const SCHEMA_GAME_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        difficulty: { type: 'string' },
        character: SCHEMA_CHARACTER_TEMPLATE,
        survival_days: SCHEMA_DAYS_RETURN,
        status: { type: 'string' },
        daily_food_loss: { type: 'number' },
        daily_water_loss: { type: 'number' },
        min_distance_in_kilometers: { type: 'number' },
        max_distance_in_kilometers: { type: 'number' }
    }
}

