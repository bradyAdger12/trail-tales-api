import { SCHEMA_DAYS_RETURN } from "../survival_day/survival_day.schema"

export const SCHEMA_CHARACTER_TEMPLATE = {
    type: 'object',
    properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        health: { type: 'number' },
        food: { type: 'number' },
        water: { type: 'number' }
    }
}

export const SCHEMA_GAME_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        character: SCHEMA_CHARACTER_TEMPLATE,
        survival_days: SCHEMA_DAYS_RETURN   
    }
}

