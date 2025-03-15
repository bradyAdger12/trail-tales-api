export const SCHEMA_ITEM_RETURN = {
    type: 'object',
    properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        benefit: { type: 'string' },
        value: { type: 'number' },
    }
}

export const SCHEMA_ITEMS_RETURN = {
    type: 'array',
    properties: SCHEMA_ITEM_RETURN.properties
}