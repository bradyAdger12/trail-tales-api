import 'dotenv/config'
import _ from 'lodash'
import buildServer from "./server";
const server = buildServer()
// Start Fastify server
const main = async () => {
  try {
    const port = (process.env.PORT || 3000) as number
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on port ${port}`)
  } catch (err) {
    console.error(err)
    process.exit(1);
  }
};

main()