// import { FastifyPluginAsync } from "fastify";
// import _ from "lodash";
// import { SCHEMA_CHARACTERS_RETURN } from "./character.schema";
// import { prisma } from "../../db";

// const characterRoutes: FastifyPluginAsync = async (fastify) => {
//     fastify.get('/', {
//         schema: {
//             security: [{ bearerAuth: [] }],
//             description: 'Fetch characters',
//             tags: ['character'],
//             response: {
//                 200: SCHEMA_CHARACTERS_RETURN
//             }
//         }
//     }, async (request, reply) => {
//         try {
//             const characters = await prisma.character.findMany()
//             return characters
//         } catch (e) {
//             return reply.status(500).send(e as string)
//         }
//     })
// }

// export default characterRoutes