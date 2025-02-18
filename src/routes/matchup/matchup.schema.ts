import { SCHEMA_CHALLENGE_RETURN } from "../challenge/challenge.schema";
import { SCHEMA_SQUAD_RETURN } from "../squad/squad.schema";

export const SCHEMA_MATCHUP_ENTRIES_RETURN = {
    type: 'array',
    properties: {
        value: { type: 'object' },
        user_id: { type: 'string' },
    }
}

export const SCHEMA_MATCHUP_RETURN = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        entries: SCHEMA_MATCHUP_ENTRIES_RETURN,
        challenge: SCHEMA_CHALLENGE_RETURN,
        squad_one: SCHEMA_SQUAD_RETURN,
        squad_two: SCHEMA_SQUAD_RETURN,
        starts_at: { type: 'string' },
        ends_at: { type: 'string' },
        created_at: { type: 'string' },
    }
}

export const SCHEMA_MATCHUPS_RETURN = {
    type: 'array',
    properties: {
        id: { type: 'string' },
        entries: SCHEMA_MATCHUP_ENTRIES_RETURN,
        challenge: SCHEMA_CHALLENGE_RETURN,
        squad_one: SCHEMA_SQUAD_RETURN,
        squad_two: SCHEMA_SQUAD_RETURN,
        starts_at: { type: 'string' },
        ends_at: { type: 'string' },
        created_at: { type: 'string' },
    }
}